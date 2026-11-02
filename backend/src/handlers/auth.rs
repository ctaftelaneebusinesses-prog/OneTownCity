use axum::{
    extract::{Path, State},
    http::{HeaderMap, HeaderValue, StatusCode, header::SET_COOKIE},
    response::{IntoResponse, Json, Response},
};
use chrono::Utc;
use serde_json::{Value, json};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::auth::{
    AdminUserContext, AuthenticatedUserContext, ContentProviderGuard, SESSION_COOKIE_NAME,
    SESSION_DURATION_SECS, generate_session_token, hash_password,
    validate_password_strength, verify_password,
};
use crate::models::{
    AuthResponseDto, AuthUserDto, CategoryExtensionItem, CategoryExtensionRequestDto,
    ClaimCreateDto, ClaimReviewDto, LoginDto, ModerationStatus, OrgRole, OwnershipClaimItem,
    PlanTier, RegisterDto, SessionItemDto, UserProfileDto, UserRole, UserTenantMembershipDto,
    VerticalType,
};

// ─────────────────────────────────────────────────────────────────────────────
// COOKIE HELPER
// ─────────────────────────────────────────────────────────────────────────────

fn build_session_cookie(raw_token: &str, max_age: i64) -> String {
    format!(
        "{}={}; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        SESSION_COOKIE_NAME, raw_token, max_age
    )
}

fn clear_session_cookie() -> String {
    format!(
        "{}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        SESSION_COOKIE_NAME
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────

pub async fn register(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(dto): Json<RegisterDto>,
) -> Result<Response, (StatusCode, Json<Value>)> {
    // 1. Email format check
    let email = dto.email.trim().to_lowercase();
    if !email.contains('@') || !email.contains('.') {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Invalid email address format" })),
        ));
    }

    // 2. Password policy check (min 8 chars, upper, lower, digit)
    if let Err(msg) = validate_password_strength(&dto.password) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": msg }))));
    }

    // 3. Name check
    let name = dto.name.trim();
    if name.len() < 2 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Name must be at least 2 characters" })),
        ));
    }

    // 4. Check if email already exists
    let existing = sqlx::query!("SELECT id FROM users WHERE email = $1", email)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to check existing user: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Database error checking user" })),
            )
        })?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({ "error": "An account with this email already exists" })),
        ));
    }

    // 5. Hash password with Argon2id
    let password_hash = hash_password(&dto.password).map_err(|e| {
        tracing::error!("Password hashing error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to securely hash password" })),
        )
    })?;

    // 6. Role selection (student by default, or content_provider / tenant_owner)
    let role = match dto.role {
        Some(UserRole::ContentProvider) => UserRole::ContentProvider,
        Some(UserRole::TenantOwner) => UserRole::TenantOwner,
        _ => UserRole::Student,
    };

    let new_user_id = Uuid::new_v4();
    let now = Utc::now();

    // 7. Insert user
    sqlx::query!(
        r#"
        INSERT INTO users (id, email, name, role, password_hash, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4::user_role, $5, TRUE, $6, $6)
        "#,
        new_user_id,
        email,
        name,
        role as _,
        password_hash,
        now
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create user: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error creating user" })),
        )
    })?;

    // 8. If tenant_owner and organization_name provided, create initial organization
    let mut tenant_info = None;
    if role == UserRole::TenantOwner
        && let Some(org_name) = dto.organization_name.filter(|n| !n.trim().is_empty())
    {
            let org_slug = format!(
                "{}-{}",
                slugify(&org_name),
                &new_user_id.to_string()[..6]
            );
            let vertical = dto.vertical.unwrap_or(VerticalType::Business);
            let city = dto.city.unwrap_or_else(|| "Nellore".to_string());
            let org_id = Uuid::new_v4();

            // Default Free plan
            let plan = sqlx::query!("SELECT id FROM plans WHERE tier = 'free' LIMIT 1")
                .fetch_one(&state.db)
                .await
                .map_err(|e| {
                    tracing::error!("Failed to fetch free plan: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "error": "Failed to assign initial plan" })),
                    )
                })?;

            sqlx::query!(
                r#"
                INSERT INTO organizations (id, name, slug, vertical, city, plan_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4::vertical_type, $5, $6, $7, $7)
                "#,
                org_id,
                org_name.trim(),
                org_slug,
                vertical as _,
                city,
                plan.id,
                now
            )
            .execute(&state.db)
            .await
            .map_err(|e| {
                tracing::error!("Failed to create tenant organization: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Database error creating organization" })),
                )
            })?;

            sqlx::query!(
                r#"
                INSERT INTO organization_members (organization_id, user_id, role, created_at)
                VALUES ($1, $2, 'owner'::org_role, $3)
                "#,
                org_id,
                new_user_id,
                now
            )
            .execute(&state.db)
            .await
            .map_err(|e| {
                tracing::error!("Failed to assign organization member: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Database error assigning membership" })),
                )
            })?;

            tenant_info = Some(UserTenantMembershipDto {
                organization_id: org_id,
                organization_name: org_name.trim().to_string(),
                vertical,
                city,
                role: OrgRole::Owner,
                plan_tier: PlanTier::Free,
            });
    }

    // 9. Create user session
    let (raw_token, token_hash) = generate_session_token();
    let expires_at = now + chrono::Duration::seconds(SESSION_DURATION_SECS);
    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());
    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or("").trim().to_string());

    sqlx::query!(
        r#"
        INSERT INTO user_sessions (id, user_id, token_hash, user_agent, ip_address, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        Uuid::new_v4(),
        new_user_id,
        token_hash,
        user_agent,
        ip_address,
        expires_at,
        now
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to record session: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error creating session" })),
        )
    })?;

    // 10. Audit log
    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "user".to_string(),
        entity_id: new_user_id.to_string(),
        action: "register".to_string(),
        actor_id: Some(new_user_id),
        actor_role: format!("{:?}", role),
        payload: json!({ "email": email, "role": format!("{:?}", role) }),
        simulate_dispatch: false,
    });

    let resp_body = AuthResponseDto {
        user: AuthUserDto {
            id: new_user_id,
            email,
            name: name.to_string(),
            role,
            is_active: true,
            created_at: now,
            last_login_at: Some(now),
        },
        token: raw_token.clone(),
        tenant: tenant_info,
    };

    let cookie_val = build_session_cookie(&raw_token, SESSION_DURATION_SECS);
    let mut response = (StatusCode::CREATED, Json(resp_body)).into_response();
    if let Ok(val) = HeaderValue::from_str(&cookie_val) {
        response.headers_mut().insert(SET_COOKIE, val);
    }

    Ok(response)
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────

pub async fn login(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(dto): Json<LoginDto>,
) -> Result<Response, (StatusCode, Json<Value>)> {
    let email = dto.email.trim().to_lowercase();

    // 1. Fetch user by email
    let user = sqlx::query!(
        r#"
        SELECT id, email, name, role as "role: UserRole", password_hash, is_active, created_at
        FROM users
        WHERE email = $1
        "#,
        email
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error fetching user: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    let user = match user {
        Some(u) => u,
        None => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Invalid email or password" })),
            ));
        }
    };

    // 2. Check active status
    if !user.is_active {
        return Err((
            StatusCode::FORBIDDEN,
            Json(json!({ "error": "This account has been deactivated" })),
        ));
    }

    // 3. Verify Argon2id password
    let valid = verify_password(&dto.password, &user.password_hash);
    if !valid {
        return Err((
            StatusCode::UNAUTHORIZED,
            Json(json!({ "error": "Invalid email or password" })),
        ));
    }

    // 4. Update last_login_at
    let now = Utc::now();
    let _ = sqlx::query!(
        "UPDATE users SET last_login_at = $1 WHERE id = $2",
        now,
        user.id
    )
    .execute(&state.db)
    .await;

    // 5. Create new session (30-day token)
    let (raw_token, token_hash) = generate_session_token();
    let expires_at = now + chrono::Duration::seconds(SESSION_DURATION_SECS);
    let user_agent = headers
        .get("user-agent")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.to_string());
    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|h| h.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or("").trim().to_string());

    sqlx::query!(
        r#"
        INSERT INTO user_sessions (id, user_id, token_hash, user_agent, ip_address, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        Uuid::new_v4(),
        user.id,
        token_hash,
        user_agent,
        ip_address,
        expires_at,
        now
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to record session: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error creating session" })),
        )
    })?;

    // 6. Query tenant membership if any
    let membership = sqlx::query!(
        r#"
        SELECT o.id as org_id, o.name as org_name, o.vertical as "vertical: VerticalType", o.city,
               om.role as "member_role: OrgRole", p.tier as "plan_tier: PlanTier"
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        JOIN plans p ON p.id = o.plan_id
        WHERE om.user_id = $1
        LIMIT 1
        "#,
        user.id
    )
    .fetch_optional(&state.db)
    .await
    .ok()
    .flatten();

    let tenant_dto = membership.map(|m| UserTenantMembershipDto {
        organization_id: m.org_id,
        organization_name: m.org_name,
        vertical: m.vertical,
        city: m.city,
        role: m.member_role,
        plan_tier: m.plan_tier,
    });

    let resp_body = AuthResponseDto {
        user: AuthUserDto {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            last_login_at: Some(now),
        },
        token: raw_token.clone(),
        tenant: tenant_dto,
    };

    let cookie_val = build_session_cookie(&raw_token, SESSION_DURATION_SECS);
    let mut response = (StatusCode::OK, Json(resp_body)).into_response();
    if let Ok(val) = HeaderValue::from_str(&cookie_val) {
        response.headers_mut().insert(SET_COOKIE, val);
    }

    Ok(response)
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────────

pub async fn logout(
    State(state): State<Arc<AppState>>,
    auth: AuthenticatedUserContext,
) -> Result<Response, (StatusCode, Json<Value>)> {
    if let Some(sid) = auth.session_id {
        let _ = sqlx::query!(
            "UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1 AND user_id = $2",
            sid,
            auth.user_id
        )
        .execute(&state.db)
        .await;
    }

    let cookie_val = clear_session_cookie();
    let mut response = (
        StatusCode::OK,
        Json(json!({ "status": "ok", "message": "Logged out successfully" })),
    )
        .into_response();

    if let Ok(val) = HeaderValue::from_str(&cookie_val) {
        response.headers_mut().insert(SET_COOKIE, val);
    }

    Ok(response)
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────

pub async fn get_me(
    State(state): State<Arc<AppState>>,
    auth: AuthenticatedUserContext,
) -> Result<Json<UserProfileDto>, (StatusCode, Json<Value>)> {
    // 1. Fetch user record
    let user = sqlx::query!(
        r#"
        SELECT id, email, name, role as "role: UserRole", is_active, created_at, last_login_at
        FROM users
        WHERE id = $1
        "#,
        auth.user_id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch user in me: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    // 2. Compute permissions list based on RBAC role
    let permissions = match user.role {
        UserRole::SuperAdmin => vec![
            "admin:all".to_string(),
            "moderation:approve".to_string(),
            "moderation:reject".to_string(),
            "tenants:manage".to_string(),
            "audit:view".to_string(),
            "claims:review".to_string(),
        ],
        UserRole::CityAdmin => vec![
            "admin:city".to_string(),
            "moderation:approve".to_string(),
            "moderation:reject".to_string(),
            "audit:view".to_string(),
            "claims:review".to_string(),
        ],
        UserRole::SubAdmin => vec![
            "moderation:review".to_string(),
            "audit:view".to_string(),
            "claims:review".to_string(),
        ],
        UserRole::ContentProvider => vec![
            "content:submit".to_string(),
            "categories:request".to_string(),
        ],
        UserRole::TenantOwner => vec![
            "tenant:manage".to_string(),
            "leads:view".to_string(),
            "offers:create".to_string(),
            "claims:submit".to_string(),
        ],
        UserRole::TenantStaff => vec![
            "leads:view".to_string(),
            "offers:create".to_string(),
        ],
        UserRole::Student => vec![
            "public:access".to_string(),
            "enquiry:submit".to_string(),
            "report:submit".to_string(),
        ],
    };

    // 3. Organization memberships
    let memberships = sqlx::query!(
        r#"
        SELECT o.id as org_id, o.name as org_name, o.vertical as "vertical: VerticalType", o.city,
               om.role as "member_role: OrgRole", p.tier as "plan_tier: PlanTier"
        FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        JOIN plans p ON p.id = o.plan_id
        WHERE om.user_id = $1
        "#,
        user.id
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let org_dtos: Vec<UserTenantMembershipDto> = memberships
        .into_iter()
        .map(|m| UserTenantMembershipDto {
            organization_id: m.org_id,
            organization_name: m.org_name,
            vertical: m.vertical,
            city: m.city,
            role: m.member_role,
            plan_tier: m.plan_tier,
        })
        .collect();

    // 4. Active sessions
    let sessions = sqlx::query!(
        r#"
        SELECT id, user_agent, ip_address, expires_at, created_at
        FROM user_sessions
        WHERE user_id = $1
          AND expires_at > NOW()
          AND revoked_at IS NULL
        ORDER BY created_at DESC
        "#,
        user.id
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let session_dtos: Vec<SessionItemDto> = sessions
        .into_iter()
        .map(|s| SessionItemDto {
            id: s.id,
            user_agent: s.user_agent,
            ip_address: s.ip_address,
            expires_at: s.expires_at,
            created_at: s.created_at,
            is_current: auth.session_id == Some(s.id),
        })
        .collect();

    Ok(Json(UserProfileDto {
        user: AuthUserDto {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
            last_login_at: user.last_login_at,
        },
        permissions,
        organizations: org_dtos,
        sessions: session_dtos,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/auth/sessions/{id}
// ─────────────────────────────────────────────────────────────────────────────

pub async fn revoke_session(
    State(state): State<Arc<AppState>>,
    auth: AuthenticatedUserContext,
    Path(session_id): Path<Uuid>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let result = sqlx::query!(
        r#"
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
        "#,
        session_id,
        auth.user_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to revoke session: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error revoking session" })),
        )
    })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Session not found or already revoked" })),
        ));
    }

    Ok(Json(json!({
        "status": "ok",
        "revoked_session_id": session_id
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/claims (Submit Directory Profile Ownership Claim)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn submit_ownership_claim(
    State(state): State<Arc<AppState>>,
    auth: crate::auth::OptionalUserContext,
    Json(dto): Json<ClaimCreateDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    // 1. Verify listing exists
    let listing = sqlx::query!(
        "SELECT id, name, city FROM listings WHERE id = $1",
        dto.listing_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to check listing: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error checking listing" })),
        )
    })?;

    let listing = match listing {
        Some(l) => l,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Listing not found" })),
            ));
        }
    };

    // 2. Resolve claimant user ID
    let claimant_id = if let Some(ref u) = auth.user {
        u.user_id
    } else {
        let email = dto.official_email.trim().to_lowercase();
        let existing = sqlx::query!("SELECT id FROM users WHERE email = $1", email)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| {
                tracing::error!("Failed to check claimant user: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Database error checking claimant user" })),
                )
            })?;

        match existing {
            Some(u) => u.id,
            None => {
                let new_id = Uuid::new_v4();
                let random_hash = hash_password(&Uuid::new_v4().to_string()).unwrap_or_default();
                sqlx::query!(
                    "INSERT INTO users (id, email, name, role, password_hash, is_active) VALUES ($1, $2, $3, 'tenant_owner'::user_role, $4, TRUE)",
                    new_id,
                    email,
                    dto.organization_name.trim(),
                    random_hash
                )
                .execute(&state.db)
                .await
                .map_err(|e| {
                    tracing::error!("Failed to create claimant user: {}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "error": "Database error creating claimant user" })),
                    )
                })?;
                new_id
            }
        }
    };

    let claim_id = Uuid::new_v4();
    let now = Utc::now();

    sqlx::query!(
        r#"
        INSERT INTO ownership_claims (
            id, listing_id, claimant_user_id, organization_name,
            official_email, official_phone, verification_evidence,
            status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_review'::moderation_status, $8)
        "#,
        claim_id,
        dto.listing_id,
        claimant_id,
        dto.organization_name.trim(),
        dto.official_email.trim(),
        dto.official_phone.trim(),
        dto.verification_evidence.trim(),
        now
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to insert claim: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error submitting claim" })),
        )
    })?;

    let actor_role = auth.user.as_ref().map(|u| format!("{:?}", u.role)).unwrap_or_else(|| "claimant".to_string());

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "ownership_claim".to_string(),
        entity_id: claim_id.to_string(),
        action: "claim_submitted".to_string(),
        actor_id: Some(claimant_id),
        actor_role,
        payload: json!({
            "listing_id": dto.listing_id,
            "listing_name": listing.name,
            "organization_name": dto.organization_name
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "pending_review",
            "claim_id": claim_id,
            "message": "Ownership claim submitted for administrative review."
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/claims (List User's Submitted Claims)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_my_claims(
    State(state): State<Arc<AppState>>,
    auth: AuthenticatedUserContext,
) -> Result<Json<Vec<OwnershipClaimItem>>, (StatusCode, Json<Value>)> {
    let claims = sqlx::query_as!(
        OwnershipClaimItem,
        r#"
        SELECT id, listing_id, claimant_user_id, organization_name,
               official_email, official_phone, verification_evidence,
               status as "status: ModerationStatus", reviewed_by, review_notes, created_at
        FROM ownership_claims
        WHERE claimant_user_id = $1
        ORDER BY created_at DESC
        "#,
        auth.user_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch claims: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error fetching claims" })),
        )
    })?;

    Ok(Json(claims))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/claims (Admin View of All Claims)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_all_claims(
    State(state): State<Arc<AppState>>,
    _admin: AdminUserContext,
) -> Result<Json<Vec<OwnershipClaimItem>>, (StatusCode, Json<Value>)> {
    let claims = sqlx::query_as!(
        OwnershipClaimItem,
        r#"
        SELECT id, listing_id, claimant_user_id, organization_name,
               official_email, official_phone, verification_evidence,
               status as "status: ModerationStatus", reviewed_by, review_notes, created_at
        FROM ownership_claims
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch all claims: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error fetching claims" })),
        )
    })?;

    Ok(Json(claims))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/claims/{id} (Approve / Reject Claim)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn action_claim(
    State(state): State<Arc<AppState>>,
    admin: AdminUserContext,
    Path(claim_id): Path<Uuid>,
    Json(dto): Json<ClaimReviewDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let claim = sqlx::query!(
        r#"
        SELECT id, listing_id, claimant_user_id, status as "status: ModerationStatus"
        FROM ownership_claims
        WHERE id = $1
        "#,
        claim_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch claim: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    let claim = match claim {
        Some(c) => c,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Claim not found" })),
            ));
        }
    };

    // Update claim status
    sqlx::query!(
        r#"
        UPDATE ownership_claims
        SET status = $1::moderation_status, reviewed_by = $2, review_notes = $3
        WHERE id = $4
        "#,
        dto.status as _,
        admin.user_id,
        dto.review_notes,
        claim_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to update claim: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error updating claim" })),
        )
    })?;

    // If approved, update listing verification_status to owner_claimed, promote user, and link to organization_members
    if dto.status == ModerationStatus::Approved {
        let _ = sqlx::query!(
            r#"
            UPDATE listings
            SET verification_status = 'owner_claimed'::verification_status, updated_at = NOW()
            WHERE id = $1
            "#,
            claim.listing_id
        )
        .execute(&state.db)
        .await;

        let _ = sqlx::query!(
            r#"
            UPDATE users
            SET role = 'tenant_owner'::user_role, updated_at = NOW()
            WHERE id = $1 AND role = 'student'::user_role
            "#,
            claim.claimant_user_id
        )
        .execute(&state.db)
        .await;

        if let Ok(Some(listing_row)) = sqlx::query!(
            "SELECT tenant_id FROM listings WHERE id = $1",
            claim.listing_id
        )
        .fetch_optional(&state.db)
        .await
        {
            let _ = sqlx::query!(
                r#"
                INSERT INTO organization_members (id, organization_id, user_id, role)
                VALUES ($1, $2, $3, 'owner'::org_role)
                ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner'::org_role
                "#,
                Uuid::new_v4(),
                listing_row.tenant_id,
                claim.claimant_user_id
            )
            .execute(&state.db)
            .await;
        }
    }

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "ownership_claim".to_string(),
        entity_id: claim_id.to_string(),
        action: format!("claim_{:?}", dto.status),
        actor_id: Some(admin.user_id),
        actor_role: format!("{:?}", admin.role),
        payload: json!({
            "status": dto.status,
            "listing_id": claim.listing_id,
            "claimant_id": claim.claimant_user_id
        }),
        simulate_dispatch: false,
    });

    Ok(Json(json!({
        "status": "ok",
        "claim_id": claim_id,
        "new_status": dto.status
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/categories/extensions (Content Provider Subcategory Requests)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn submit_category_extension(
    State(state): State<Arc<AppState>>,
    content_guard: ContentProviderGuard,
    Json(dto): Json<CategoryExtensionRequestDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let req_id = Uuid::new_v4();
    let now = Utc::now();

    sqlx::query!(
        r#"
        INSERT INTO category_extension_requests (
            id, requested_by, vertical, proposed_name, justification,
            status, created_at
        )
        VALUES ($1, $2, $3::vertical_type, $4, $5, 'pending_review'::moderation_status, $6)
        "#,
        req_id,
        content_guard.user_id,
        dto.vertical as _,
        dto.proposed_name.trim(),
        dto.justification.trim(),
        now
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to submit category extension request: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error submitting request" })),
        )
    })?;

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "category_extension_request".to_string(),
        entity_id: req_id.to_string(),
        action: "extension_requested".to_string(),
        actor_id: Some(content_guard.user_id),
        actor_role: format!("{:?}", content_guard.role),
        payload: json!({
            "vertical": dto.vertical,
            "proposed_name": dto.proposed_name
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "pending_review",
            "request_id": req_id,
            "message": "Category extension request submitted for administrative review."
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/categories/extensions
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_category_extensions(
    State(state): State<Arc<AppState>>,
    auth: AuthenticatedUserContext,
) -> Result<Json<Vec<CategoryExtensionItem>>, (StatusCode, Json<Value>)> {
    let is_admin = matches!(
        auth.role,
        UserRole::SuperAdmin | UserRole::CityAdmin | UserRole::SubAdmin
    );

    let items = if is_admin {
        sqlx::query_as!(
            CategoryExtensionItem,
            r#"
            SELECT id, requested_by, vertical as "vertical: VerticalType", proposed_name,
                   justification, status as "status: ModerationStatus", reviewed_by, review_notes, created_at
            FROM category_extension_requests
            ORDER BY created_at DESC
            "#
        )
        .fetch_all(&state.db)
        .await
    } else {
        sqlx::query_as!(
            CategoryExtensionItem,
            r#"
            SELECT id, requested_by, vertical as "vertical: VerticalType", proposed_name,
                   justification, status as "status: ModerationStatus", reviewed_by, review_notes, created_at
            FROM category_extension_requests
            WHERE requested_by = $1
            ORDER BY created_at DESC
            "#,
            auth.user_id
        )
        .fetch_all(&state.db)
        .await
    }
    .map_err(|e| {
        tracing::error!("Failed to list category extensions: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error fetching requests" })),
        )
    })?;

    Ok(Json(items))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/categories/extensions/{id}
// ─────────────────────────────────────────────────────────────────────────────

pub async fn action_category_extension(
    State(state): State<Arc<AppState>>,
    admin: AdminUserContext,
    Path(req_id): Path<Uuid>,
    Json(dto): Json<ClaimReviewDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let req = sqlx::query!(
        r#"
        SELECT id, vertical as "vertical: VerticalType", proposed_name, requested_by
        FROM category_extension_requests
        WHERE id = $1
        "#,
        req_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to fetch category request: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    let req = match req {
        Some(r) => r,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Request not found" })),
            ));
        }
    };

    sqlx::query!(
        r#"
        UPDATE category_extension_requests
        SET status = $1::moderation_status, reviewed_by = $2, review_notes = $3
        WHERE id = $4
        "#,
        dto.status as _,
        admin.user_id,
        dto.review_notes,
        req_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to update category request: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error updating request" })),
        )
    })?;

    // If approved, insert new category into categories table
    if dto.status == ModerationStatus::Approved {
        let cat_slug = slugify(&req.proposed_name);
        let _ = sqlx::query!(
            r#"
            INSERT INTO categories (id, vertical, name, slug, icon, display_order)
            VALUES ($1, $2::vertical_type, $3, $4, 'folder', 50)
            ON CONFLICT (slug) DO NOTHING
            "#,
            Uuid::new_v4(),
            req.vertical as _,
            req.proposed_name,
            cat_slug
        )
        .execute(&state.db)
        .await;
    }

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "category_extension_request".to_string(),
        entity_id: req_id.to_string(),
        action: format!("extension_{:?}", dto.status),
        actor_id: Some(admin.user_id),
        actor_role: format!("{:?}", admin.role),
        payload: json!({
            "status": dto.status,
            "proposed_name": req.proposed_name,
            "vertical": req.vertical
        }),
        simulate_dispatch: false,
    });

    Ok(Json(json!({
        "status": "ok",
        "request_id": req_id,
        "new_status": dto.status
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: SLUGIFY
// ─────────────────────────────────────────────────────────────────────────────

fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

#![allow(dead_code)]

use axum::{
    extract::{FromRef, FromRequestParts},
    http::{StatusCode, request::Parts},
    response::Json,
};
use rand::{RngCore, rngs::OsRng};
use serde_json::json;
use sha2::{Digest, Sha256};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::models::{OrgRole, UserRole, VerticalType};

pub const SESSION_COOKIE_NAME: &str = "otc_session";
pub const SESSION_DURATION_SECS: i64 = 30 * 24 * 60 * 60; // 30 days

// ─────────────────────────────────────────────────────────────────────────────
// CRYPTOGRAPHIC UTILITIES (Argon2id + SHA-256)
// ─────────────────────────────────────────────────────────────────────────────

pub fn hash_password(password: &str) -> Result<String, String> {
    use argon2::{
        Argon2,
        password_hash::{PasswordHasher, SaltString},
    };
    let salt = SaltString::generate(&mut argon2::password_hash::rand_core::OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| format!("Password hashing failed: {}", e))
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    use argon2::{
        Argon2,
        password_hash::{PasswordHash, PasswordVerifier},
    };
    if let Ok(parsed_hash) = PasswordHash::new(hash) {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok()
    } else {
        false
    }
}

pub fn validate_password_strength(password: &str) -> Result<(), &'static str> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters long");
    }
    if !password.chars().any(|c| c.is_ascii_uppercase()) {
        return Err("Password must contain at least one uppercase letter");
    }
    if !password.chars().any(|c| c.is_ascii_lowercase()) {
        return Err("Password must contain at least one lowercase letter");
    }
    if !password.chars().any(|c| c.is_ascii_digit()) {
        return Err("Password must contain at least one digit");
    }
    Ok(())
}

pub fn generate_session_token() -> (String, String) {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    let raw_token = hex::encode(bytes);

    let mut hasher = Sha256::new();
    hasher.update(raw_token.as_bytes());
    let token_hash = hex::encode(hasher.finalize());

    (raw_token, token_hash)
}

pub fn hash_session_token(raw_token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(raw_token.as_bytes());
    hex::encode(hasher.finalize())
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT STRUCTS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct AuthenticatedUserContext {
    pub user_id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub session_id: Option<Uuid>,
}

#[derive(Debug, Clone)]
pub struct OptionalUserContext {
    pub user: Option<AuthenticatedUserContext>,
}

#[derive(Debug, Clone)]
pub struct VerifiedTenantContext {
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub org_name: String,
    pub org_vertical: VerticalType,
    pub city: String,
    pub member_role: OrgRole,
}

#[derive(Debug, Clone)]
pub struct AdminUserContext {
    pub user_id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
}

pub type CityAdminGuard = AdminUserContext;

#[derive(Debug, Clone)]
pub struct ContentProviderGuard {
    pub user_id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub is_admin: bool, // true if super_admin / city_admin / sub_admin
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: EXTRACT AUTHENTICATED USER FROM SESSION OR DEV FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

async fn resolve_user_from_parts(
    parts: &Parts,
    app_state: &AppState,
) -> Result<Option<AuthenticatedUserContext>, (StatusCode, Json<serde_json::Value>)> {
    // 1. Try Bearer token in Authorization header
    let auth_header_token = parts
        .headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer ").or_else(|| h.strip_prefix("bearer ")))
        .map(|s| s.trim().to_string());

    // 2. Try cookie "otc_session"
    let cookie_token = parts
        .headers
        .get("cookie")
        .and_then(|h| h.to_str().ok())
        .and_then(|cookie_str| {
            for part in cookie_str.split(';') {
                let mut kv = part.splitn(2, '=');
                if let (Some(k), Some(v)) = (kv.next(), kv.next())
                    && k.trim() == SESSION_COOKIE_NAME
                {
                    return Some(v.trim().to_string());
                }
            }
            None
        });

    let raw_token = auth_header_token.or(cookie_token);

    if let Some(token) = raw_token {
        let token_hash = hash_session_token(&token);
        let row = sqlx::query!(
            r#"
            SELECT s.id as session_id, u.id as user_id, u.email, u.name, u.role as "role: UserRole", u.is_active
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = $1
              AND s.expires_at > NOW()
              AND s.revoked_at IS NULL
            "#,
            token_hash
        )
        .fetch_optional(&app_state.db)
        .await
        .map_err(|e| {
            tracing::error!("Database error checking session: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Database error checking session" })),
            )
        })?;

        if let Some(r) = row {
            if !r.is_active {
                return Err((
                    StatusCode::FORBIDDEN,
                    Json(json!({ "error": "Account is deactivated" })),
                ));
            }
            return Ok(Some(AuthenticatedUserContext {
                user_id: r.user_id,
                email: r.email,
                name: r.name,
                role: r.role,
                session_id: Some(r.session_id),
            }));
        }
    }

    // 3. Dev persona fallback (for testing without cookies/tokens)
    let allow_dev = std::env::var("ALLOW_DEV_PERSONA_HEADER")
        .map(|v| v == "true" || v == "1")
        .unwrap_or(true); // Default true in local environment

    if allow_dev {
        let user_id_header = parts.headers.get("x-user-id").and_then(|h| h.to_str().ok());
        let persona_header = parts.headers.get("x-tenant-persona").and_then(|h| h.to_str().ok());

        let fallback_id = if let Some(uid_str) = user_id_header {
            Uuid::parse_str(uid_str).ok()
        } else if let Some(persona) = persona_header {
            if persona == "business" {
                Uuid::parse_str("22222222-2222-2222-2222-222222222212").ok()
            } else {
                Uuid::parse_str("22222222-2222-2222-2222-222222222211").ok()
            }
        } else {
            None
        };

        if let Some(uid) = fallback_id {
            let row = sqlx::query!(
                r#"
                SELECT id, email, name, role as "role: UserRole", is_active
                FROM users
                WHERE id = $1
                "#,
                uid
            )
            .fetch_optional(&app_state.db)
            .await
            .map_err(|e| {
                tracing::error!("Database error fetching dev user: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Database error resolving dev persona" })),
                )
            })?;

            if let Some(r) = row.filter(|r| r.is_active) {
                return Ok(Some(AuthenticatedUserContext {
                    user_id: r.id,
                    email: r.email,
                    name: r.name,
                    role: r.role,
                    session_id: None,
                }));
            }
        }
    }

    Ok(None)
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthenticatedUserContext Extractor
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for AuthenticatedUserContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);
        let user_opt = resolve_user_from_parts(parts, &app_state).await?;

        match user_opt {
            Some(u) => Ok(u),
            None => Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Authentication required. Please log in." })),
            )),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// OptionalUserContext Extractor (Zero Forced Account for Residents)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for OptionalUserContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);
        let user = resolve_user_from_parts(parts, &app_state).await.unwrap_or(None);
        Ok(OptionalUserContext { user })
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VerifiedTenantContext Extractor (Rule 2: Server-Derived Tenant Scope)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for VerifiedTenantContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);
        let auth_user = AuthenticatedUserContext::from_request_parts(parts, state).await?;

        // Query organization_members strictly on the server to derive tenant_id
        let record = sqlx::query!(
            r#"
            SELECT o.id as org_id, o.name as org_name, o.vertical as "org_vertical: VerticalType", o.city, om.role as "member_role: OrgRole"
            FROM organization_members om
            JOIN organizations o ON o.id = om.organization_id
            WHERE om.user_id = $1
            LIMIT 1
            "#,
            auth_user.user_id
        )
        .fetch_optional(&app_state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to verify tenant membership: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Database error during tenant resolution" })),
            )
        })?;

        match record {
            Some(row) => Ok(VerifiedTenantContext {
                tenant_id: row.org_id,
                user_id: auth_user.user_id,
                org_name: row.org_name,
                org_vertical: row.org_vertical,
                city: row.city,
                member_role: row.member_role,
            }),
            None => Err((
                StatusCode::FORBIDDEN,
                Json(json!({
                    "error": "Access denied: Verified tenant membership not found for current user account"
                })),
            )),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminUserContext Extractor (Rule 4: Admin Hierarchy Guard)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for AdminUserContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_user = AuthenticatedUserContext::from_request_parts(parts, state).await?;

        let is_admin = matches!(
            auth_user.role,
            UserRole::SuperAdmin | UserRole::CityAdmin | UserRole::SubAdmin
        );

        if is_admin {
            Ok(AdminUserContext {
                user_id: auth_user.user_id,
                email: auth_user.email,
                name: auth_user.name,
                role: auth_user.role,
            })
        } else {
            Err((
                StatusCode::FORBIDDEN,
                Json(json!({ "error": "Administrative privileges required" })),
            ))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ContentProviderGuard Extractor (Rule 3: Content Provider Guard)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for ContentProviderGuard
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_user = AuthenticatedUserContext::from_request_parts(parts, state).await?;

        let is_allowed = matches!(
            auth_user.role,
            UserRole::ContentProvider | UserRole::SubAdmin | UserRole::CityAdmin | UserRole::SuperAdmin
        );

        if !is_allowed {
            return Err((
                StatusCode::FORBIDDEN,
                Json(json!({
                    "error": "Content contribution permissions required"
                })),
            ));
        }

        let is_admin = matches!(
            auth_user.role,
            UserRole::SuperAdmin | UserRole::CityAdmin | UserRole::SubAdmin
        );

        Ok(ContentProviderGuard {
            user_id: auth_user.user_id,
            email: auth_user.email,
            name: auth_user.name,
            role: auth_user.role,
            is_admin,
        })
    }
}

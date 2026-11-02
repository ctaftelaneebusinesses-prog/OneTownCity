use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
};
use chrono::Utc;
use serde_json::{Value, json};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::auth::OptionalUserContext;
use crate::models::{
    CategorySubmissionDto, ListingSubmissionDto, NewsSubmissionDto, VerticalType,
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/submissions/listing (Community & Owner Listing Submission)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn submit_listing(
    State(state): State<Arc<AppState>>,
    auth: OptionalUserContext,
    Json(dto): Json<ListingSubmissionDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    // 1. Strict Vertical Check: Only Education and Business allowed
    if dto.vertical != VerticalType::Education && dto.vertical != VerticalType::Business {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Only Education and Business listings may be submitted. Handyman services, repair shops, and general real estate are strictly excluded." })),
        ));
    }

    // 2. Input validation & sanitization
    let sanitized_name = crate::validation::sanitize_text(&dto.name);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_name, 2, 200, "Listing name") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_address = crate::validation::sanitize_text(&dto.address);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_address, 3, 300, "Address") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_desc = crate::validation::sanitize_text(&dto.description);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_desc, 10, 3000, "Description") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    if let Err(e) = crate::validation::validate_phone(&dto.phone) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    if let Some(ref w) = dto.website {
        let trimmed = w.trim();
        if !trimmed.is_empty() {
            crate::validation::validate_url(trimmed)
                .map_err(|e| (StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))))?;
        }
    }

    // 3. Generate unique slug
    let base_slug = sanitized_name
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>();
    let clean_slug = base_slug
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    let short_id = &Uuid::new_v4().to_string()[..6];
    let slug = format!("{}-{}", clean_slug, short_id);

    // 4. Create or link organization (tenant)
    let org_id = Uuid::new_v4();
    let org_name = format!("{} Entity", sanitized_name);
    let org_slug = format!("{}-tenant", slug);
    const FALLBACK_FREE_PLAN_ID: Uuid = Uuid::from_u128(0x11111111_1111_1111_1111_111111111101);
    let plan_id = sqlx::query_scalar!(
        r#"SELECT id FROM plans WHERE tier = 'free' LIMIT 1"#
    )
    .fetch_optional(&state.db)
    .await
    .unwrap_or(None)
    .unwrap_or(FALLBACK_FREE_PLAN_ID);

    sqlx::query!(
        r#"
        INSERT INTO organizations (id, name, slug, vertical, city, plan_id)
        VALUES ($1, $2, $3, $4::vertical_type, $5, $6)
        "#,
        org_id,
        org_name,
        org_slug,
        dto.vertical as _,
        dto.city,
        plan_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create tenant org: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error provisioning listing tenant" })),
        )
    })?;

    // Link user if authenticated
    if let Some(ref user) = auth.user {
        let _ = sqlx::query!(
            r#"
            INSERT INTO organization_members (id, organization_id, user_id, role)
            VALUES ($1, $2, $3, 'owner'::org_role)
            ON CONFLICT (organization_id, user_id) DO NOTHING
            "#,
            Uuid::new_v4(),
            org_id,
            user.user_id
        )
        .execute(&state.db)
        .await;
    }

    // 5. Insert listing with pending_review and not_verified
    let listing_id = Uuid::new_v4();
    let whatsapp = dto.whatsapp.unwrap_or_default();
    let website = dto.website.unwrap_or_default();
    let email = dto.email.unwrap_or_default();

    sqlx::query!(
        r#"
        INSERT INTO listings (
            id, tenant_id, category_id, vertical, slug, name, tagline, description,
            address, locality, city, phone, whatsapp, website, email,
            operating_hours, facilities, courses, admissions, is_sponsored,
            verification_status, moderation_status
        )
        VALUES (
            $1, $2, $3, $4::vertical_type, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, FALSE,
            'not_verified'::verification_status, 'pending_review'::moderation_status
        )
        "#,
        listing_id,
        org_id,
        dto.category_id,
        dto.vertical as _,
        slug,
        sanitized_name,
        sanitized_name,
        sanitized_desc,
        sanitized_address,
        sanitized_address,
        dto.city,
        dto.phone,
        whatsapp,
        website,
        email
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to insert listing submission: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error submitting listing" })),
        )
    })?;

    // 6. Audit job
    let actor_id = auth.user.as_ref().map(|u| u.user_id);
    let actor_role = auth.user.as_ref().map(|u| format!("{:?}", u.role)).unwrap_or_else(|| "public_contributor".to_string());

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "listing".to_string(),
        entity_id: listing_id.to_string(),
        action: "submission_created".to_string(),
        actor_id,
        actor_role,
        payload: json!({
            "name": sanitized_name,
            "vertical": format!("{:?}", dto.vertical),
            "city": dto.city,
            "submitted_by_email": dto.submitted_by_email,
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "pending_review",
            "listing_id": listing_id,
            "slug": slug,
            "message": "Listing submitted successfully. Awaiting City Admin review."
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/submissions/news (Town Event or Civic Update Submission)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn submit_news(
    State(state): State<Arc<AppState>>,
    auth: OptionalUserContext,
    Json(dto): Json<NewsSubmissionDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    // 1. Mandatory source link validation
    let trimmed_source_url = dto.source_url.trim();
    if trimmed_source_url.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "A verifiable source URL is mandatory for all news and civic development submissions" })),
        ));
    }
    if let Err(e) = crate::validation::validate_url(trimmed_source_url) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    // 2. Input validation
    let sanitized_title = crate::validation::sanitize_text(&dto.title);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_title, 3, 250, "Title") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_content = crate::validation::sanitize_text(&dto.content);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_content, 10, 5000, "Content") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_source_name = crate::validation::sanitize_text(&dto.source_name);
    let source_name = if sanitized_source_name.is_empty() {
        "Community Contributor".to_string()
    } else {
        sanitized_source_name
    };

    let event_date = if let Some(ref d) = dto.event_date {
        let trimmed = d.trim();
        if !trimmed.is_empty() {
            chrono::NaiveDate::parse_from_str(trimmed, "%Y-%m-%d").ok()
        } else {
            None
        }
    } else {
        None
    };

    let base_slug = sanitized_title
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>();
    let clean_slug = base_slug
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    let short_id = &Uuid::new_v4().to_string()[..6];
    let slug = format!("{}-{}", clean_slug, short_id);

    let news_id = Uuid::new_v4();
    let is_confirmed = dto.is_confirmed_fact.unwrap_or(false);

    sqlx::query!(
        r#"
        INSERT INTO town_news (
            id, city, locality, item_type, title, slug, content,
            source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue,
            moderation_status, created_at, updated_at
        )
        VALUES (
            $1, $2, '', $3::news_item_type, $4, $5, $6,
            $7, $8, $9,
            $10, $11, $12,
            'pending_review'::moderation_status, NOW(), NOW()
        )
        "#,
        news_id,
        dto.city,
        dto.item_type as _,
        sanitized_title,
        slug,
        sanitized_content,
        source_name,
        trimmed_source_url,
        is_confirmed,
        event_date,
        dto.event_time,
        dto.event_venue
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to insert news submission: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error submitting news" })),
        )
    })?;

    let actor_id = auth.user.as_ref().map(|u| u.user_id);
    let actor_role = auth.user.as_ref().map(|u| format!("{:?}", u.role)).unwrap_or_else(|| "public_contributor".to_string());

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "news".to_string(),
        entity_id: news_id.to_string(),
        action: "news_submission_created".to_string(),
        actor_id,
        actor_role,
        payload: json!({
            "title": sanitized_title,
            "city": dto.city,
            "source_url": trimmed_source_url,
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "pending_review",
            "news_id": news_id,
            "slug": slug,
            "message": "Town update submitted successfully for editorial review."
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/submissions/category-request (Category Extension Request)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn submit_category_request(
    State(state): State<Arc<AppState>>,
    auth: OptionalUserContext,
    Json(dto): Json<CategorySubmissionDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let sanitized_name = crate::validation::sanitize_text(&dto.proposed_name);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_name, 2, 100, "Proposed category name") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_justification = crate::validation::sanitize_text(&dto.justification);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_justification, 5, 1000, "Justification") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    // Resolve user ID
    let user_id = if let Some(ref u) = auth.user {
        u.user_id
    } else {
        // Fallback or create user from email
        let email = dto.email.as_deref().unwrap_or("contributor@onetowncity.in").trim().to_lowercase();
        let existing = sqlx::query!("SELECT id FROM users WHERE email = $1", email)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| {
                tracing::error!("Error checking contributor user: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "Database error" })))
            })?;

        match existing {
            Some(u) => u.id,
            None => {
                let new_id = Uuid::new_v4();
                let random_hash = crate::auth::hash_password(&Uuid::new_v4().to_string()).unwrap_or_default();
                let _ = sqlx::query!(
                    "INSERT INTO users (id, email, name, role, password_hash, is_active) VALUES ($1, $2, 'Contributor', 'content_provider'::user_role, $3, TRUE)",
                    new_id,
                    email,
                    random_hash
                ).execute(&state.db).await;
                new_id
            }
        }
    };

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
        user_id,
        dto.vertical as _,
        sanitized_name,
        sanitized_justification,
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
        actor_id: Some(user_id),
        actor_role: "contributor".to_string(),
        payload: json!({
            "vertical": format!("{:?}", dto.vertical),
            "proposed_name": sanitized_name,
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "pending_review",
            "request_id": req_id,
            "message": "Category request submitted for City Admin review."
        })),
    ))
}

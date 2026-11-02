use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use chrono::Utc;
use serde_json::{Value, json};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::auth::VerifiedTenantContext;
use crate::models::{
    EnquiryStatus, LeadWithListing, OpportunityCreateDto, PlanTier, PlanUpgradeDto,
    StatusUpdateDto, TenantDashboardMetrics, VerticalType,
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/saas/dashboard (Tenant Metrics, Views, Quota & Engagement)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn get_dashboard(
    State(state): State<Arc<AppState>>,
    tenant: VerifiedTenantContext,
) -> Result<Json<TenantDashboardMetrics>, (StatusCode, Json<Value>)> {
    let org = sqlx::query!(
        r#"
        SELECT o.name, o.slug, o.vertical as "vertical: VerticalType", o.city,
               p.name as plan_name, p.tier as "plan_tier: PlanTier", p.monthly_lead_quota
        FROM organizations o
        JOIN plans p ON p.id = o.plan_id
        WHERE o.id = $1
        "#,
        tenant.tenant_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching tenant org details: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Organization not found" })),
        )
    })?;

    // Current month leads usage
    let month_year = Utc::now().format("%Y-%m").to_string();
    let usage = sqlx::query!(
        "SELECT leads_count FROM leads_usage WHERE tenant_id = $1 AND month_year = $2",
        tenant.tenant_id,
        month_year
    )
    .fetch_optional(&state.db)
    .await
    .unwrap_or(None)
    .map(|r| r.leads_count)
    .unwrap_or(0);

    // Aggregate views, whatsapp clicks, call clicks across all listings for this tenant
    let stats = sqlx::query!(
        r#"
        SELECT 
            COALESCE(SUM(view_count), 0)::bigint as total_views,
            COALESCE(SUM(whatsapp_clicks), 0)::bigint as total_whatsapp,
            COALESCE(SUM(call_clicks), 0)::bigint as total_calls
        FROM listings
        WHERE tenant_id = $1
        "#,
        tenant.tenant_id
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error aggregating tenant stats: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    Ok(Json(TenantDashboardMetrics {
        organization_name: org.name,
        organization_slug: org.slug,
        vertical: org.vertical,
        city: org.city,
        plan_name: org.plan_name,
        plan_tier: org.plan_tier,
        monthly_lead_quota: org.monthly_lead_quota,
        leads_used_this_month: usage,
        total_views: stats.total_views.unwrap_or(0),
        total_whatsapp_clicks: stats.total_whatsapp.unwrap_or(0),
        total_call_clicks: stats.total_calls.unwrap_or(0),
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/saas/leads (Tenant Lead Inbox Gated by Server Isolation)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_leads(
    State(state): State<Arc<AppState>>,
    tenant: VerifiedTenantContext,
) -> Result<Json<Vec<LeadWithListing>>, (StatusCode, Json<Value>)> {
    let leads = sqlx::query_as!(
        LeadWithListing,
        r#"
        SELECT 
            e.id, e.listing_id, l.name as listing_name,
            e.inquirer_name, e.inquirer_phone, e.inquirer_email,
            e.enquiry_type as "enquiry_type: _",
            e.message,
            e.status as "status: _",
            e.created_at
        FROM enquiries e
        JOIN listings l ON l.id = e.listing_id
        WHERE e.tenant_id = $1
        ORDER BY e.created_at DESC
        LIMIT 100
        "#,
        tenant.tenant_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching leads for tenant: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    Ok(Json(leads))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/saas/leads/{id}/status (Toggle Lead Response State)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn update_lead_status(
    State(state): State<Arc<AppState>>,
    tenant: VerifiedTenantContext,
    Path(id): Path<Uuid>,
    Json(dto): Json<StatusUpdateDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let new_status = match dto.status.to_lowercase().as_str() {
        "responded" => EnquiryStatus::Responded,
        "closed" => EnquiryStatus::Closed,
        "open" => EnquiryStatus::Open,
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "Invalid status value (allowed: open, responded, closed)" })),
            ));
        }
    };

    let result = sqlx::query!(
        r#"
        UPDATE enquiries
        SET status = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3
        "#,
        new_status as _,
        id,
        tenant.tenant_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to update lead status: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database update failed" })),
        )
    })?;

    if result.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Lead not found for this tenant organization" })),
        ));
    }

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "lead".to_string(),
        entity_id: id.to_string(),
        action: format!("status_{}", dto.status),
        actor_id: Some(tenant.user_id),
        actor_role: "tenant_owner".to_string(),
        payload: json!({
            "tenant_id": tenant.tenant_id,
            "new_status": dto.status,
        }),
        simulate_dispatch: false,
    });

    Ok(Json(json!({
        "status": "updated",
        "lead_id": id,
        "new_status": dto.status
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/saas/opportunities (Submit Internship / Offer for Moderation)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn create_opportunity(
    State(state): State<Arc<AppState>>,
    tenant: VerifiedTenantContext,
    Json(dto): Json<OpportunityCreateDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    // Input validation & sanitization
    let sanitized_title = crate::validation::sanitize_text(&dto.title);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_title, 3, 250, "Opportunity title") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_provider = crate::validation::sanitize_text(&dto.provider_name);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_provider, 2, 150, "Provider name") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let sanitized_desc = crate::validation::sanitize_text(&dto.description);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_desc, 10, 3000, "Description") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    if let Some(ref url) = dto.apply_url
        && let Err(e) = crate::validation::validate_url(url)
    {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    if let Some(ref phone) = dto.contact_phone
        && let Err(e) = crate::validation::validate_phone(phone)
    {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let opp_id = Uuid::new_v4();
    let base_slug = sanitized_title
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>();
    let slug = format!("{}-{}", base_slug, &opp_id.to_string()[..8]);

    sqlx::query!(
        r#"
        INSERT INTO student_opportunities (
            id, tenant_id, city, opportunity_type, title, slug, provider_name,
            description, eligibility, deadline, apply_url, contact_phone,
            discount_percent, stipend_amount, moderation_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'submitted')
        "#,
        opp_id,
        tenant.tenant_id,
        tenant.city,
        dto.opportunity_type as _,
        sanitized_title,
        slug,
        sanitized_provider,
        sanitized_desc,
        dto.eligibility.unwrap_or_default(),
        dto.deadline,
        dto.apply_url.unwrap_or_default(),
        dto.contact_phone.unwrap_or_default(),
        dto.discount_percent,
        dto.stipend_amount,
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create student opportunity: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to create opportunity" })),
        )
    })?;

    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "opportunity".to_string(),
        entity_id: opp_id.to_string(),
        action: "created_submission".to_string(),
        actor_id: Some(tenant.user_id),
        actor_role: "tenant_owner".to_string(),
        payload: json!({
            "tenant_id": tenant.tenant_id,
            "title": dto.title,
            "opportunity_type": format!("{:?}", dto.opportunity_type),
        }),
        simulate_dispatch: false,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "submitted",
            "opportunity_id": opp_id,
            "message": "Opportunity submitted to City Admin moderation queue"
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/saas/plan (Local Plan Simulator: Test Quota Upgrades)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn simulate_plan_upgrade(
    State(state): State<Arc<AppState>>,
    tenant: VerifiedTenantContext,
    Json(dto): Json<PlanUpgradeDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let target_plan = sqlx::query!(
        "SELECT id, name, monthly_lead_quota FROM plans WHERE tier = $1 LIMIT 1",
        dto.plan_tier as _
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database lookup error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Requested plan tier not found" })),
        )
    })?;

    sqlx::query!(
        "UPDATE organizations SET plan_id = $1, updated_at = NOW() WHERE id = $2",
        target_plan.id,
        tenant.tenant_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to upgrade plan: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Could not update organization plan" })),
        )
    })?;

    Ok(Json(json!({
        "status": "upgraded",
        "new_plan": target_plan.name,
        "new_lead_quota": target_plan.monthly_lead_quota,
        "message": format!("Successfully switched to {} with {} leads/month", target_plan.name, target_plan.monthly_lead_quota)
    })))
}

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sqlx::FromRow;
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::auth::AdminUserContext;
use crate::models::{
    ModerationStatus, OpportunityType, Report, ReportStatus, VerificationStatus, VerticalType,
};

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct AdminListingSummary {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub vertical: VerticalType,
    pub city: String,
    pub verification_status: VerificationStatus,
    pub moderation_status: ModerationStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct AdminOpportunitySummary {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub opportunity_type: OpportunityType,
    pub provider_name: String,
    pub city: String,
    pub moderation_status: ModerationStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ModerationActionDto {
    pub entity_type: String, // "listing", "news", or "opportunity"
    pub status: ModerationStatus,
    pub verification: Option<VerificationStatus>,
    pub rejection_reason: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReportActionDto {
    pub status: ReportStatus,
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/moderation (List Submissions in Review Queue)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_moderation_queue(
    State(state): State<Arc<AppState>>,
    _admin: AdminUserContext,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    // 1. Pending or recently submitted listings
    let listings = sqlx::query_as!(
        AdminListingSummary,
        r#"
        SELECT id, name, slug, vertical as "vertical: VerticalType", city,
               verification_status as "verification_status: VerificationStatus",
               moderation_status as "moderation_status: ModerationStatus",
               created_at
        FROM listings
        ORDER BY created_at DESC
        LIMIT 30
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching listings for moderation: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    // 2. Pending or recently submitted student opportunities
    let opportunities = sqlx::query_as!(
        AdminOpportunitySummary,
        r#"
        SELECT id, title, slug, opportunity_type as "opportunity_type: OpportunityType",
               provider_name, city,
               moderation_status as "moderation_status: ModerationStatus",
               created_at
        FROM student_opportunities
        ORDER BY created_at DESC
        LIMIT 30
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching opportunities for moderation: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    Ok(Json(json!({
        "listings": listings,
        "opportunities": opportunities,
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/moderation/{id} (Approve / Reject / Set Verification)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn action_moderation_item(
    State(state): State<Arc<AppState>>,
    _admin: AdminUserContext,
    Path(id): Path<Uuid>,
    Json(dto): Json<ModerationActionDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    match dto.entity_type.as_str() {
        "listing" => {
            let verif = dto.verification.unwrap_or(VerificationStatus::DetailsReviewed);
            let reason = dto.rejection_reason.unwrap_or_default();
            sqlx::query!(
                r#"
                UPDATE listings
                SET moderation_status = $1::moderation_status,
                    verification_status = CASE WHEN $1::moderation_status = 'approved'::moderation_status THEN $2::verification_status ELSE verification_status END,
                    rejection_reason = $3,
                    updated_at = NOW()
                WHERE id = $4
                "#,
                dto.status as _,
                verif as _,
                reason,
                id
            )
            .execute(&state.db)
            .await
        }
        "opportunity" => {
            sqlx::query!(
                r#"
                UPDATE student_opportunities
                SET moderation_status = $1::moderation_status, updated_at = NOW()
                WHERE id = $2
                "#,
                dto.status as _,
                id
            )
            .execute(&state.db)
            .await
        }
        "news" => {
            sqlx::query!(
                r#"
                UPDATE town_news
                SET moderation_status = $1::moderation_status, updated_at = NOW()
                WHERE id = $2
                "#,
                dto.status as _,
                id
            )
            .execute(&state.db)
            .await
        }
        _ => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "Unknown entity_type (listing, opportunity, news)" })),
            ));
        }
    }
    .map_err(|e| {
        tracing::error!("Moderation update failed: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to update item" })),
        )
    })?;

    Ok(Json(json!({
        "status": "updated",
        "id": id,
        "moderation_status": dto.status
    })))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/reports (List User Governance Reports)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_reports(
    State(state): State<Arc<AppState>>,
    _admin: AdminUserContext,
) -> Result<Json<Vec<Report>>, (StatusCode, Json<Value>)> {
    let reports = sqlx::query_as!(
        Report,
        r#"
        SELECT id, listing_id, reported_by_email,
               reason as "reason: _", details,
               status as "status: _", created_at, updated_at
        FROM reports
        ORDER BY created_at DESC
        LIMIT 50
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching reports: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    Ok(Json(reports))
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/reports/{id} (Resolve / Dismiss Report)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn action_report(
    State(state): State<Arc<AppState>>,
    _admin: AdminUserContext,
    Path(id): Path<Uuid>,
    Json(dto): Json<ReportActionDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let res = sqlx::query!(
        r#"
        UPDATE reports
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        "#,
        dto.status as _,
        id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to update report status: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    if res.rows_affected() == 0 {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Report not found" })),
        ));
    }

    Ok(Json(json!({
        "status": "updated",
        "report_id": id,
        "new_status": dto.status
    })))
}

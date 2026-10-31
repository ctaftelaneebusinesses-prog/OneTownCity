#![allow(dead_code)]

use axum::{
    extract::{FromRef, FromRequestParts},
    http::{StatusCode, request::Parts},
    response::Json,
};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::models::{UserRole, VerticalType};

#[derive(Debug, Clone)]
pub struct VerifiedTenantContext {
    pub tenant_id: Uuid,
    pub user_id: Uuid,
    pub org_name: String,
    pub org_vertical: VerticalType,
    pub city: String,
}

#[derive(Debug, Clone)]
pub struct AdminUserContext {
    pub user_id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
}

// ─────────────────────────────────────────────────────────────────────────────
// VerifiedTenantContext Extractor (Axum 0.8 Native Async)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for VerifiedTenantContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        // Extract user id from header "x-user-id" or "x-tenant-persona" (education | business)
        let user_id_header = parts.headers.get("x-user-id").and_then(|h| h.to_str().ok());
        let persona_header = parts
            .headers
            .get("x-tenant-persona")
            .and_then(|h| h.to_str().ok());

        let user_id = if let Some(uid_str) = user_id_header {
            Uuid::parse_str(uid_str).map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(json!({ "error": "Invalid x-user-id header format" })),
                )
            })?
        } else if let Some(persona) = persona_header {
            if persona == "business" {
                // Minerva Bookstore owner demo
                Uuid::parse_str("22222222-2222-2222-2222-222222222205").unwrap()
            } else {
                // Narayana Engineering College principal demo
                Uuid::parse_str("22222222-2222-2222-2222-222222222204").unwrap()
            }
        } else {
            // Default demo tenant: Narayana Engineering College
            Uuid::parse_str("22222222-2222-2222-2222-222222222204").unwrap()
        };

        // Strictly verify tenant membership in database — never trust client-supplied tenant_id
        let record = sqlx::query!(
            r#"
            SELECT o.id as org_id, o.name as org_name, o.vertical as "org_vertical: VerticalType", o.city
            FROM organization_members om
            JOIN organizations o ON o.id = om.organization_id
            WHERE om.user_id = $1
            LIMIT 1
            "#,
            user_id
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
                user_id,
                org_name: row.org_name,
                org_vertical: row.org_vertical,
                city: row.city,
            }),
            None => Err((
                StatusCode::FORBIDDEN,
                Json(json!({
                    "error": "Access denied: Verified tenant membership not found for user identity"
                })),
            )),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// AdminUserContext Extractor (Axum 0.8 Native Async)
// ─────────────────────────────────────────────────────────────────────────────

impl<S> FromRequestParts<S> for AdminUserContext
where
    S: Send + Sync,
    Arc<AppState>: FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::<AppState>::from_ref(state);

        let user_id_header = parts.headers.get("x-user-id").and_then(|h| h.to_str().ok());
        let user_id = if let Some(uid_str) = user_id_header {
            Uuid::parse_str(uid_str).map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(json!({ "error": "Invalid x-user-id header format" })),
                )
            })?
        } else {
            // Default demo City Admin: Nellore City Admin
            Uuid::parse_str("22222222-2222-2222-2222-222222222202").unwrap()
        };

        let user = sqlx::query!(
            r#"
            SELECT id, email, name, role as "role: UserRole"
            FROM users
            WHERE id = $1
            "#,
            user_id
        )
        .fetch_optional(&app_state.db)
        .await
        .map_err(|e| {
            tracing::error!("Failed to verify admin user: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Database error during admin verification" })),
            )
        })?;

        match user {
            Some(u) if u.role == UserRole::SuperAdmin || u.role == UserRole::CityAdmin => {
                Ok(AdminUserContext {
                    user_id: u.id,
                    email: u.email,
                    name: u.name,
                    role: u.role,
                })
            }
            Some(_) => Err((
                StatusCode::FORBIDDEN,
                Json(json!({ "error": "Administrative privileges required" })),
            )),
            None => Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "User account not recognized" })),
            )),
        }
    }
}

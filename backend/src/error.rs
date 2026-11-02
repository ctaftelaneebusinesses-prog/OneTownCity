use axum::{
    http::{HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[allow(dead_code)]
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Authentication required: {0}")]
    Unauthorized(String),

    #[error("Access denied: {0}")]
    Forbidden(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Validation failed: {0}")]
    ValidationError(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Resource conflict: {0}")]
    Conflict(String),

    #[error("Too many requests. Retry after {0} seconds")]
    RateLimited(u64),

    #[error("Database error: {0}")]
    DatabaseError(String),

    #[error("Internal server error: {0}")]
    InternalError(String),
}

#[allow(dead_code)]
impl AppError {
    pub fn unauthorized(msg: impl Into<String>) -> Self {
        Self::Unauthorized(msg.into())
    }

    pub fn forbidden(msg: impl Into<String>) -> Self {
        Self::Forbidden(msg.into())
    }

    pub fn not_found(msg: impl Into<String>) -> Self {
        Self::NotFound(msg.into())
    }

    pub fn validation(msg: impl Into<String>) -> Self {
        Self::ValidationError(msg.into())
    }

    pub fn bad_request(msg: impl Into<String>) -> Self {
        Self::BadRequest(msg.into())
    }

    pub fn conflict(msg: impl Into<String>) -> Self {
        Self::Conflict(msg.into())
    }

    pub fn rate_limited(retry_after_secs: u64) -> Self {
        Self::RateLimited(retry_after_secs)
    }

    pub fn internal(msg: impl Into<String>) -> Self {
        Self::InternalError(msg.into())
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_code, user_message, retry_after) = match &self {
            AppError::Unauthorized(msg) => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED",
                msg.clone(),
                None,
            ),
            AppError::Forbidden(msg) => (
                StatusCode::FORBIDDEN,
                "FORBIDDEN",
                msg.clone(),
                None,
            ),
            AppError::NotFound(msg) => (
                StatusCode::NOT_FOUND,
                "NOT_FOUND",
                msg.clone(),
                None,
            ),
            AppError::ValidationError(msg) => (
                StatusCode::BAD_REQUEST,
                "VALIDATION_ERROR",
                msg.clone(),
                None,
            ),
            AppError::BadRequest(msg) => (
                StatusCode::BAD_REQUEST,
                "BAD_REQUEST",
                msg.clone(),
                None,
            ),
            AppError::Conflict(msg) => (
                StatusCode::CONFLICT,
                "CONFLICT",
                msg.clone(),
                None,
            ),
            AppError::RateLimited(secs) => (
                StatusCode::TOO_MANY_REQUESTS,
                "RATE_LIMITED",
                format!("Too many requests. Please retry after {} seconds.", secs),
                Some(*secs),
            ),
            AppError::DatabaseError(detail) => {
                tracing::error!("Database query error: {}", detail);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DATABASE_ERROR",
                    "A secure database operation error occurred.".to_string(),
                    None,
                )
            }
            AppError::InternalError(detail) => {
                tracing::error!("Internal server error: {}", detail);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "An unexpected error occurred. Please try again later.".to_string(),
                    None,
                )
            }
        };

        let body = Json(json!({
            "error": user_message,
            "code": error_code,
            "status": status.as_u16(),
        }));

        let mut res = (status, body).into_response();

        if let Some(secs) = retry_after
            && let Ok(val) = HeaderValue::from_str(&secs.to_string())
        {
            res.headers_mut().insert(header::RETRY_AFTER, val);
        }

        res
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => Self::NotFound("Resource not found".to_string()),
            sqlx::Error::Database(db_err) if db_err.is_unique_violation() => {
                Self::Conflict("A record with this identifier already exists".to_string())
            }
            other => Self::DatabaseError(other.to_string()),
        }
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        Self::BadRequest(format!("Malformed JSON payload: {}", err))
    }
}

impl From<uuid::Error> for AppError {
    fn from(err: uuid::Error) -> Self {
        Self::BadRequest(format!("Invalid UUID format: {}", err))
    }
}

#[allow(dead_code)]
pub type AppResult<T> = Result<T, AppError>;

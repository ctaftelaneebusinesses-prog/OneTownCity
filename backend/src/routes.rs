use axum::{Router, routing::get};
use std::sync::Arc;
use crate::AppState;

pub fn api_router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/ping", get(ping))
}

async fn ping() -> &'static str {
    "pong"
}

use axum::{
    Router,
    http::{HeaderName, HeaderValue, Method, header},
    response::Json,
    routing::get,
};
use serde_json::{Value, json};
use sqlx::PgPool;
use std::sync::Arc;
use std::time::Duration;
use tower_http::{
    compression::CompressionLayer, cors::CorsLayer, timeout::TimeoutLayer, trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod auth;
mod handlers;
mod models;
mod routes;

/// Shared application state
pub struct AppState {
    pub db: PgPool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env (non-fatal if missing)
    dotenvy::dotenv().ok();

    // Initialize tracing
    init_tracing();

    // Database connection pool (max 15 connections for local 2GB footprint)
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgresql://otc_admin:otc_local_password@127.0.0.1:5432/onetowncity_saas".into()
    });

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(15)
        .min_connections(2)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    // Run pending migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = Arc::new(AppState { db: pool });

    // CORS — allow localhost and 127.0.0.1 for browser and Playwright testing
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse::<HeaderValue>()?,
            "http://127.0.0.1:3000".parse::<HeaderValue>()?,
            "https://localhost:3000".parse::<HeaderValue>()?,
            "https://127.0.0.1:3000".parse::<HeaderValue>()?,
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            HeaderName::from_static("x-user-id"),
            HeaderName::from_static("x-tenant-persona"),
        ])
        .max_age(Duration::from_secs(3600));

    let app = Router::new()
        .route("/health", get(health_handler))
        .nest("/api/v1", routes::api_router())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(TimeoutLayer::with_status_code(
            axum::http::StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(30),
        ))
        .with_state(state);

    let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "127.0.0.1:8080".into());
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!("Server listening on http://{}", bind_addr);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn health_handler() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "one_town_city" }))
}

fn init_tracing() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "one_town_city=info,tower_http=info,axum=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
}

async fn shutdown_signal() {
    use tokio::signal;
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };
    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install SIGTERM handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => { tracing::info!("Ctrl-C received, shutting down gracefully"); },
        _ = terminate => { tracing::info!("SIGTERM received, shutting down gracefully"); },
    }
}

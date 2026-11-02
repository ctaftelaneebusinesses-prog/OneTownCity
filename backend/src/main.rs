use axum::{
    Router,
    http::{HeaderName, HeaderValue, Method, header},
    response::{IntoResponse, Json, Response},
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
mod error;
mod handlers;
mod middleware;
mod models;
mod routes;
mod validation;
mod worker;

/// Shared application state
pub struct AppState {
    pub db: PgPool,
    pub worker: worker::WorkerHandle,
    pub auth_limiter: Arc<middleware::rate_limit::RateLimiter>,
    pub submission_limiter: Arc<middleware::rate_limit::RateLimiter>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env (non-fatal if missing)
    dotenvy::dotenv().ok();

    // Initialize tracing
    init_tracing();

    // Database connection pool (max 15 connections for 2GB small server footprint)
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgresql://otc_admin:otc_local_password@127.0.0.1:5432/onetowncity_saas".into()
    });

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(15)
        .min_connections(2)
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(300))
        .max_lifetime(Duration::from_secs(1800))
        .connect(&database_url)
        .await?;

    // Run pending migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    // Start bounded async audit & notification worker (capacity: 100)
    let (worker_handle, _worker_task) = worker::start_worker(pool.clone());

    // In-memory bounded token-bucket rate limiters
    // Auth limiter: 10 req/minute per IP
    let auth_limiter = Arc::new(middleware::rate_limit::RateLimiter::new(
        10,
        Duration::from_secs(60),
    ));
    // Submission limiter: 15 req/5 minutes per IP
    let submission_limiter = Arc::new(middleware::rate_limit::RateLimiter::new(
        15,
        Duration::from_secs(300),
    ));

    // Stale IP eviction loop (runs every 60s, purges IPs idle > 10m)
    let auth_clone = auth_limiter.clone();
    let sub_clone = submission_limiter.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(60));
        loop {
            interval.tick().await;
            auth_clone.evict_stale(Duration::from_secs(600));
            sub_clone.evict_stale(Duration::from_secs(600));
        }
    });

    let state = Arc::new(AppState {
        db: pool,
        worker: worker_handle,
        auth_limiter,
        submission_limiter,
    });

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
            header::COOKIE,
            HeaderName::from_static("x-user-id"),
            HeaderName::from_static("x-tenant-persona"),
        ])
        .allow_credentials(true)
        .max_age(Duration::from_secs(3600));

    let app = Router::new()
        .route("/health", get(health_handler))
        .nest("/api/v1", routes::api_router(state.clone()))
        .layer(cors)
        .layer(axum::middleware::from_fn(middleware::security_headers))
        .layer(tower_http::catch_panic::CatchPanicLayer::custom(handle_panic))
        .layer(tower::limit::ConcurrencyLimitLayer::new(64))
        .layer(axum::extract::DefaultBodyLimit::max(2 * 1024 * 1024))
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(TimeoutLayer::with_status_code(
            axum::http::StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(10),
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

fn handle_panic(err: Box<dyn std::any::Any + Send + 'static>) -> Response {
    let details = if let Some(s) = err.downcast_ref::<&str>() {
        s.to_string()
    } else if let Some(s) = err.downcast_ref::<String>() {
        s.clone()
    } else {
        "Unknown panic".to_string()
    };
    tracing::error!("CRITICAL: Caught panic in HTTP worker: {}", details);
    (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        axum::Json(serde_json::json!({
            "error": "An internal server error occurred.",
            "code": "INTERNAL_PANIC_RECOVERED",
            "status": 500
        })),
    )
        .into_response()
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
        if let Err(e) = signal::ctrl_c().await {
            tracing::error!("Failed to install Ctrl+C handler: {}", e);
        }
    };
    #[cfg(unix)]
    let terminate = async {
        match signal::unix::signal(signal::unix::SignalKind::terminate()) {
            Ok(mut stream) => {
                stream.recv().await;
            }
            Err(e) => {
                tracing::error!("Failed to install SIGTERM handler: {}", e);
            }
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => { tracing::info!("Ctrl-C received, shutting down gracefully"); },
        _ = terminate => { tracing::info!("SIGTERM received, shutting down gracefully"); },
    }
}

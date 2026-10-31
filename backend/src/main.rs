use axum::{
    Router,
    http::{HeaderValue, Method},
    response::Json,
    routing::get,
};
use serde_json::{Value, json};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::{
    cors::{CorsLayer, Any},
    trace::TraceLayer,
    compression::CompressionLayer,
    timeout::TimeoutLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use std::time::Duration;

mod db;
mod error;
mod routes;

/// Shared application state
pub struct AppState {
    pub db: PgPool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env (non-fatal if missing)
    dotenvy::dotenv().ok();

    // Initialize tracing + OpenTelemetry stdout exporter
    init_tracing();

    // Initialize Sentry (no-op if DSN not set)
    let _sentry = sentry::init((
        std::env::var("SENTRY_DSN").unwrap_or_default(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            traces_sample_rate: 1.0,
            ..Default::default()
        },
    ));

    // Database connection pool
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(20)
        .min_connections(2)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&database_url)
        .await?;

    // Run pending migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    let state = Arc::new(AppState { db: pool });

    // CORS — allow localhost dev origins
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:3000".parse::<HeaderValue>()?,
            "https://localhost:3000".parse::<HeaderValue>()?,
        ])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers(Any)
        .max_age(Duration::from_secs(3600));

    let app = Router::new()
        .route("/health", get(health_handler))
        .nest("/api/v1", routes::api_router())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(TimeoutLayer::new(Duration::from_secs(30)))
        .with_state(state);

    let bind_addr = std::env::var("BIND_ADDR").unwrap_or_else(|_| "0.0.0.0:8080".into());
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!("🚀 Listening on {}", bind_addr);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn health_handler() -> Json<Value> {
    Json(json!({ "status": "ok", "service": "one_town_city" }))
}

fn init_tracing() {
    use opentelemetry_sdk::trace::SdkTracerProvider;
    use opentelemetry_stdout::SpanExporter;
    use tracing_opentelemetry::OpenTelemetryLayer;

    let exporter = SpanExporter::default();
    let provider = SdkTracerProvider::builder()
        .with_simple_exporter(exporter)
        .build();

    let tracer = opentelemetry::trace::TracerProvider::tracer(&provider, "one_town_city");

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "one_town_city=debug,tower_http=debug,axum=debug".into()))
        .with(tracing_subscriber::fmt::layer().json())
        .with(OpenTelemetryLayer::new(tracer))
        .init();
}

async fn shutdown_signal() {
    use tokio::signal;
    let ctrl_c = async {
        signal::ctrl_c().await.expect("Failed to install Ctrl+C handler");
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
        _ = ctrl_c => { tracing::info!("Ctrl-C received, shutting down..."); },
        _ = terminate => { tracing::info!("SIGTERM received, shutting down..."); },
    }
}

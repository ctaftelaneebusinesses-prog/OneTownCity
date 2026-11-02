use axum::{
    Router,
    routing::{delete, get, patch, post},
};
use std::sync::Arc;

use crate::AppState;
use crate::handlers::{admin, auth, public, saas, submissions};
use crate::middleware::{no_cache_headers, public_cache_headers, rate_limit};

pub fn api_router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    // 1. Authentication & Session Management (rate-limited: 10 req/min/IP, private no-store)
    let auth_routes = Router::new()
        .route("/register", post(auth::register))
        .route("/login", post(auth::login))
        .route("/logout", post(auth::logout))
        .route("/me", get(auth::get_me))
        .route("/sessions/{id}", delete(auth::revoke_session))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            rate_limit::auth_rate_limit,
        ))
        .layer(axum::middleware::from_fn(no_cache_headers));

    // 2. Ownership Claims & Category Extensions (private no-store)
    let claims_and_extensions = Router::new()
        .route("/claims", post(auth::submit_ownership_claim))
        .route("/claims", get(auth::list_my_claims))
        .route("/admin/claims", get(auth::list_all_claims))
        .route("/admin/claims/{id}", patch(auth::action_claim))
        .route("/categories/extensions", post(auth::submit_category_extension))
        .route("/categories/extensions", get(auth::list_category_extensions))
        .route(
            "/admin/categories/extensions/{id}",
            patch(auth::action_category_extension),
        )
        .layer(axum::middleware::from_fn(no_cache_headers));

    // 3. Public Directory Read Endpoints (public caching enabled)
    let public_reads = Router::new()
        .route("/listings", get(public::list_listings))
        .route("/listings/{slug}", get(public::get_listing))
        .route("/news", get(public::list_news))
        .route("/news/{slug}", get(public::get_news_by_slug))
        .route("/students/opportunities", get(public::list_opportunities))
        .route("/students/opportunities/{id}", get(public::get_opportunity_by_id))
        .route("/categories", get(public::list_categories))
        .route("/towns", get(public::list_towns))
        .layer(axum::middleware::from_fn(public_cache_headers));

    // 4. Public Resident & Community Submissions (rate-limited: 15 req/5min/IP, private no-store)
    let public_submissions = Router::new()
        .route("/enquiries", post(public::create_enquiry))
        .route("/reports", post(public::create_report))
        .route("/submissions/listing", post(submissions::submit_listing))
        .route("/submissions/news", post(submissions::submit_news))
        .route("/submissions/category-request", post(submissions::submit_category_request))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            rate_limit::submission_rate_limit,
        ))
        .layer(axum::middleware::from_fn(no_cache_headers));

    // 5. Telemetry & Analytics
    let telemetry_routes = Router::new().route("/telemetry/click", post(public::record_click));

    // 6. Multi-Tenant SaaS Portal (private no-store)
    let saas_routes = Router::new()
        .route("/dashboard", get(saas::get_dashboard))
        .route("/leads", get(saas::list_leads))
        .route("/leads/{id}/status", patch(saas::update_lead_status))
        .route("/opportunities", post(saas::create_opportunity))
        .route("/plan", patch(saas::simulate_plan_upgrade))
        .layer(axum::middleware::from_fn(no_cache_headers));

    // 7. City Admin Governance & Audit Logs (private no-store)
    let admin_routes = Router::new()
        .route("/moderation", get(admin::list_moderation_queue))
        .route("/moderation/{id}", patch(admin::action_moderation_item))
        .route("/reports", get(admin::list_reports))
        .route("/reports/{id}", patch(admin::action_report))
        .route("/audit-logs", get(admin::list_audit_logs))
        .layer(axum::middleware::from_fn(no_cache_headers));

    Router::new()
        .nest("/auth", auth_routes)
        .merge(claims_and_extensions)
        .merge(public_reads)
        .merge(public_submissions)
        .merge(telemetry_routes)
        .nest("/saas", saas_routes)
        .nest("/admin", admin_routes)
}

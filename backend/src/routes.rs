use axum::{
    Router,
    routing::{get, patch, post},
};
use std::sync::Arc;

use crate::AppState;
use crate::handlers::{admin, public, saas};

pub fn api_router() -> Router<Arc<AppState>> {
    Router::new()
        // Public Discovery Hub
        .route("/listings", get(public::list_listings))
        .route("/listings/{slug}", get(public::get_listing))
        .route("/news", get(public::list_news))
        .route("/students/opportunities", get(public::list_opportunities))
        .route("/enquiries", post(public::create_enquiry))
        .route("/telemetry/click", post(public::record_click))
        .route("/reports", post(public::create_report))
        .route("/towns", get(public::list_towns))
        // Multi-Tenant SaaS Portal
        .route("/saas/dashboard", get(saas::get_dashboard))
        .route("/saas/leads", get(saas::list_leads))
        .route("/saas/leads/{id}/status", patch(saas::update_lead_status))
        .route("/saas/opportunities", post(saas::create_opportunity))
        .route("/saas/plan", patch(saas::simulate_plan_upgrade))
        // City Admin Governance
        .route("/admin/moderation", get(admin::list_moderation_queue))
        .route(
            "/admin/moderation/{id}",
            patch(admin::action_moderation_item),
        )
        .route("/admin/reports", get(admin::list_reports))
        .route("/admin/reports/{id}", patch(admin::action_report))
        .route("/admin/audit-logs", get(admin::list_audit_logs))
}

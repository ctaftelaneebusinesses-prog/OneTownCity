#![allow(dead_code)]

use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::FromRow;
use uuid::Uuid;

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "vertical_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum VerticalType {
    News,
    Education,
    Students,
    Business,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "user_role", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum UserRole {
    SuperAdmin,
    CityAdmin,
    SubAdmin,
    ContentProvider,
    TenantOwner,
    TenantStaff,
    Student,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "org_role", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OrgRole {
    Owner,
    Admin,
    Member,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "plan_tier", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum PlanTier {
    Free,
    GrowthBusiness,
    EduPro,
    CampusEnterprise,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "enquiry_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EnquiryType {
    Admission,
    CourseFee,
    GeneralAvailability,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "enquiry_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum EnquiryStatus {
    Open,
    Responded,
    Closed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "verification_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum VerificationStatus {
    NotVerified,
    OwnerClaimed,
    DetailsReviewed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "moderation_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ModerationStatus {
    Submitted,
    PendingReview,
    Approved,
    NeedsChanges,
    Rejected,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "report_reason", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportReason {
    IncorrectDetails,
    ClosedBusiness,
    Duplicate,
    Misleading,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "report_status", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum ReportStatus {
    Open,
    Resolved,
    Dismissed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "news_item_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum NewsItemType {
    News,
    Event,
    CivicProject,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "opportunity_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum OpportunityType {
    Internship,
    Scholarship,
    Hackathon,
    AdmissionDrive,
    StudentHostel,
    StudentDiscount,
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE MODELS & DTOs
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plan {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub tier: PlanTier,
    pub monthly_lead_quota: i32,
    pub price_cents: i32,
    pub features: Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Organization {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub vertical: VerticalType,
    pub city: String,
    pub plan_id: Uuid,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Listing {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub category_id: Uuid,
    pub vertical: VerticalType,
    pub slug: String,
    pub name: String,
    pub tagline: String,
    pub description: String,
    pub address: String,
    pub locality: String,
    pub city: String,
    pub phone: String,
    pub whatsapp: String,
    pub website: String,
    pub email: String,
    pub operating_hours: Value,
    pub facilities: Value,
    pub courses: Value,
    pub admissions: Value,
    pub is_sponsored: bool,
    pub verification_status: VerificationStatus,
    pub moderation_status: ModerationStatus,
    pub rejection_reason: String,
    pub view_count: i32,
    pub whatsapp_clicks: i32,
    pub call_clicks: i32,
    pub last_confirmed_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ListingSummary {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub vertical: VerticalType,
    pub category_name: String,
    pub slug: String,
    pub name: String,
    pub name_te: Option<String>,
    pub tagline: String,
    pub address: String,
    pub locality: String,
    pub city: String,
    pub phone: String,
    pub whatsapp: String,
    pub is_sponsored: bool,
    pub verification_status: VerificationStatus,
    pub view_count: i32,
    pub whatsapp_clicks: i32,
    pub completeness_score: i32,
    pub price_or_fee_range: Option<String>,
    pub map_url: Option<String>,
    pub last_confirmed_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TownNews {
    pub id: Uuid,
    pub tenant_id: Option<Uuid>,
    pub city: String,
    pub locality: String,
    pub item_type: NewsItemType,
    pub title: String,
    pub name_te: Option<String>,
    pub slug: String,
    pub content: String,
    pub source_name: String,
    pub source_url: String,
    pub is_confirmed_fact: bool,
    pub event_date: Option<NaiveDate>,
    pub event_time: Option<String>,
    pub event_venue: Option<String>,
    pub calendar_pillar: Option<String>,
    pub organiser_contact: Option<String>,
    pub entry_eligibility: Option<String>,
    pub moderation_status: ModerationStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StudentOpportunity {
    pub id: Uuid,
    pub tenant_id: Option<Uuid>,
    pub city: String,
    pub opportunity_type: OpportunityType,
    pub title: String,
    pub slug: String,
    pub provider_name: String,
    pub description: String,
    pub eligibility: String,
    pub deadline: Option<NaiveDate>,
    pub apply_url: String,
    pub contact_phone: String,
    pub discount_percent: Option<i32>,
    pub stipend_amount: Option<String>,
    pub moderation_status: ModerationStatus,
    pub anti_scam_acknowledged: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Enquiry {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub listing_id: Uuid,
    pub inquirer_name: String,
    pub inquirer_phone: String,
    pub inquirer_email: String,
    pub enquiry_type: EnquiryType,
    pub message: String,
    pub status: EnquiryStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Offer {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub listing_id: Uuid,
    pub title: String,
    pub discount_details: String,
    pub valid_until: DateTime<Utc>,
    pub is_student_exclusive: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Report {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub reported_by_email: String,
    pub reason: ReportReason,
    pub details: String,
    pub status: ReportStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST & RESPONSE DTOs
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Deserialize)]
pub struct EnquiryCreateDto {
    pub listing_id: Uuid,
    pub inquirer_name: String,
    pub inquirer_phone: String,
    pub inquirer_email: Option<String>,
    pub enquiry_type: EnquiryType,
    pub message: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TelemetryClickDto {
    pub listing_id: Uuid,
    pub click_type: String, // "whatsapp" or "call"
}

#[derive(Debug, Clone, Deserialize)]
pub struct ReportCreateDto {
    pub listing_id: Uuid,
    pub reported_by_email: Option<String>,
    pub reason: ReportReason,
    pub details: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct OpportunityCreateDto {
    pub opportunity_type: OpportunityType,
    pub title: String,
    pub provider_name: String,
    pub description: String,
    pub eligibility: Option<String>,
    pub deadline: Option<NaiveDate>,
    pub apply_url: Option<String>,
    pub contact_phone: Option<String>,
    pub discount_percent: Option<i32>,
    pub stipend_amount: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PlanUpgradeDto {
    pub plan_tier: PlanTier,
}

#[derive(Debug, Clone, Deserialize)]
pub struct StatusUpdateDto {
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TenantDashboardMetrics {
    pub organization_name: String,
    pub organization_slug: String,
    pub vertical: VerticalType,
    pub city: String,
    pub plan_name: String,
    pub plan_tier: PlanTier,
    pub monthly_lead_quota: i32,
    pub leads_used_this_month: i32,
    pub total_views: i64,
    pub total_whatsapp_clicks: i64,
    pub total_call_clicks: i64,
}

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct LeadWithListing {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub listing_name: String,
    pub inquirer_name: String,
    pub inquirer_phone: String,
    pub inquirer_email: String,
    pub enquiry_type: EnquiryType,
    pub message: String,
    pub status: EnquiryStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub entity_type: String,
    pub entity_id: String,
    pub action: String,
    pub actor_id: Option<Uuid>,
    pub actor_role: String,
    pub payload: Value,
    pub created_at: DateTime<Utc>,
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH, SESSION & GOVERNANCE CLAIMS DTOs
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct RegisterDto {
    pub email: String,
    pub password: String,
    pub name: String,
    pub role: Option<UserRole>,
    pub organization_name: Option<String>,
    pub vertical: Option<VerticalType>,
    pub city: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthUserDto {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    pub role: UserRole,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub last_login_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserTenantMembershipDto {
    pub organization_id: Uuid,
    pub organization_name: String,
    pub vertical: VerticalType,
    pub city: String,
    pub role: OrgRole,
    pub plan_tier: PlanTier,
}

#[derive(Debug, Serialize)]
pub struct AuthResponseDto {
    pub user: AuthUserDto,
    pub token: String,
    pub tenant: Option<UserTenantMembershipDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionItemDto {
    pub id: Uuid,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub is_current: bool,
}

#[derive(Debug, Serialize)]
pub struct UserProfileDto {
    pub user: AuthUserDto,
    pub permissions: Vec<String>,
    pub organizations: Vec<UserTenantMembershipDto>,
    pub sessions: Vec<SessionItemDto>,
}

#[derive(Debug, Deserialize)]
pub struct ClaimCreateDto {
    pub listing_id: Uuid,
    pub organization_name: String,
    pub official_email: String,
    pub official_phone: String,
    pub verification_evidence: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OwnershipClaimItem {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub claimant_user_id: Uuid,
    pub organization_name: String,
    pub official_email: String,
    pub official_phone: String,
    pub verification_evidence: String,
    pub status: ModerationStatus,
    pub reviewed_by: Option<Uuid>,
    pub review_notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ClaimReviewDto {
    pub status: ModerationStatus,
    pub review_notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CategoryExtensionRequestDto {
    pub vertical: VerticalType,
    pub proposed_name: String,
    pub justification: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CategoryExtensionItem {
    pub id: Uuid,
    pub requested_by: Uuid,
    pub vertical: VerticalType,
    pub proposed_name: String,
    pub justification: String,
    pub status: ModerationStatus,
    pub reviewed_by: Option<Uuid>,
    pub review_notes: Option<String>,
    pub created_at: DateTime<Utc>,
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE C: DIRECTORY CATEGORIES & NEW WORKFLOW MODELS
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Category {
    pub id: Uuid,
    pub vertical: VerticalType,
    pub slug: String,
    pub name: String,
    pub name_te: Option<String>,
    pub description: String,
    pub search_aliases: Option<String>,
    pub icon: String,
    pub display_order: i32,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CategoryWithCount {
    pub id: Uuid,
    pub vertical: VerticalType,
    pub slug: String,
    pub name: String,
    pub name_te: Option<String>,
    pub description: String,
    pub icon: String,
    pub search_aliases: Option<String>,
    pub listing_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct PublicService {
    pub id: Uuid,
    pub town: String,
    pub name: String,
    pub name_te: Option<String>,
    pub category: String,
    pub phone: String,
    pub emergency_phone: Option<String>,
    pub address: String,
    pub service_hours: String,
    pub official_source_url: String,
    pub last_confirmed_at: DateTime<Utc>,
    pub moderation_status: ModerationStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchTelemetryRequest {
    pub town: String,
    pub query_text: String,
    pub results_count: i32,
    pub led_to_action: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HomepageStats {
    pub total_verified_listings: i64,
    pub total_upcoming_events: i64,
    pub total_student_opportunities: i64,
    pub avg_completeness_pct: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregatedHomepageResponse {
    pub town: String,
    pub popular_categories: Vec<CategoryWithCount>,
    pub happening_this_week: Vec<TownNews>,
    pub civic_tracker: Vec<TownNews>,
    pub whats_new: Vec<ListingSummary>,
    pub spotlight_listings: Vec<ListingSummary>,
    pub public_services: Vec<PublicService>,
    pub stats: HomepageStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PmfMetricsResponse {
    pub search_success_rate_pct: f64,
    pub contact_action_rate_pct: f64,
    pub enquiry_completion_rate_pct: f64,
    pub avg_listing_completeness_pct: f64,
    pub freshness_30d_rate_pct: f64,
    pub repeat_session_rate_pct: f64,
    pub median_provider_response_hours: f64,
    pub median_correction_resolution_hours: f64,
    pub indexable_pages_count: i64,
    pub active_tenant_retention_pct: f64,
    pub sample_searches: i64,
    pub sample_enquiries: i64,
    pub sample_listings: i64,
    pub generated_at: DateTime<Utc>,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingleNewsDetailResponse {
    pub news: TownNews,
    pub related_news: Vec<TownNews>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct OpportunityParentOrg {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub verification_status: VerificationStatus,
    pub city: String,
    pub address: String,
    pub phone: String,
    pub email: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingleOpportunityDetailResponse {
    pub opportunity: StudentOpportunity,
    pub organization: Option<OpportunityParentOrg>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ListingSubmissionDto {
    pub name: String,
    pub vertical: VerticalType,
    pub city: String,
    pub category_id: Option<Uuid>,
    pub address: String,
    pub phone: String,
    pub whatsapp: Option<String>,
    pub website: Option<String>,
    pub email: Option<String>,
    pub description: String,
    pub submitted_by_email: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct NewsSubmissionDto {
    pub title: String,
    pub city: String,
    pub item_type: NewsItemType,
    pub content: String,
    pub source_name: String,
    pub source_url: String,
    pub is_confirmed_fact: Option<bool>,
    pub event_date: Option<String>,
    pub event_time: Option<String>,
    pub event_venue: Option<String>,
    pub submitted_by_email: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CategorySubmissionDto {
    pub vertical: VerticalType,
    pub proposed_name: String,
    pub justification: String,
    pub email: Option<String>,
}

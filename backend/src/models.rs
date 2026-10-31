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
    ContentProvider,
    TenantOwner,
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
    pub slug: String,
    pub content: String,
    pub source_name: String,
    pub source_url: String,
    pub is_confirmed_fact: bool,
    pub event_date: Option<NaiveDate>,
    pub event_time: Option<String>,
    pub event_venue: Option<String>,
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

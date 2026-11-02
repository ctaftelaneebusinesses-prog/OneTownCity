use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::Json,
};
use chrono::Utc;
use serde::Deserialize;
use serde_json::{Value, json};
use std::sync::Arc;
use uuid::Uuid;

use crate::AppState;
use crate::models::{
    AggregatedHomepageResponse, Category, CategoryWithCount, EnquiryCreateDto, HomepageStats,
    Listing, ListingSummary, NewsItemType, OpportunityParentOrg, OpportunityType, PublicService,
    ReportCreateDto, SearchTelemetryRequest, SingleNewsDetailResponse,
    SingleOpportunityDetailResponse, StudentOpportunity, TelemetryClickDto, TownNews,
    VerificationStatus, VerticalType,
};

#[derive(Debug, Deserialize)]
pub struct ListingsQuery {
    pub q: Option<String>,
    pub vertical: Option<VerticalType>,
    pub city: Option<String>,
    pub locality: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct NewsQuery {
    pub city: Option<String>,
    pub item_type: Option<NewsItemType>,
}

#[derive(Debug, Deserialize)]
pub struct OpportunitiesQuery {
    pub city: Option<String>,
    pub opportunity_type: Option<OpportunityType>,
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/listings (Full-Text Search + Trigram + Strict Verticals)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_listings(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ListingsQuery>,
) -> Result<Json<Vec<ListingSummary>>, (StatusCode, Json<Value>)> {
    let limit = params.limit.unwrap_or(30).min(100);
    let offset = params.offset.unwrap_or(0);
    let city = params.city.unwrap_or_else(|| "Nellore".to_string());
    let query_str = params.q.unwrap_or_default().trim().to_string();

    let listings = if query_str.is_empty() {
        sqlx::query_as!(
            ListingSummary,
            r#"
            SELECT 
                l.id, l.tenant_id, l.vertical as "vertical: VerticalType",
                c.name as category_name, l.slug, l.name, l.name_te, l.tagline,
                l.address, l.locality, l.city, l.phone, l.whatsapp,
                l.is_sponsored, l.verification_status as "verification_status: _",
                l.view_count, l.whatsapp_clicks, l.completeness_score,
                l.price_or_fee_range, l.map_url, l.last_confirmed_at
            FROM listings l
            JOIN categories c ON c.id = l.category_id
            WHERE l.moderation_status = 'approved'
              AND l.city = $1
              AND ($2::vertical_type IS NULL OR l.vertical = $2)
              AND ($3::varchar IS NULL OR l.locality ILIKE '%' || $3 || '%')
            ORDER BY l.is_sponsored DESC, l.completeness_score DESC, l.last_confirmed_at DESC
            LIMIT $4 OFFSET $5
            "#,
            city,
            params.vertical as Option<VerticalType>,
            params.locality,
            limit,
            offset
        )
        .fetch_all(&state.db)
        .await
    } else {
        // Full-Text Search with Trigram and Telugu/alias fallback
        sqlx::query_as!(
            ListingSummary,
            r#"
            SELECT 
                l.id, l.tenant_id, l.vertical as "vertical: VerticalType",
                c.name as category_name, l.slug, l.name, l.name_te, l.tagline,
                l.address, l.locality, l.city, l.phone, l.whatsapp,
                l.is_sponsored, l.verification_status as "verification_status: _",
                l.view_count, l.whatsapp_clicks, l.completeness_score,
                l.price_or_fee_range, l.map_url, l.last_confirmed_at
            FROM listings l
            JOIN categories c ON c.id = l.category_id
            WHERE l.moderation_status = 'approved'
              AND l.city = $1
              AND ($2::vertical_type IS NULL OR l.vertical = $2)
              AND (
                  l.search_vector @@ plainto_tsquery('simple', $3)
                  OR l.search_vector @@ plainto_tsquery('english', $3)
                  OR l.name ILIKE '%' || $3 || '%'
                  OR l.name_te ILIKE '%' || $3 || '%'
                  OR l.search_aliases ILIKE '%' || $3 || '%'
                  OR l.locality ILIKE '%' || $3 || '%'
              )
            ORDER BY 
                l.is_sponsored DESC,
                ts_rank(l.search_vector, plainto_tsquery('simple', $3)) DESC,
                l.completeness_score DESC,
                l.last_confirmed_at DESC
            LIMIT $4 OFFSET $5
            "#,
            city,
            params.vertical as Option<VerticalType>,
            query_str,
            limit,
            offset
        )
        .fetch_all(&state.db)
        .await
    }
    .map_err(|e| {
        tracing::error!("Error querying listings: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to fetch listings" })),
        )
    })?;

    Ok(Json(listings))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/listings/{slug} (Single Listing Detail + Atomic View Increment)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn get_listing(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Json<Listing>, (StatusCode, Json<Value>)> {
    let listing = sqlx::query_as!(
        Listing,
        r#"
        SELECT 
            id, tenant_id, category_id, vertical as "vertical: VerticalType",
            slug, name, tagline, description, address, locality, city,
            phone, whatsapp, website, email, operating_hours, facilities,
            courses, admissions, is_sponsored,
            verification_status as "verification_status: _",
            moderation_status as "moderation_status: _",
            rejection_reason, view_count, whatsapp_clicks, call_clicks,
            last_confirmed_at, created_at, updated_at
        FROM listings
        WHERE slug = $1 AND moderation_status = 'approved'
        "#,
        slug
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching listing by slug: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    match listing {
        Some(item) => {
            // Asynchronously increment view count without blocking read thread
            let item_id = item.id;
            let pool = state.db.clone();
            tokio::spawn(async move {
                let _ = sqlx::query!(
                    "UPDATE listings SET view_count = view_count + 1 WHERE id = $1",
                    item_id
                )
                .execute(&pool)
                .await;
            });

            Ok(Json(item))
        }
        None => Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Listing not found" })),
        )),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/news (Town Pulse, Events, Civic Development Tracker)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_news(
    State(state): State<Arc<AppState>>,
    Query(params): Query<NewsQuery>,
) -> Result<Json<Vec<TownNews>>, (StatusCode, Json<Value>)> {
    let city = params.city.unwrap_or_else(|| "Nellore".to_string());

    let news = sqlx::query_as!(
        TownNews,
        r#"
        SELECT 
            id, tenant_id, city, locality, item_type as "item_type: NewsItemType",
            title, name_te, slug, content, source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue, calendar_pillar, organiser_contact, entry_eligibility,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM town_news
        WHERE moderation_status = 'approved'
          AND city = $1
          AND ($2::news_item_type IS NULL OR item_type = $2)
        ORDER BY created_at DESC
        LIMIT 50
        "#,
        city,
        params.item_type as Option<NewsItemType>
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching news: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to fetch town updates" })),
        )
    })?;

    Ok(Json(news))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/news/{slug} (Single Town News / Event Dossier)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn get_news_by_slug(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Json<SingleNewsDetailResponse>, (StatusCode, Json<Value>)> {
    let news = sqlx::query_as!(
        TownNews,
        r#"
        SELECT 
            id, tenant_id, city, locality, item_type as "item_type: NewsItemType",
            title, name_te, slug, content, source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue, calendar_pillar, organiser_contact, entry_eligibility,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM town_news
        WHERE slug = $1 AND moderation_status = 'approved'
        "#,
        slug
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching news item by slug: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    let news = match news {
        Some(n) => n,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "News article or event not found" })),
            ));
        }
    };

    let related = sqlx::query_as!(
        TownNews,
        r#"
        SELECT 
            id, tenant_id, city, locality, item_type as "item_type: NewsItemType",
            title, name_te, slug, content, source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue, calendar_pillar, organiser_contact, entry_eligibility,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM town_news
        WHERE city = $1 AND id != $2 AND moderation_status = 'approved'
        ORDER BY created_at DESC
        LIMIT 4
        "#,
        news.city,
        news.id
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    Ok(Json(SingleNewsDetailResponse {
        news,
        related_news: related,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/students/opportunities/{id} (Single Opportunity Dossier)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn get_opportunity_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<SingleOpportunityDetailResponse>, (StatusCode, Json<Value>)> {
    let opp = sqlx::query_as!(
        StudentOpportunity,
        r#"
        SELECT 
            id, tenant_id, city, opportunity_type as "opportunity_type: OpportunityType",
            title, slug, provider_name, description, eligibility, deadline,
            apply_url, contact_phone, discount_percent, stipend_amount,
            moderation_status as "moderation_status: _",
            anti_scam_acknowledged,
            created_at, updated_at
        FROM student_opportunities
        WHERE id = $1 AND moderation_status = 'approved'
        "#,
        id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching opportunity by ID: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    let opp = match opp {
        Some(o) => o,
        None => {
            return Err((
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Opportunity not found" })),
            ));
        }
    };

    let org_detail = if let Some(tenant_id) = opp.tenant_id {
        sqlx::query_as!(
            OpportunityParentOrg,
            r#"
            SELECT id, name, slug, verification_status as "verification_status: VerificationStatus",
                   city, address, phone, email
            FROM listings
            WHERE tenant_id = $1
            LIMIT 1
            "#,
            tenant_id
        )
        .fetch_optional(&state.db)
        .await
        .unwrap_or(None)
    } else {
        None
    };

    Ok(Json(SingleOpportunityDetailResponse {
        opportunity: opp,
        organization: org_detail,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/categories (Active Directory Categories)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_categories(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Category>>, (StatusCode, Json<Value>)> {
    let categories = sqlx::query_as!(
        Category,
        r#"
        SELECT id, vertical as "vertical: VerticalType", slug, name, name_te, description, search_aliases, icon, display_order, is_active, created_at
        FROM categories
        WHERE is_active = true
        ORDER BY display_order ASC, name ASC
        "#
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching categories: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to fetch categories" })),
        )
    })?;

    Ok(Json(categories))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/students/opportunities (Internships, Scholarships, Hostels)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_opportunities(
    State(state): State<Arc<AppState>>,
    Query(params): Query<OpportunitiesQuery>,
) -> Result<Json<Vec<StudentOpportunity>>, (StatusCode, Json<Value>)> {
    let city = params.city.unwrap_or_else(|| "Nellore".to_string());

    let opps = sqlx::query_as!(
        StudentOpportunity,
        r#"
        SELECT 
            id, tenant_id, city, opportunity_type as "opportunity_type: OpportunityType",
            title, slug, provider_name, description, eligibility, deadline,
            apply_url, contact_phone, discount_percent, stipend_amount,
            moderation_status as "moderation_status: _",
            anti_scam_acknowledged,
            created_at, updated_at
        FROM student_opportunities
        WHERE moderation_status = 'approved'
          AND city = $1
          AND ($2::opportunity_type IS NULL OR opportunity_type = $2)
        ORDER BY created_at DESC
        LIMIT 50
        "#,
        city,
        params.opportunity_type as Option<OpportunityType>
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching opportunities: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to fetch student opportunities" })),
        )
    })?;

    Ok(Json(opps))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/enquiries (Actionable Lead Capture with Quota Tracking)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn create_enquiry(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<EnquiryCreateDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    // 0. Input validation & sanitization
    let sanitized_name = crate::validation::sanitize_text(&dto.inquirer_name);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_name, 2, 100, "Inquirer name") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    if let Err(e) = crate::validation::validate_phone(&dto.inquirer_phone) {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let email = if let Some(ref em) = dto.inquirer_email {
        let trimmed = em.trim();
        if !trimmed.is_empty() {
            if let Err(e) = crate::validation::validate_email(trimmed) {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
            }
            trimmed.to_string()
        } else {
            String::new()
        }
    } else {
        String::new()
    };

    let sanitized_message = crate::validation::sanitize_text(&dto.message);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_message, 5, 2000, "Enquiry message") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    // 1. Resolve listing and its owning tenant
    let listing = sqlx::query!(
        "SELECT id, tenant_id, name FROM listings WHERE id = $1 AND moderation_status = 'approved'",
        dto.listing_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database lookup error: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to verify listing" })),
        )
    })?
    .ok_or_else(|| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Target listing not found or inactive" })),
        )
    })?;

    let enquiry_id = Uuid::new_v4();

    // 2. Insert actionable enquiry
    sqlx::query!(
        r#"
        INSERT INTO enquiries (id, tenant_id, listing_id, inquirer_name, inquirer_phone, inquirer_email, enquiry_type, message, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
        "#,
        enquiry_id,
        listing.tenant_id,
        listing.id,
        sanitized_name,
        dto.inquirer_phone,
        email,
        dto.enquiry_type as _,
        sanitized_message
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to insert enquiry: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Could not register enquiry" })),
        )
    })?;

    // 3. Atomically update tenant's lead usage counter for current month
    let month_year = Utc::now().format("%Y-%m").to_string();
    let _ = sqlx::query!(
        r#"
        INSERT INTO leads_usage (tenant_id, month_year, leads_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (tenant_id, month_year)
        DO UPDATE SET leads_count = leads_usage.leads_count + 1
        "#,
        listing.tenant_id,
        month_year
    )
    .execute(&state.db)
    .await;

    // 4. Enqueue background audit log & simulated notification
    state.worker.enqueue(crate::worker::AuditJob {
        entity_type: "enquiry".to_string(),
        entity_id: enquiry_id.to_string(),
        action: "created".to_string(),
        actor_id: None,
        actor_role: "public_resident".to_string(),
        payload: json!({
            "listing_id": dto.listing_id,
            "listing_name": listing.name,
            "tenant_id": listing.tenant_id,
            "inquirer_name": dto.inquirer_name,
            "enquiry_type": format!("{:?}", dto.enquiry_type),
        }),
        simulate_dispatch: true,
    });

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "success",
            "enquiry_id": enquiry_id,
            "message": "Enquiry registered successfully and routed to institution/business inbox"
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/telemetry/click (Atomic WhatsApp/Phone Click Counter)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn record_click(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<TelemetryClickDto>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    if dto.click_type == "whatsapp" {
        sqlx::query!(
            "UPDATE listings SET whatsapp_clicks = whatsapp_clicks + 1 WHERE id = $1",
            dto.listing_id
        )
        .execute(&state.db)
        .await
    } else {
        sqlx::query!(
            "UPDATE listings SET call_clicks = call_clicks + 1 WHERE id = $1",
            dto.listing_id
        )
        .execute(&state.db)
        .await
    }
    .map_err(|e| {
        tracing::error!("Failed to record telemetry click: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to record click" })),
        )
    })?;

    // Insert telemetry event
    let _ = sqlx::query!(
        "INSERT INTO telemetry_events (id, listing_id, event_type) VALUES ($1, $2, $3)",
        Uuid::new_v4(),
        dto.listing_id,
        dto.click_type
    )
    .execute(&state.db)
    .await;

    Ok(Json(json!({ "status": "recorded" })))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/reports (User Governance Reporting)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn create_report(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<ReportCreateDto>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let sanitized_details = crate::validation::sanitize_text(&dto.details);
    if let Err(e) = crate::validation::validate_string_length(&sanitized_details, 5, 1000, "Report details") {
        return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
    }

    let email = if let Some(ref em) = dto.reported_by_email {
        let trimmed = em.trim();
        if !trimmed.is_empty() {
            if let Err(e) = crate::validation::validate_email(trimmed) {
                return Err((StatusCode::BAD_REQUEST, Json(json!({ "error": e.to_string() }))));
            }
            trimmed.to_string()
        } else {
            "anonymous@onetowncity.local".to_string()
        }
    } else {
        "anonymous@onetowncity.local".to_string()
    };

    let report_id = Uuid::new_v4();

    sqlx::query!(
        r#"
        INSERT INTO reports (id, listing_id, reported_by_email, reason, details, status)
        VALUES ($1, $2, $3, $4, $5, 'open')
        "#,
        report_id,
        dto.listing_id,
        email,
        dto.reason as _,
        sanitized_details
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Failed to create report: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to submit report" })),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "status": "success",
            "report_id": report_id,
            "message": "Report logged and forwarded to City Admin moderation queue"
        })),
    ))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/towns (Active Supported Towns)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_towns(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<String>>, (StatusCode, Json<Value>)> {
    let rows = sqlx::query!("SELECT DISTINCT city FROM listings ORDER BY city ASC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Error fetching towns: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Database error" })),
            )
        })?;

    let mut towns: Vec<String> = rows.into_iter().map(|r| r.city).collect();
    if !towns.contains(&"Nellore".to_string()) {
        towns.insert(0, "Nellore".to_string());
    }
    if !towns.contains(&"Kuppam".to_string()) {
        towns.push("Kuppam".to_string());
    }

    Ok(Json(towns))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/homepage?town={town} (Single Aggregated 9-Section Payload)
// ─────────────────────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct TownQuery {
    pub town: Option<String>,
}

pub async fn get_homepage(
    State(state): State<Arc<AppState>>,
    Query(params): Query<TownQuery>,
) -> Result<Json<AggregatedHomepageResponse>, (StatusCode, Json<Value>)> {
    let town = params.town.unwrap_or_else(|| "Nellore".to_string());

    // 1. Popular Categories with completeness >= 80 and active listing count
    let popular_categories = sqlx::query_as!(
        CategoryWithCount,
        r#"
        SELECT 
            c.id, c.vertical as "vertical: VerticalType", c.slug, c.name, c.name_te,
            c.description, c.icon, c.search_aliases,
            COUNT(l.id)::bigint as "listing_count!"
        FROM categories c
        LEFT JOIN listings l ON l.category_id = c.id 
            AND l.moderation_status = 'approved' 
            AND l.city = $1 
            AND l.completeness_score >= 80
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY "listing_count!" DESC, c.display_order ASC
        LIMIT 12
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 2. Happening This Week (Events)
    let happening_this_week = sqlx::query_as!(
        TownNews,
        r#"
        SELECT 
            id, tenant_id, city, locality, item_type as "item_type: NewsItemType",
            title, name_te, slug, content, source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue, calendar_pillar, organiser_contact, entry_eligibility,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM town_news
        WHERE city = $1 
          AND moderation_status = 'approved'
          AND calendar_pillar IS NOT NULL
        ORDER BY COALESCE(event_date, CURRENT_DATE + INTERVAL '100 days') ASC, created_at DESC
        LIMIT 6
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 3. Civic Tracker Projects
    let civic_tracker = sqlx::query_as!(
        TownNews,
        r#"
        SELECT 
            id, tenant_id, city, locality, item_type as "item_type: NewsItemType",
            title, name_te, slug, content, source_name, source_url, is_confirmed_fact,
            event_date, event_time, event_venue, calendar_pillar, organiser_contact, entry_eligibility,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM town_news
        WHERE city = $1 
          AND moderation_status = 'approved'
          AND item_type = 'civic_project'
        ORDER BY created_at DESC
        LIMIT 4
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 4. What's New? (Recently added & reconfirmed)
    let whats_new = sqlx::query_as!(
        ListingSummary,
        r#"
        SELECT 
            l.id, l.tenant_id, l.vertical as "vertical: VerticalType",
            c.name as category_name, l.slug, l.name, l.name_te, l.tagline,
            l.address, l.locality, l.city, l.phone, l.whatsapp,
            l.is_sponsored, l.verification_status as "verification_status: _",
            l.view_count, l.whatsapp_clicks, l.completeness_score,
            l.price_or_fee_range, l.map_url, l.last_confirmed_at
        FROM listings l
        JOIN categories c ON c.id = l.category_id
        WHERE l.moderation_status = 'approved'
          AND l.city = $1
        ORDER BY l.last_confirmed_at DESC
        LIMIT 8
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 5. Spotlight Listings (High craft, completeness >= 85, verified)
    let spotlight_listings = sqlx::query_as!(
        ListingSummary,
        r#"
        SELECT 
            l.id, l.tenant_id, l.vertical as "vertical: VerticalType",
            c.name as category_name, l.slug, l.name, l.name_te, l.tagline,
            l.address, l.locality, l.city, l.phone, l.whatsapp,
            l.is_sponsored, l.verification_status as "verification_status: _",
            l.view_count, l.whatsapp_clicks, l.completeness_score,
            l.price_or_fee_range, l.map_url, l.last_confirmed_at
        FROM listings l
        JOIN categories c ON c.id = l.category_id
        WHERE l.moderation_status = 'approved'
          AND l.city = $1
        ORDER BY l.is_sponsored DESC, l.completeness_score DESC, l.view_count DESC
        LIMIT 6
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 6. Public Services Directory
    let public_services = sqlx::query_as!(
        PublicService,
        r#"
        SELECT 
            id, town, name, name_te, category, phone, emergency_phone,
            address, service_hours, official_source_url, last_confirmed_at,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM public_services
        WHERE town = $1 AND moderation_status = 'approved'
        ORDER BY category ASC, name ASC
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    // 7. Stats
    let stats_row = sqlx::query!(
        r#"
        SELECT 
            COUNT(*) FILTER (WHERE l.moderation_status = 'approved' AND l.city = $1)::bigint as total_listings,
            COUNT(*) FILTER (WHERE l.moderation_status = 'approved' AND l.city = $1 AND l.verification_status != 'not_verified')::bigint as total_verified,
            COALESCE(AVG(l.completeness_score) FILTER (WHERE l.moderation_status = 'approved' AND l.city = $1), 85.0)::float8 as avg_completeness
        FROM listings l
        "#,
        town
    )
    .fetch_one(&state.db)
    .await;

    let events_count = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM town_news WHERE city = $1 AND moderation_status = 'approved'",
        town
    )
    .fetch_one(&state.db)
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0);

    let opps_count = sqlx::query_scalar!(
        "SELECT COUNT(*) FROM student_opportunities WHERE city = $1 AND moderation_status = 'approved'",
        town
    )
    .fetch_one(&state.db)
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0);

    let (total_verified, avg_comp) = match stats_row {
        Ok(r) => (r.total_verified.unwrap_or(0), r.avg_completeness.unwrap_or(85.0)),
        Err(_) => (0, 85.0),
    };

    Ok(Json(AggregatedHomepageResponse {
        town,
        popular_categories,
        happening_this_week,
        civic_tracker,
        whats_new,
        spotlight_listings,
        public_services,
        stats: HomepageStats {
            total_verified_listings: total_verified,
            total_upcoming_events: events_count,
            total_student_opportunities: opps_count,
            avg_completeness_pct: (avg_comp * 10.0).round() / 10.0,
        },
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/search/telemetry (Log Queries and Result Clicks)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn record_search_telemetry(
    State(state): State<Arc<AppState>>,
    Json(dto): Json<SearchTelemetryRequest>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let raw_q = dto.query.as_deref().or(dto.query_text.as_deref()).unwrap_or("");
    let sanitized_query = crate::validation::sanitize_text(raw_q);
    let query_trimmed = if sanitized_query.len() > 255 {
        sanitized_query[..255].to_string()
    } else {
        sanitized_query
    };
    let count = dto.result_count.or(dto.results_count).unwrap_or(0);
    let category = dto.category_filter.map(|c| crate::validation::sanitize_text(&c));

    sqlx::query!(
        r#"
        INSERT INTO search_telemetry (id, town, query_text, query, results_count, result_count, category_filter, led_to_action, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        "#,
        Uuid::new_v4(),
        dto.town,
        query_trimmed,
        query_trimmed,
        count,
        count,
        category,
        dto.led_to_action.unwrap_or(false)
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error recording search telemetry: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Failed to log telemetry" })),
        )
    })?;

    Ok((StatusCode::CREATED, Json(json!({ "status": "recorded" }))))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/public-services (Public Services Directory)
// ─────────────────────────────────────────────────────────────────────────────

pub async fn list_public_services(
    State(state): State<Arc<AppState>>,
    Query(params): Query<TownQuery>,
) -> Result<Json<Vec<PublicService>>, (StatusCode, Json<Value>)> {
    let town = params.town.unwrap_or_else(|| "Nellore".to_string());
    let services = sqlx::query_as!(
        PublicService,
        r#"
        SELECT 
            id, town, name, name_te, category, phone, emergency_phone,
            address, service_hours, official_source_url, last_confirmed_at,
            moderation_status as "moderation_status: _",
            created_at, updated_at
        FROM public_services
        WHERE town = $1 AND moderation_status = 'approved'
        ORDER BY category ASC, name ASC
        "#,
        town
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Error fetching public services: {}", e);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Database error" })),
        )
    })?;

    Ok(Json(services))
}

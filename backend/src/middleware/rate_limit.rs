use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use axum::{
    body::Body,
    extract::{Request, State},
    middleware::Next,
    response::Response,
};

use crate::AppState;
use crate::error::AppError;

/// Individual client IP token bucket
struct ClientBucket {
    tokens: f64,
    last_update: Instant,
    last_seen: Instant,
}

/// Token bucket rate limiter with automatic stale eviction
pub struct RateLimiter {
    capacity: f64,
    refill_rate_per_sec: f64,
    buckets: Mutex<HashMap<String, ClientBucket>>,
}

impl RateLimiter {
    pub fn new(capacity: usize, window: Duration) -> Self {
        let capacity_f = capacity as f64;
        let refill_rate = capacity_f / window.as_secs_f64();
        Self {
            capacity: capacity_f,
            refill_rate_per_sec: refill_rate,
            buckets: Mutex::new(HashMap::new()),
        }
    }

    /// Checks if a client IP is allowed to make a request.
    /// If allowed, consumes 1 token and returns Ok(()).
    /// If exhausted, returns Err(retry_after_secs).
    pub fn check(&self, ip: &str) -> Result<(), u64> {
        let now = Instant::now();
        let mut buckets = match self.buckets.lock() {
            Ok(guard) => guard,
            Err(poisoned) => poisoned.into_inner(),
        };

        // If map exceeds 5000 entries, do an immediate eager sweep of entries idle > 5 minutes
        if buckets.len() > 5000 {
            buckets.retain(|_, b| now.duration_since(b.last_seen) < Duration::from_secs(300));
        }

        let bucket = buckets.entry(ip.to_string()).or_insert_with(|| ClientBucket {
            tokens: self.capacity,
            last_update: now,
            last_seen: now,
        });

        // Refill tokens based on elapsed time
        let elapsed = now.duration_since(bucket.last_update).as_secs_f64();
        bucket.tokens = (bucket.tokens + elapsed * self.refill_rate_per_sec).min(self.capacity);
        bucket.last_update = now;
        bucket.last_seen = now;

        if bucket.tokens >= 1.0 {
            bucket.tokens -= 1.0;
            Ok(())
        } else {
            let needed = 1.0 - bucket.tokens;
            let wait_secs = (needed / self.refill_rate_per_sec).ceil() as u64;
            Err(wait_secs.max(1))
        }
    }

    /// Evicts entries that haven't made a request in the given retention duration.
    pub fn evict_stale(&self, max_idle: Duration) {
        let now = Instant::now();
        if let Ok(mut buckets) = self.buckets.lock() {
            buckets.retain(|_, b| now.duration_since(b.last_seen) < max_idle);
        }
    }
}

/// Helper to extract caller IP from headers (x-forwarded-for, x-real-ip) or fallback
pub fn extract_client_ip(req: &Request<Body>) -> String {
    if let Some(forwarded) = req.headers().get("x-forwarded-for")
        && let Ok(s) = forwarded.to_str()
        && let Some(first) = s.split(',').next()
    {
        let trimmed = first.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }
    if let Some(real_ip) = req.headers().get("x-real-ip")
        && let Ok(s) = real_ip.to_str()
    {
        let trimmed = s.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }
    "127.0.0.1".to_string()
}

/// Rate limiting middleware for authentication endpoints (10 requests per minute per IP)
pub async fn auth_rate_limit(
    State(state): State<Arc<AppState>>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let client_ip = extract_client_ip(&req);
    match state.auth_limiter.check(&client_ip) {
        Ok(()) => Ok(next.run(req).await),
        Err(retry_after) => Err(AppError::rate_limited(retry_after)),
    }
}

/// Rate limiting middleware for public submissions (enquiries & reports: 15 requests per 5 minutes per IP)
pub async fn submission_rate_limit(
    State(state): State<Arc<AppState>>,
    req: Request<Body>,
    next: Next,
) -> Result<Response, AppError> {
    let client_ip = extract_client_ip(&req);
    match state.submission_limiter.check(&client_ip) {
        Ok(()) => Ok(next.run(req).await),
        Err(retry_after) => Err(AppError::rate_limited(retry_after)),
    }
}

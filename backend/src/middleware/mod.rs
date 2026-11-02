pub mod rate_limit;

use axum::{
    body::Body,
    extract::Request,
    http::{HeaderValue, header},
    middleware::Next,
    response::Response,
};

/// Middleware that injects secure baseline HTTP headers into all responses:
/// - X-Content-Type-Options: nosniff
/// - X-Frame-Options: DENY
/// - Referrer-Policy: strict-origin-when-cross-origin
pub async fn security_headers(req: Request<Body>, next: Next) -> Response {
    let mut res = next.run(req).await;
    let headers = res.headers_mut();

    headers.insert(
        header::HeaderName::from_static("x-content-type-options"),
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        header::HeaderName::from_static("x-frame-options"),
        HeaderValue::from_static("DENY"),
    );
    headers.insert(
        header::HeaderName::from_static("referrer-policy"),
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );

    res
}

/// Middleware that attaches strict no-store cache headers to sensitive endpoints (auth, saas, admin)
pub async fn no_cache_headers(req: Request<Body>, next: Next) -> Response {
    let mut res = next.run(req).await;
    res.headers_mut().insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("private, no-store, no-cache, must-revalidate"),
    );
    res
}

/// Middleware that attaches public cache headers to read-only directory endpoints
pub async fn public_cache_headers(req: Request<Body>, next: Next) -> Response {
    let mut res = next.run(req).await;
    // Only add caching on successful GET responses
    if res.status().is_success() {
        res.headers_mut().insert(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, s-maxage=60, stale-while-revalidate=300"),
        );
    }
    res
}

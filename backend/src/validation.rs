use std::sync::LazyLock;
use regex::Regex;
use crate::error::AppError;

static SCRIPT_BLOCK_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?is)<(script|style|iframe|object|embed|svg|applet)[^>]*>.*?</(script|style|iframe|object|embed|svg|applet)>")
        .unwrap_or_else(|_| Regex::new("a^").unwrap_or_else(|_| unreachable!()))
});

static HTML_TAG_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"<[^>]*>")
        .unwrap_or_else(|_| Regex::new("a^").unwrap_or_else(|_| unreachable!()))
});

static PHONE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[0-9+\-\s()]{7,20}$")
        .unwrap_or_else(|_| Regex::new("a^").unwrap_or_else(|_| unreachable!()))
});

static EMAIL_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$")
        .unwrap_or_else(|_| Regex::new("a^").unwrap_or_else(|_| unreachable!()))
});

/// Determines if a character is within known Unicode emoji code-point blocks.
/// Strict Zero Emojis rule across OneTownCity.
fn is_emoji(c: char) -> bool {
    matches!(c as u32,
        0x1F600..=0x1F64F | // Emoticons
        0x1F300..=0x1F5FF | // Misc Symbols and Pictographs
        0x1F680..=0x1F6FF | // Transport and Map
        0x1F700..=0x1F77F | // Alchemical Symbols
        0x1F780..=0x1F7FF | // Geometric Shapes Extended
        0x1F800..=0x1F8FF | // Supplemental Arrows-C
        0x1F900..=0x1F9FF | // Supplemental Symbols and Pictographs
        0x1FA00..=0x1FA6F | // Chess Symbols
        0x1FA70..=0x1FAFF | // Symbols and Pictographs Extended-A
        0x2600..=0x26FF   | // Misc symbols (e.g. ☕, ⚡, ✈, ⏳)
        0x2700..=0x27BF   | // Dingbats
        0xFE00..=0xFE0F   | // Variation Selectors
        0x1F1E6..=0x1F1FF   // Regional Indicator Symbols (Flags)
    )
}

/// Strips all HTML/script tags and Unicode emojis from an input string, returning a sanitized string.
pub fn sanitize_text(input: &str) -> String {
    // 1. Remove dangerous executable/embed elements and their inner content
    let stripped_blocks = SCRIPT_BLOCK_RE.replace_all(input, "");
    // 2. Remove remaining HTML tags
    let stripped_tags = HTML_TAG_RE.replace_all(&stripped_blocks, "");
    // 3. Filter out emojis
    let clean: String = stripped_tags.chars().filter(|&c| !is_emoji(c)).collect();
    clean.trim().to_string()
}

/// Enforces valid http/https URLs and explicitly rejects dangerous pseudo-schemes.
pub fn validate_url(url: &str) -> Result<(), AppError> {
    let trimmed = url.trim();
    if trimmed.is_empty() {
        return Ok(());
    }
    let lower = trimmed.to_lowercase();
    if lower.starts_with("javascript:")
        || lower.starts_with("data:")
        || lower.starts_with("vbscript:")
        || lower.starts_with("file:")
    {
        return Err(AppError::validation(format!(
            "Prohibited or dangerous URL scheme in '{}'",
            trimmed
        )));
    }
    if !lower.starts_with("http://") && !lower.starts_with("https://") {
        return Err(AppError::validation(format!(
            "URL must begin with http:// or https://: '{}'",
            trimmed
        )));
    }
    Ok(())
}

/// Validates phone or WhatsApp numbers: 7 to 20 characters matching digits, +, -, spaces, parentheses.
pub fn validate_phone(phone: &str) -> Result<(), AppError> {
    let trimmed = phone.trim();
    if trimmed.is_empty() {
        return Ok(());
    }
    if !PHONE_RE.is_match(trimmed) {
        return Err(AppError::validation(format!(
            "Invalid telephone or WhatsApp format: '{}'. Must contain 7-20 digits and optional (+ - ()).",
            trimmed
        )));
    }
    Ok(())
}

/// Validates email address format
pub fn validate_email(email: &str) -> Result<(), AppError> {
    let trimmed = email.trim();
    if trimmed.is_empty() {
        return Err(AppError::validation("Email address cannot be empty"));
    }
    if !EMAIL_RE.is_match(trimmed) {
        return Err(AppError::validation(format!(
            "Invalid email address format: '{}'",
            trimmed
        )));
    }
    Ok(())
}

/// Validates text character bounds
pub fn validate_string_length(
    val: &str,
    min: usize,
    max: usize,
    field_name: &str,
) -> Result<(), AppError> {
    let count = val.trim().chars().count();
    if count < min {
        return Err(AppError::validation(format!(
            "{} must be at least {} characters (got {})",
            field_name, min, count
        )));
    }
    if count > max {
        return Err(AppError::validation(format!(
            "{} cannot exceed {} characters (got {})",
            field_name, max, count
        )));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_text_strips_html_and_emojis() {
        let dirty = "<script>alert('xss')</script>Hello 🚀 World<b>!</b>";
        let cleaned = sanitize_text(dirty);
        assert_eq!(cleaned, "Hello  World!");
    }

    #[test]
    fn test_validate_url_rejects_javascript() {
        assert!(validate_url("javascript:alert(1)").is_err());
        assert!(validate_url("data:text/html;base64,...").is_err());
        assert!(validate_url("ftp://example.com").is_err());
        assert!(validate_url("https://example.com/apply").is_ok());
    }

    #[test]
    fn test_validate_phone() {
        assert!(validate_phone("+91 98480 22338").is_ok());
        assert!(validate_phone("123").is_err()); // too short
        assert!(validate_phone("abc1234567").is_err()); // letters
    }
}

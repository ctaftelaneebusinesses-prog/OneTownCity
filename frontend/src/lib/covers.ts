// OneTownCity — Resolution-Independent Vector SVG Covers & Design System
// Converted all raster images to crisp, scalable SVG architectural elevations

// Pure vector category covers — 100% scalable, local, zero blur or network lag
const CATEGORY_COVERS: Record<string, string> = {
  college:    "/media/pes-engineering-college.svg",
  university: "/media/dravidian-university.svg",
  school:     "/media/kuppam-schools.svg",
  hospital:   "/media/kuppam-hospitals.svg",
  cafe:       "/media/study-cafe.svg",
  bookstore:  "/media/minerva-books.svg",
  hostel:     "/media/student-hostel.svg",
  retail:     "/media/regional-business.svg",
  office:     "/media/business-consulting.svg",
  tech:       "/media/digital-marketing.svg",
  civic:      "/media/civic-development.svg",
  heritage:   "/media/gangamma-civic.svg",
  default:    "/media/pes-engineering-college.svg",
};

/**
 * Swiss Civic Editorial SVG fallback — geometric grid on ink canvas.
 * Clean #111110 ink + #FF4F17 signal accents.
 */
export const GEOMETRIC_FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1A18"/>
      <stop offset="100%" stop-color="#111110"/>
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0L0 0L0 32" fill="none" stroke="rgba(216,211,200,0.08)" stroke-width="0.8"/>
    </pattern>
    <pattern id="dots" width="64" height="64" patternUnits="userSpaceOnUse">
      <circle cx="32" cy="32" r="1.5" fill="rgba(255,79,23,0.2)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
  <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,79,23,0.12)" stroke-width="1"/>
  <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,79,23,0.06)" stroke-width="1"/>
</svg>
`)}`;

export function getCoverImage(category: string, name: string): string {
  const text = `${category || ""} ${name || ""}`.toLowerCase();

  // Institution & Entity SVG vector matching
  if (text.includes("pes") && (text.includes("engineering") || text.includes("medical") || text.includes("institute"))) {
    return "/media/pes-engineering-college.svg";
  }
  if (text.includes("dravidian")) {
    return "/media/dravidian-university.svg";
  }
  if (text.includes("gangamma")) {
    return "/media/gangamma-civic.svg";
  }
  if (text.includes("hospital") || text.includes("clinic") || text.includes("medical") || text.includes("health")) {
    return "/media/kuppam-hospitals.svg";
  }
  if (text.includes("minerva")) {
    return "/media/minerva-books.svg";
  }
  if (text.includes("study corner") || (text.includes("study") && text.includes("cafe"))) {
    return "/media/study-cafe.svg";
  }
  if (text.includes("school") || text.includes("vidyalaya") || text.includes("academy")) {
    return "/media/kuppam-schools.svg";
  }
  if (text.includes("consulting") || text.includes("solutions") || text.includes("advisory")) {
    return "/media/business-consulting.svg";
  }
  if (text.includes("digital") || text.includes("marketing") || text.includes("cyber") || text.includes("software")) {
    return "/media/digital-marketing.svg";
  }
  if (text.includes("development") || text.includes("bypass") || text.includes("corridor") || text.includes("expressway")) {
    return "/media/civic-development.svg";
  }
  if (text.includes("hostel") || text.includes("residence") || text.includes("pg") || text.includes("accommodation") || text.includes("mansion")) {
    return "/media/student-hostel.svg";
  }
  if (text.includes("market") || text.includes("store") || text.includes("supermarket") || text.includes("business") || text.includes("bazaar")) {
    return "/media/regional-business.svg";
  }

  // Vertical fallback rules to crisp SVGs
  if (
    text.includes("college") ||
    text.includes("engineering") ||
    text.includes("polytechnic") ||
    text.includes("iit") ||
    text.includes("nit")
  ) {
    return CATEGORY_COVERS.college;
  }

  if (text.includes("university") || text.includes("campus")) {
    return CATEGORY_COVERS.university;
  }

  if (
    text.includes("cafe") ||
    text.includes("lounge") ||
    text.includes("coffee") ||
    text.includes("bakery") ||
    text.includes("tea")
  ) {
    return CATEGORY_COVERS.cafe;
  }

  if (
    text.includes("book") ||
    text.includes("stationery") ||
    text.includes("xerox") ||
    text.includes("library") ||
    text.includes("press") ||
    text.includes("print")
  ) {
    return CATEGORY_COVERS.bookstore;
  }

  if (
    text.includes("school") ||
    text.includes("high school")
  ) {
    return CATEGORY_COVERS.school;
  }

  if (
    text.includes("office") ||
    text.includes("corporate") ||
    text.includes("coworking")
  ) {
    return CATEGORY_COVERS.office;
  }

  return CATEGORY_COVERS.default;
}

export function getMonogram(name: string): string {
  if (!name) return "OT";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) =>
      !["and", "&", "the", "of", "in", "for", "a", "an"].includes(w.toLowerCase())
    );
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Returns 2–3 structured metadata chips
 */
export function getListingMetadataChips(vertical: string, category: string, name: string): string[] {
  const text = `${vertical} ${category} ${name}`.toLowerCase();

  if (vertical === "education") {
    if (text.includes("engineering") || text.includes("polytechnic") || text.includes("iit") || text.includes("nit")) {
      return ["B.Tech & M.Tech", "AICTE / NBA Accredited", "Campus Hostels Available"];
    }
    if (text.includes("degree") || text.includes("arts") || text.includes("science")) {
      return ["B.Sc, B.Com & MCA", "Merit Scholarships", "Digital Library Access"];
    }
    if (text.includes("school") || text.includes("academy")) {
      return ["CBSE / State Board", "Admissions 2026-27", "Smart Classrooms"];
    }
    if (text.includes("coaching") || text.includes("tutorial") || text.includes("institute")) {
      return ["JEE / NEET / CET", "Weekend Batches", "Online + Offline Mode"];
    }
    return ["Admissions 2026-27", "Direct Fee Enquiries", "Accredited Campus"];
  }

  // Business
  if (text.includes("book") || text.includes("stationery") || text.includes("cyber")) {
    return ["Competitive Exam Guides", "Student Discount 10%", "High-Speed Print & Xerox"];
  }
  if (text.includes("cafe") || text.includes("coffee") || text.includes("lounge")) {
    return ["Open 8:00 AM – 10:30 PM", "High-Speed Wi-Fi Zone", "Quiet Study Allowed"];
  }
  if (text.includes("hostel") || text.includes("pg") || text.includes("accommodation")) {
    return ["CCTV & Secure Entry", "Meals Included", "Warden Verified"];
  }
  return ["Mon–Sat 9 AM – 9 PM", "Student Privileges", "Verified Merchant"];
}

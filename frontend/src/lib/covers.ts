// Curated high-resolution cover photography mapped by category with high availability
const CATEGORY_COVERS: Record<string, string> = {
  college: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
  school: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
  bookstore: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80",
  hospital: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80",
  hostel: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
  retail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
};

export function getCoverImage(category: string, name: string): string {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes("college") || text.includes("engineering") || text.includes("university") || text.includes("degree")) {
    return CATEGORY_COVERS.college;
  }
  if (text.includes("cafe") || text.includes("lounge") || text.includes("coffee") || text.includes("bakery") || text.includes("tea")) {
    return CATEGORY_COVERS.cafe;
  }
  if (text.includes("book") || text.includes("stationery") || text.includes("cyber") || text.includes("xerox") || text.includes("library")) {
    return CATEGORY_COVERS.bookstore;
  }
  if (text.includes("hospital") || text.includes("clinic") || text.includes("medical") || text.includes("dental") || text.includes("health") || text.includes("pharma")) {
    return CATEGORY_COVERS.hospital;
  }
  if (text.includes("hostel") || text.includes("residence") || text.includes("pg") || text.includes("accommodation")) {
    return CATEGORY_COVERS.hostel;
  }
  if (text.includes("school") || text.includes("vidyalaya") || text.includes("academy") || text.includes("high school")) {
    return CATEGORY_COVERS.school;
  }
  if (text.includes("store") || text.includes("shop") || text.includes("retail") || text.includes("market") || text.includes("commercial")) {
    return CATEGORY_COVERS.retail;
  }
  return CATEGORY_COVERS.default;
}

export function getMonogram(name: string): string {
  if (!name) return "OTC";
  const words = name.trim().split(/\s+/).filter(w => !["and", "&", "the", "of", "in", "for"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

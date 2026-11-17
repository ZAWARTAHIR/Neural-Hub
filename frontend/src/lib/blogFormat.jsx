// Helpers for posts in the Supabase `ai_blogs` table (written by the n8n blog
// workflow): normalising fields and rendering the markdown-ish content.

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function cleanDisplayText(value) {
  return String(value || "")
    .replace(/^\s*["']|["']\s*$/g, "")
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

export function getTags(post) {
  if (Array.isArray(post.tags)) return post.tags;
  if (typeof post.tags === "string") return post.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return post.category ? [post.category, "Marketing", "AI"] : ["AI", "Growth", "Marketing"];
}

// Some rows store the URL with an escaped slash ("Images\/image.webp").
export function getImageUrl(post) {
  const url = post.image_url || post.image || post.featured_image || post.thumbnail_url || "";
  return String(url).replace(/\\\//g, "/");
}

// "publish" / "Published" / "published" -> "published"; anything else is kept as-is.
export function getStatus(post) {
  const raw = String(post.status ?? (post.published === false ? "draft" : "published")).trim().toLowerCase();
  return raw.startsWith("publish") ? "published" : raw || "draft";
}

export function wordCount(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function readMinutes(text) {
  return Math.max(1, Math.round(wordCount(text) / 200));
}

export function renderInline(value) {
  const parts = String(value || "").split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function renderContent(content) {
  const blocks = String(content || "").split(/\n\s*\n/).filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.trim().split("\n");
    const firstLine = lines[0].trim();
    const remainingLines = lines.slice(1).join(" ").trim();

    if (firstLine.startsWith("### ")) {
      const headingText = firstLine.slice(4);
      return <h3 id={slugify(headingText)} key={index} style={{ margin: "32px 0 12px", fontSize: "22px" }}>{renderInline(headingText)}</h3>;
    }
    if (firstLine.startsWith("# ") || firstLine.startsWith("## ")) {
      const headingText = firstLine.startsWith("## ") ? firstLine.slice(3) : firstLine.slice(2);
      return <h2 id={slugify(headingText)} key={index} style={{ margin: "36px 0 14px", fontSize: "26px" }}>{renderInline(headingText)}</h2>;
    }
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      return (
        <ul key={index} style={{ margin: "16px 0 24px", paddingLeft: "24px" }}>
          {lines.map((line) => <li key={line} style={{ marginBottom: "8px" }}>{renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>)}
        </ul>
      );
    }
    return <p key={index} style={{ marginBottom: "20px", fontSize: "16.5px", lineHeight: "1.75", color: "var(--ink-soft)" }}>{renderInline(remainingLines ? `${firstLine} ${remainingLines}` : firstLine)}</p>;
  });
}

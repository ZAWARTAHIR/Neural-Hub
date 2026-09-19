import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { fallbackPosts } from "./Blog.jsx";

function getTitle(post) {
  return post.title || post.heading || post.name || post.blog_title || "Untitled post";
}

function getContent(post) {
  return post.content || post.blog_content || post.description || post.excerpt || "";
}

function getExcerpt(post) {
  return String(post.excerpt || post.description || post.content || post.blog_content || "")
    .replace(/^\s*["']|["']\s*$/g, "")
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function getImage(post) {
  return post.image_url || post.image || post.featured_image || post.thumbnail_url || "";
}

function getAuthor(post) {
  return typeof post.author === "object" ? post.author.name : post.author || "Sarah Chen";
}

function getDate(post) {
  const value = post.created_at || post.publishDate || post.date;
  if (!value) return "Recently Published";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getReadTime(post) {
  if (post.readTime) return `${post.readTime} min read`;
  const words = getContent(post).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(3, Math.round(words / 150) || 5)} min read`;
}

function getTags(post) {
  if (Array.isArray(post.tags)) return post.tags;
  if (typeof post.tags === "string") return post.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return post.category ? [post.category, "Marketing", "AI"] : ["AI", "Growth", "Marketing"];
}

function cleanDisplayText(value) {
  return String(value || "")
    .replace(/^\s*["']|["']\s*$/g, "")
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

function renderInline(value) {
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getHeadings(content) {
  return String(content || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      return {
        level: match[1].length,
        text: match[2].replace(/\*\*/g, "").trim(),
        id: slugify(match[2])
      };
    });
}

function renderContent(content) {
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

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      const fallbackPost = fallbackPosts.find((item) => item.id === id);
      if (fallbackPost) {
        setPost(fallbackPost);
        setRelatedPosts(fallbackPosts.filter((item) => item.id !== id).slice(0, 3));
        setLoading(false);
        return;
      }

      if (!supabase) {
        setPost(fallbackPosts[0]);
        setRelatedPosts(fallbackPosts.slice(1, 4));
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("ai_blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (queryError || !data) {
        setPost(fallbackPosts[0]);
        setRelatedPosts(fallbackPosts.slice(1, 4));
      } else {
        setPost(data);
        const { data: related } = await supabase
          .from("ai_blogs")
          .select("*")
          .neq("id", id)
          .limit(3);
        setRelatedPosts(related || fallbackPosts.slice(1, 4));
      }
      setLoading(false);
    }

    loadPost();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (post) document.title = `${getTitle(post)} | Onefeed Journal`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [post]);

  const headings = getHeadings(post ? getContent(post) : "");

  return (
    <section className="sec blog-post-page" style={{ borderBottom: "none", paddingTop: "24px" }}>
      <div className="shell">
        {loading && (
          <div className="auth-state">
            <span className="pulse-dot" />
            <span style={{ marginLeft: "10px" }}>Loading article...</span>
          </div>
        )}

        {error && <p className="auth-error">Unable to load blog post: {error}</p>}

        {!loading && post && (
          <>
            {/* Breadcrumb Navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "13.5px", fontWeight: "600", color: "var(--text-muted)" }}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
              <span>/</span>
              <Link to="/blog" style={{ color: "inherit", textDecoration: "none" }}>Journal</Link>
              <span>/</span>
              <span style={{ color: "var(--ink)", fontWeight: "700" }}>{post.category || "Article"}</span>
            </div>

            {/* Article Hero Header */}
            <div style={{ maxWidth: "860px", margin: "0 auto 36px" }}>
              <span className="badge-pill" style={{ background: "var(--yellow)", marginBottom: "16px" }}>
                {post.category || "AI & Tech"}
              </span>
              <h1 style={{ fontSize: "clamp(30px, 4.5vw, 48px)", lineHeight: "1.1", margin: "12px 0 18px" }}>
                {cleanDisplayText(getTitle(post))}
              </h1>
              {post.excerpt && (
                <p style={{ fontSize: "19px", color: "var(--ink-soft)", lineHeight: "1.6", marginBottom: "24px" }}>
                  {cleanDisplayText(post.excerpt)}
                </p>
              )}

              {/* Author Strip */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "16px 0", borderTop: "1.5px dashed var(--grey-dark)", borderBottom: "1.5px dashed var(--grey-dark)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="author-avatar" style={{ width: "42px", height: "42px", fontSize: "15px" }}>
                    {getAuthor(post).charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px" }}>{getAuthor(post)}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{getDate(post)} • {getReadTime(post)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Article link copied to clipboard!");
                      }
                    }}
                  >
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {getImage(post) && (
              <div style={{ maxWidth: "960px", margin: "0 auto 48px", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "var(--line)", boxShadow: "var(--pop-lg)" }}>
                <img
                  src={getImage(post)}
                  alt={getTitle(post)}
                  style={{ width: "100%", height: "auto", maxHeight: "500px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}

            {/* Article Content & Sidebar */}
            <div className="blog-post-layout">
              <article className="blog-post-content-column" id="article">
                <div className="blog-post-content">
                  {renderContent(getContent(post))}
                </div>

                {getTags(post).length > 0 && (
                  <div className="blog-post-tags" style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "36px 0" }}>
                    {getTags(post).map((tag) => (
                      <span key={tag} className="badge-pill" style={{ fontSize: "12px", background: "var(--grey)", border: "1px solid var(--ink)" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Share Strip */}
                <div style={{ padding: "24px", background: "var(--paper-soft)", border: "var(--line)", borderRadius: "var(--radius-md)", margin: "32px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <strong>Enjoyed this article?</strong>
                    <p style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>Share it with your growth and marketing team.</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <a className="btn btn-sm" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getTitle(post))}`} target="_blank" rel="noreferrer">
                      Share on X
                    </a>
                    <a className="btn btn-sm" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="blog-post-sidebar">
                <div className="blog-toc" style={{ borderRadius: "var(--radius-md)" }}>
                  <strong>Table of Contents</strong>
                  {headings.length > 0 ? (
                    headings.map((heading) => (
                      <a
                        className={`blog-toc-link level-${heading.level}`}
                        href={`#${heading.id}`}
                        style={{ paddingLeft: `${Math.max(0, heading.level - 2) * 12}px` }}
                        key={heading.id}
                      >
                        {heading.text}
                      </a>
                    ))
                  ) : (
                    <a href="#article">Overview</a>
                  )}
                </div>

                <div className="blog-author-box" style={{ borderRadius: "var(--radius-md)", marginTop: "16px" }}>
                  <strong>Published by</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0" }}>
                    <div className="author-avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                      {getAuthor(post).charAt(0)}
                    </div>
                    <span style={{ fontWeight: "800" }}>{getAuthor(post)}</span>
                  </div>
                  <small>Marketing Engineer &amp; Multichannel Architect at Onefeed.</small>
                </div>
              </aside>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <section className="blog-related" id="related" style={{ marginTop: "64px" }}>
                <div className="sec-head" style={{ marginBottom: "28px" }}>
                  <h2>Keep exploring</h2>
                  <p>More frameworks and insights from our content laboratory.</p>
                </div>
                <div className="blog-mag-grid">
                  {relatedPosts.map((related) => (
                    <Link
                      className="blog-mag-card"
                      to={`/blog/${related.id}`}
                      key={related.id}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="blog-mag-image-wrap">
                        <img src={getImage(related)} alt={getTitle(related)} />
                      </div>
                      <div className="blog-mag-body">
                        <h3>{getTitle(related)}</h3>
                        <p>{getExcerpt(related)}</p>
                        <div className="blog-mag-footer">
                          <span>{getDate(related)}</span>
                          <span className="read-more-link">Read →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Call to action */}
            <section className="closer-v2" style={{ borderRadius: "var(--radius-lg)", margin: "48px 0" }}>
              <div className="shell">
                <h2>Turn one prompt into every channel.</h2>
                <p>Generate blog posts, graphics, video scripts, and WhatsApp messages in seconds.</p>
                <div className="closer-v2-actions">
                  <Link className="btn btn-yellow btn-lg" to="/dashboard">
                    Open Studio Dashboard
                  </Link>
                  <Link className="btn btn-outline btn-lg" to="/blog" style={{ color: "#000" }}>
                    ← Back to All Articles
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}

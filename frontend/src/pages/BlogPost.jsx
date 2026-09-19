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

function getImage(post) {
  return post.image_url || post.image || post.featured_image || post.thumbnail_url || "";
}

function getAuthor(post) {
  return typeof post.author === "object" ? post.author.name : post.author || "Onefeed Team";
}

function getDate(post) {
  const value = post.created_at || post.publishDate || post.date;
  if (!value) return "N/A";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getReadTime(post) {
  if (post.readTime) return `${post.readTime} min read`;
  const words = getContent(post).trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200) || 1)} min read`;
}

function getTags(post) {
  if (Array.isArray(post.tags)) return post.tags;
  if (typeof post.tags === "string") return post.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return post.category ? [post.category] : [];
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
      return <h3 id={slugify(headingText)} key={index}>{renderInline(headingText)}</h3>;
    }
    if (firstLine.startsWith("# ") || firstLine.startsWith("## ")) {
      const headingText = firstLine.startsWith("## ") ? firstLine.slice(3) : firstLine.slice(2);
      return <h2 id={slugify(headingText)} key={index}>{renderInline(headingText)}</h2>;
    }
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      return <ul key={index}>{lines.map((line) => <li key={line}>{renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>)}</ul>;
    }
    return <p key={index}>{renderInline(remainingLines ? `${firstLine} ${remainingLines}` : firstLine)}</p>;
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
        setError("Blog content is not configured yet.");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("ai_blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (!active) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setPost(data);
        const { data: related } = await supabase
          .from("ai_blogs")
          .select("*")
          .neq("id", id)
          .limit(3);
        setRelatedPosts(related || []);
      }
      setLoading(false);
    }

    loadPost();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (post) document.title = `${getTitle(post)} | Onefeed`;
  }, [post]);

  const headings = getHeadings(post ? getContent(post) : "");

  return (
    <section className="sec blog-post-page" style={{ borderBottom: "none" }}>
      <div className="shell">
        {loading && <p className="auth-state">Loading blog post...</p>}
        {error && <p className="auth-error">Unable to load blog post: {error}</p>}
        {!loading && !error && post && (
          <>
            <article className={`blog-post-hero ${getImage(post) ? "has-image" : "no-image"}`}>
              {getImage(post) && (
                <>
                  <img className="blog-post-image" src={getImage(post)} alt={getTitle(post)} />
                  <img className="blog-post-image blog-post-image-blur" src={getImage(post)} alt="" aria-hidden="true" />
                </>
              )}
              <div className="blog-post-hero-copy">
                <h1>{cleanDisplayText(getTitle(post))}</h1>
                {post.excerpt && <p className="blog-post-excerpt">{cleanDisplayText(post.excerpt)}</p>}
                <div className="blog-post-meta">
                  <strong>{getAuthor(post)}</strong>
                  <span>{getDate(post)}</span>
                  <span>{getReadTime(post)}</span>
                </div>
              </div>
            </article>

            <div className="blog-post-layout">
              <article className="blog-post-content-column" id="article">
                <div className="blog-post-content">{renderContent(getContent(post))}</div>
                {getTags(post).length > 0 && (
                  <div className="blog-post-tags">
                    {getTags(post).map((tag) => <span key={tag}>#{tag}</span>)}
                  </div>
                )}
                <div className="blog-share" id="share">
                  <strong>Share this article</strong>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer">LinkedIn</a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getTitle(post))}`} target="_blank" rel="noreferrer">X / Twitter</a>
                  <a href={`mailto:?subject=${encodeURIComponent(getTitle(post))}&body=${encodeURIComponent(window.location.href)}`}>Email</a>
                </div>
              </article>
              <aside className="blog-post-sidebar">
                <div className="blog-toc">
                  <strong>In this article</strong>
                  {headings.length > 0 ? headings.map((heading) => (
                    <a className={`blog-toc-link level-${heading.level}`} href={`#${heading.id}`} style={{ paddingLeft: `${Math.max(0, heading.level - 1) * 10}px` }} key={heading.id}>
                      {heading.text}
                    </a>
                  )) : <a href="#article">Overview</a>}
                </div>
                <div className="blog-author-box">
                  <strong>Written by</strong>
                  <span>{getAuthor(post)}</span>
                  <small>Content and ideas from the Onefeed team.</small>
                </div>
              </aside>
            </div>

            {relatedPosts.length > 0 && (
              <section className="blog-related" id="related">
                <h2>Keep reading</h2>
                <div className="blog-related-grid">
                  {relatedPosts.map((related) => (
                    <Link className="blog-related-card" to={`/blog/${related.id}`} key={related.id}>
                      {getImage(related) && <img src={getImage(related)} alt="" />}
                      <strong>{getTitle(related)}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="blog-post-cta">
              <h2>Turn one idea into every channel.</h2>
              <p>Use Onefeed to shape your next campaign into ready-to-review content.</p>
              <Link className="btn btn-blue" to="/login">Start creating</Link>
            </section>
            <div className="blog-post-bottom-nav">
              <Link className="btn" to="/blog">Back to all posts</Link>
            </div>
          </>
        )}
        {!loading && !error && !post && (
          <div className="auth-error">
            <p>Blog post not found.</p>
            <Link className="btn btn-blue" to="/blog">Back to blog</Link>
          </div>
        )}
      </div>
    </section>
  );
}

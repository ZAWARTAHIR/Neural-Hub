import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase.js";
import {
  cleanDisplayText,
  getImageUrl,
  getStatus,
  getTags,
  readMinutes,
  renderContent,
  wordCount
} from "../../lib/blogFormat.jsx";
import { Icon } from "../../components/icons/Icons.jsx";
import "../../styles/blog-admin.css";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "other", label: "Drafts" }
];

const formatDate = (value, opts = { year: "numeric", month: "short", day: "numeric" }) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, opts);
};

// Admin view of every post in the Supabase `ai_blogs` table.
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [openPost, setOpenPost] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("ai_blogs")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message || "Could not load blog posts.");
    else setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Escape closes the preview panel.
  useEffect(() => {
    if (!openPost) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpenPost(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPost]);

  const stats = useMemo(() => {
    const published = posts.filter((p) => getStatus(p) === "published").length;
    const words = posts.reduce((sum, p) => sum + wordCount(p.content), 0);
    return {
      total: posts.length,
      published,
      drafts: posts.length - published,
      avgRead: posts.length ? Math.round(words / posts.length / 200) : 0,
      latest: posts[0]?.created_at
    };
  }, [posts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter((p) => {
      const st = getStatus(p);
      if (status === "published" && st !== "published") return false;
      if (status === "other" && st === "published") return false;
      if (!q) return true;
      return [p.title, p.excerpt, ...getTags(p)].some((v) => String(v || "").toLowerCase().includes(q));
    });
    return sort === "oldest" ? [...list].reverse() : list;
  }, [posts, query, status, sort]);

  return (
    <div className="ba">
      <header className="ba-head">
        <div>
          <h1>Blog posts</h1>
          <p>Every article generated into your Supabase <code>ai_blogs</code> table.</p>
        </div>
        <button type="button" className="ba-btn" onClick={load} disabled={loading}>
          <Icon name="refresh" size={15} className={loading ? "ba-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <section className="ba-stats" aria-label="Summary">
        <Stat label="Total posts" value={stats.total} loading={loading} />
        <Stat label="Published" value={stats.published} loading={loading} />
        <Stat label="Drafts" value={stats.drafts} loading={loading} />
        <Stat label="Last generated" value={stats.latest ? formatDate(stats.latest, { month: "short", day: "numeric" }) : "—"} loading={loading} />
      </section>

      <div className="ba-toolbar">
        <label className="ba-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, excerpt or tag"
            aria-label="Search posts"
          />
        </label>
        <div className="ba-seg" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={status === f.key}
              className={status === f.key ? "is-on" : ""}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select className="ba-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort posts">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && (
        <div className="ba-error" role="alert">
          <strong>Couldn&rsquo;t load posts.</strong> {error}
        </div>
      )}

      <section className="ba-list" aria-busy={loading}>
        {loading && posts.length === 0
          ? Array.from({ length: 4 }, (_, i) => <div key={i} className="ba-row ba-skeleton" />)
          : visible.map((post) => (
              <PostRow key={post.id} post={post} onOpen={() => setOpenPost(post)} />
            ))}

        {!loading && !error && visible.length === 0 && (
          <div className="ba-empty">
            <Icon name="blog" size={22} />
            <strong>{posts.length === 0 ? "No posts yet" : "No posts match your filters"}</strong>
            <span>
              {posts.length === 0
                ? "Generate a blog post from New campaign and it will show up here."
                : "Try a different search or status."}
            </span>
          </div>
        )}
      </section>

      {!loading && visible.length > 0 && (
        <p className="ba-foot">
          Showing {visible.length} of {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
      )}

      <PostPanel post={openPost} onClose={() => setOpenPost(null)} />
    </div>
  );
}

function Stat({ label, value, loading }) {
  return (
    <div className="ba-stat">
      <span>{label}</span>
      <strong>{loading ? <i className="ba-shimmer" /> : value}</strong>
    </div>
  );
}

function StatusPill({ post }) {
  const st = getStatus(post);
  return <span className={`ba-pill ${st === "published" ? "is-live" : ""}`}>{st === "published" ? "Published" : st}</span>;
}

function PostRow({ post, onOpen }) {
  const tags = getTags(post);
  const img = getImageUrl(post);
  return (
    <article className="ba-row">
      <button type="button" className="ba-row-main" onClick={onOpen} aria-label={`Preview ${cleanDisplayText(post.title)}`}>
        <span className="ba-thumb">
          {img ? <img src={img} alt="" loading="lazy" /> : <Icon name="image" size={18} />}
        </span>
        <span className="ba-row-text">
          <strong>{cleanDisplayText(post.title) || "Untitled post"}</strong>
          <span className="ba-excerpt">{cleanDisplayText(post.excerpt)}</span>
          <span className="ba-meta">
            <StatusPill post={post} />
            <span>{formatDate(post.created_at)}</span>
            <span aria-hidden="true">·</span>
            <span>{readMinutes(post.content)} min read</span>
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="ba-tag">{t}</span>
            ))}
            {tags.length > 2 && <span className="ba-tag ba-tag-more">+{tags.length - 2}</span>}
          </span>
        </span>
      </button>
      <div className="ba-row-actions">
        <button type="button" className="ba-icon-btn" onClick={onOpen} title="Preview" aria-label="Preview">
          <Icon name="panelRight" size={16} />
        </button>
        <Link className="ba-icon-btn" to={`/blog/${post.id}`} target="_blank" rel="noreferrer" title="View live post" aria-label="View live post">
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  );
}

function PostPanel({ post, onClose }) {
  const open = Boolean(post);
  const img = post ? getImageUrl(post) : "";
  return (
    <>
      <div className={`ba-scrim ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`ba-panel ${open ? "is-open" : ""}`} aria-hidden={!open} aria-label="Post preview">
        {post && (
          <>
            <header className="ba-panel-head">
              <StatusPill post={post} />
              <span className="ba-panel-id">#{post.id}</span>
              <div className="ba-panel-actions">
                <Link className="ba-btn ba-btn-sm" to={`/blog/${post.id}`} target="_blank" rel="noreferrer">
                  View live
                  <Icon name="arrowRight" size={14} />
                </Link>
                <button type="button" className="ba-icon-btn" onClick={onClose} aria-label="Close preview" title="Close">
                  <Icon name="close" size={16} />
                </button>
              </div>
            </header>
            <div className="ba-panel-body">
              {img && <img className="ba-panel-img" src={img} alt="" />}
              <h2>{cleanDisplayText(post.title)}</h2>
              <p className="ba-panel-meta">
                {formatDate(post.created_at, { year: "numeric", month: "long", day: "numeric" })} · {wordCount(post.content)} words · {readMinutes(post.content)} min read
              </p>
              {post.excerpt && <p className="ba-panel-excerpt">{cleanDisplayText(post.excerpt)}</p>}
              <div className="ba-panel-tags">
                {getTags(post).map((t) => (
                  <span key={t} className="ba-tag">{t}</span>
                ))}
              </div>
              <div className="ba-panel-content">{renderContent(post.content)}</div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

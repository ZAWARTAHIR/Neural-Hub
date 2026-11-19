import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase.js";
import { formatBytes, loadMedia } from "../../lib/media.js";
import { Icon } from "../icons/Icons.jsx";
import "../../styles/blog-admin.css";
import "../../styles/image-admin.css";

const formatDate = (value) => {
  const d = new Date(value);
  return value && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
};

/**
 * Gallery of generated videos or GIFs (Supabase "Images" bucket + saved
 * campaign results). Used by the Video and GIF dashboard pages.
 * `kind` is "video" or "gif".
 */
export default function MediaLibrary({ kind, title, noun, description, icon }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null); // index into `visible`
  const isVideo = kind === "video";

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await loadMedia(kind);
      setItems(result.items);
      setError(result.error);
    } catch (err) {
      setError(err.message || `Could not load ${noun}s.`);
    } finally {
      setLoading(false);
    }
  }, [kind, noun]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => [it.name, it.topic].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [items, query]);

  const stats = useMemo(() => {
    const bytes = items.reduce((s, i) => s + (i.size || 0), 0);
    const fromCampaigns = items.filter((i) => i.topic).length;
    return { total: items.length, bytes, fromCampaigns, latest: items[0]?.createdAt };
  }, [items]);

  useEffect(() => {
    if (active == null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % visible.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + visible.length) % visible.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, visible.length]);

  return (
    <div className="ba">
      <header className="ba-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button type="button" className="ba-btn" onClick={load} disabled={loading}>
          <Icon name="refresh" size={15} className={loading ? "ba-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <section className="ba-stats" aria-label="Summary">
        <Stat label={`Total ${noun}s`} value={stats.total} loading={loading} />
        <Stat label="From campaigns" value={stats.fromCampaigns} loading={loading} />
        <Stat label="Storage used" value={stats.bytes ? formatBytes(stats.bytes) : "—"} loading={loading} />
        <Stat label="Last generated" value={formatDate(stats.latest)} loading={loading} />
      </section>

      <div className="ba-toolbar">
        <label className="ba-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by campaign prompt or file name"
            aria-label={`Search ${noun}s`}
          />
        </label>
      </div>

      {error && (
        <div className="ba-error" role="alert">
          <strong>Couldn&rsquo;t load {noun}s.</strong> {error}
        </div>
      )}

      <section className={`ia-grid ${isVideo ? "ia-grid-video" : ""}`} aria-busy={loading}>
        {loading && items.length === 0
          ? Array.from({ length: 6 }, (_, i) => <div key={i} className="ia-tile ia-skeleton" />)
          : visible.map((it, i) => (
              <button key={it.key} type="button" className="ia-tile" onClick={() => setActive(i)} aria-label={`Open ${it.topic || it.name}`}>
                {isVideo ? (
                  <>
                    {/* #t=0.1 makes browsers paint the first frame as a thumbnail. */}
                    <video src={`${it.url}#t=0.1`} muted playsInline preload="metadata" />
                    <span className="ia-play" aria-hidden="true">
                      <Icon name="video" size={18} strokeWidth={2} />
                    </span>
                  </>
                ) : (
                  <img src={it.url} alt={it.topic || it.name} loading="lazy" />
                )}
                <span className="ia-tile-info">
                  <strong>{it.topic || it.name}</strong>
                  <small>
                    {formatDate(it.createdAt)}
                    {it.size ? ` · ${formatBytes(it.size)}` : ""}
                  </small>
                </span>
              </button>
            ))}
      </section>

      {!loading && !error && visible.length === 0 && (
        <div className="ba-list">
          <div className="ba-empty">
            <Icon name={icon} size={22} />
            <strong>{items.length === 0 ? `No ${noun}s yet` : `No ${noun}s match your search`}</strong>
            <span>
              {items.length === 0 ? (
                <>
                  Generate one from <Link to="/dashboard/campaign">New campaign</Link> and it will show up here.
                </>
              ) : (
                "Try a different search."
              )}
            </span>
          </div>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="ba-foot">
          Showing {visible.length} of {items.length} {noun}
          {items.length === 1 ? "" : "s"}
        </p>
      )}

      <Viewer
        item={active == null ? null : visible[active]}
        isVideo={isVideo}
        position={active == null ? "" : `${active + 1} / ${visible.length}`}
        onClose={() => setActive(null)}
        onPrev={() => setActive((i) => (i - 1 + visible.length) % visible.length)}
        onNext={() => setActive((i) => (i + 1) % visible.length)}
      />
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

function Viewer({ item, isVideo, position, onClose, onPrev, onNext }) {
  const [copied, setCopied] = useState(false);
  const open = Boolean(item);

  useEffect(() => setCopied(false), [item]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; "Open original" still works.
    }
  }

  return (
    <div className={`ia-lightbox ${open ? "is-open" : ""}`} aria-hidden={!open} role="dialog" aria-label="Preview">
      <div className="ia-lightbox-scrim" onClick={onClose} />
      {item && (
        <div className="ia-lightbox-card">
          <div className="ia-stage">
            {isVideo ? (
              <video key={item.url} src={item.url} controls autoPlay playsInline />
            ) : (
              <img src={item.url} alt={item.topic || item.name} />
            )}
            <button type="button" className="ia-nav ia-nav-prev" onClick={onPrev} aria-label="Previous">
              <Icon name="chevronLeft" size={20} />
            </button>
            <button type="button" className="ia-nav ia-nav-next" onClick={onNext} aria-label="Next">
              <Icon name="chevronRight" size={20} />
            </button>
          </div>

          <aside className="ia-details">
            <header>
              <span className="ia-position">{position}</span>
              <button type="button" className="ba-icon-btn" onClick={onClose} aria-label="Close" title="Close">
                <Icon name="close" size={16} />
              </button>
            </header>

            <h2 title={item.name}>{item.topic || item.name}</h2>
            <dl>
              <div><dt>Created</dt><dd>{formatDate(item.createdAt)}</dd></div>
              <div><dt>Size</dt><dd>{formatBytes(item.size)}</dd></div>
              <div><dt>File</dt><dd>{item.name}</dd></div>
            </dl>

            <div className="ia-actions">
              <button type="button" className="ba-btn" onClick={copyLink}>
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="ba-btn" href={item.url} target="_blank" rel="noreferrer" download>
                <Icon name="arrowRight" size={15} />
                Open original
              </a>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

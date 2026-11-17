import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase.js";
import { formatBytes, loadImages } from "../../lib/media.js";
import { Icon } from "../../components/icons/Icons.jsx";
import "../../styles/blog-admin.css";
import "../../styles/image-admin.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "used", label: "In blogs" },
  { key: "unused", label: "Unused" }
];

const formatDate = (value) => {
  const d = new Date(value);
  return value && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
};

// Gallery of every generated image (Supabase Storage "Images" bucket + blog images).
export default function ImagePage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null); // index into `visible`

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await loadImages();
      setImages(result.images);
      setError(result.error);
      if (!result.listed) {
        // Bucket listing needs a storage policy; until then only blog images are shown.
        console.info("[Images] Showing blog images only. Run supabase/images-bucket-access.sql to list the whole Images bucket.");
      }
    } catch (err) {
      setError(err.message || "Could not load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return images.filter((img) => {
      if (filter === "used" && img.usedIn.length === 0) return false;
      if (filter === "unused" && img.usedIn.length > 0) return false;
      if (!q) return true;
      return [img.name, ...img.usedIn.map((u) => u.title)].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [images, query, filter]);

  const stats = useMemo(() => {
    const used = images.filter((i) => i.usedIn.length > 0).length;
    const bytes = images.reduce((s, i) => s + (i.size || 0), 0);
    return { total: images.length, used, unused: images.length - used, bytes, latest: images[0]?.createdAt };
  }, [images]);

  // Keyboard: Esc closes, arrows move between images.
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
          <h1>Images</h1>
          <p>Every generated visual from your Supabase <code>Images</code> storage bucket.</p>
        </div>
        <button type="button" className="ba-btn" onClick={load} disabled={loading}>
          <Icon name="refresh" size={15} className={loading ? "ba-spin" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <section className="ba-stats" aria-label="Summary">
        <Stat label="Total images" value={stats.total} loading={loading} />
        <Stat label="Used in blogs" value={stats.used} loading={loading} />
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
            placeholder="Search by file name or blog title"
            aria-label="Search images"
          />
        </label>
        <div className="ba-seg" role="tablist" aria-label="Filter images">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={filter === f.key ? "is-on" : ""}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="ba-error" role="alert">
          <strong>Couldn&rsquo;t load images.</strong> {error}
        </div>
      )}

      <section className="ia-grid" aria-busy={loading}>
        {loading && images.length === 0
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className="ia-tile ia-skeleton" />)
          : visible.map((img, i) => (
              <button key={img.key} type="button" className="ia-tile" onClick={() => setActive(i)} aria-label={`Open ${img.name}`}>
                <img src={img.url} alt={img.usedIn[0]?.title || img.name} loading="lazy" />
                <span className="ia-tile-info">
                  <strong>{img.usedIn[0]?.title || img.name}</strong>
                  <small>
                    {formatDate(img.createdAt)}
                    {img.size ? ` · ${formatBytes(img.size)}` : ""}
                  </small>
                </span>
                {img.usedIn.length > 0 && (
                  <span className="ia-badge" title={`Used in ${img.usedIn.length} blog post(s)`}>
                    <Icon name="blog" size={12} strokeWidth={2} />
                    {img.usedIn.length}
                  </span>
                )}
              </button>
            ))}
      </section>

      {!loading && !error && visible.length === 0 && (
        <div className="ba-list">
          <div className="ba-empty">
            <Icon name="image" size={22} />
            <strong>{images.length === 0 ? "No images yet" : "No images match your filters"}</strong>
            <span>
              {images.length === 0
                ? "Generate images from New campaign and they will show up here."
                : "Try a different search or filter."}
            </span>
          </div>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <p className="ba-foot">
          Showing {visible.length} of {images.length} image{images.length === 1 ? "" : "s"}
        </p>
      )}

      <Lightbox
        image={active == null ? null : visible[active]}
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

function Lightbox({ image, position, onClose, onPrev, onNext }) {
  const [copied, setCopied] = useState(false);
  const open = Boolean(image);

  useEffect(() => setCopied(false), [image]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(image.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked; the "Open original" link still works.
    }
  }

  return (
    <div className={`ia-lightbox ${open ? "is-open" : ""}`} aria-hidden={!open} role="dialog" aria-label="Image preview">
      <div className="ia-lightbox-scrim" onClick={onClose} />
      {image && (
        <div className="ia-lightbox-card">
          <div className="ia-stage">
            <img src={image.url} alt={image.usedIn[0]?.title || image.name} />
            <button type="button" className="ia-nav ia-nav-prev" onClick={onPrev} aria-label="Previous image">
              <Icon name="chevronLeft" size={20} />
            </button>
            <button type="button" className="ia-nav ia-nav-next" onClick={onNext} aria-label="Next image">
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

            <h2 title={image.name}>{image.name}</h2>
            <dl>
              <div><dt>Created</dt><dd>{formatDate(image.createdAt)}</dd></div>
              <div><dt>Size</dt><dd>{formatBytes(image.size)}</dd></div>
              <div><dt>Type</dt><dd>{image.type || image.name.split(".").pop()?.toUpperCase() || "—"}</dd></div>
            </dl>

            <div className="ia-used">
              <span>Used in</span>
              {image.usedIn.length === 0 ? (
                <p>Not used in any blog post.</p>
              ) : (
                image.usedIn.map((u) => (
                  <Link key={u.id} to={`/blog/${u.id}`} target="_blank" rel="noreferrer">
                    <Icon name="blog" size={14} />
                    <span>{u.title}</span>
                  </Link>
                ))
              )}
            </div>

            <div className="ia-actions">
              <button type="button" className="ba-btn" onClick={copyLink}>
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="ba-btn" href={image.url} target="_blank" rel="noreferrer">
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

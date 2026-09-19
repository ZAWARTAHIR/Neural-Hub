import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export const fallbackPosts = [
  {
    id: "fallback-ai-content",
    title: "How AI is Revolutionizing Multimodal Content Creation in 2025",
    excerpt: "Discover how autonomous parallel pipelines are transforming how modern growth teams plan, generate, and distribute campaigns across 4+ channels in seconds.",
    category: "AI & Tech",
    author: "Sarah Chen",
    date: "Jun 5, 2025",
    readTime: 6,
    featured: true,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    content: "AI is fundamentally changing how marketing teams execute campaigns. Instead of writing separate briefs and waiting days for design, video, and copy handoffs, modern teams use orchestrated parallel agents.\n\n### The Shift from Single-Model to Chained Workflows\nTraditional content generation treated AI as a basic text generator. Modern architectures chain specialized multimodal models together: one model optimizes search intent, another writes structured copy, a vision engine renders on-brand visuals, and a scripting model prepares video storyboards.\n\n### Why Unified Editorial Control Matters\nSpeed without editorial oversight leads to generic spam. The strongest platforms place human review at the center, giving marketers the final say to polish, adjust tone, and approve before one-click publishing."
  },
  {
    id: "fallback-seo-guide",
    title: "The Complete Guide to Semantic SEO & Programmatic Blog Scaling",
    excerpt: "Learn the proven framework to rank long-form articles higher on Google and build compounding organic search traffic systematically.",
    category: "SEO",
    author: "James Wilson",
    date: "Jun 3, 2025",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=800&fit=crop",
    content: "A winning SEO strategy begins with clear user search intent. Search algorithms now prioritize topical authority and depth over simple keyword stuffing.\n\n### Core Pillars of Semantic Ranking\n1. **Search Intent Alignment:** Direct, structured answers in early paragraphs.\n2. **Entity Optimization:** Natural inclusion of industry terms and relational context.\n3. **Content Hierarchy:** Proper H2 and H3 structures that search engine crawlers can index seamlessly.\n\nWhen scaling programmatic content, maintain strict editorial guidelines so every generated post delivers unique value to the reader."
  },
  {
    id: "fallback-content-strategy",
    title: "Building an Autonomous Content Engine That Scales to 1M Readers",
    excerpt: "From solo marketer to enterprise team: here is the operational blueprint to build an automated content engine that grows your pipeline.",
    category: "Content Strategy",
    author: "Maria Garcia",
    date: "Jun 1, 2025",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop",
    content: "Content scaling is an operational challenge, not just a creative one. The secret is prompt leverage: turning one approved message into multiple channel assets without losing quality.\n\n### Repurposing Framework\n- **Anchor Content:** 1 Core Strategic Prompt / Brief.\n- **Channel Outputs:** 1 SEO Blog + 3 Visual Ads + 1 Video Script + 1 Direct Broadcast Message.\n- **Feedback Loop:** Analyze high-performing channels and feed insights back into future prompts."
  },
  {
    id: "fallback-n8n-workflow",
    title: "Building High-Throughput Publishing Pipelines with n8n & Webhooks",
    excerpt: "Step-by-step architecture for connecting AI model endpoints, Supabase databases, and marketing webhook triggers into unified pipelines.",
    category: "Tutorials",
    author: "Alex Kumar",
    date: "May 28, 2025",
    readTime: 10,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
    content: "n8n provides the workflow glue that connects disparate API endpoints into reliable production pipelines.\n\n### Architecture Highlights\n- Webhook trigger receives campaign parameters.\n- Node orchestrates parallel requests to LLMs and image generation models.\n- Payload validation cleans output formatting.\n- Verified content is stored into Supabase and made ready for instant dashboard review."
  },
  {
    id: "fallback-readers",
    title: "Case Study: Scaling from 0 to 100k Monthly Readers in 6 Months",
    excerpt: "A transparent look into how an early-stage SaaS startup used autonomous multi-channel distribution to drive massive organic user signups.",
    category: "Case Studies",
    author: "David Park",
    date: "May 25, 2025",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
    content: "Consistency beats intermittent perfection. By implementing daily multi-channel publishing loops, we reduced production cycle time from 12 hours to 20 minutes per campaign.\n\n### Key Takeaways\n- **Speed to Market:** Capture trending search topics while competition is still writing briefs.\n- **Cross-Channel Synergies:** Readers discovering our WhatsApp broadcasts converted 3x faster than cold search visitors."
  },
  {
    id: "fallback-prompts",
    title: "Mastering Prompt Architecture: Getting Ultra-High-Fidelity AI Outputs",
    excerpt: "Master the art of structured briefing to get consistently nuanced, persuasive, and on-brand marketing content every single time.",
    category: "AI & Tech",
    author: "Lisa Wang",
    date: "May 22, 2025",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
    content: "The quality of AI output is a direct reflection of prompt constraints. Great prompts define the persona, target audience, tone spectrum, specific exclusions, and exact formatting targets.\n\n### Prompt Formula\n1. **Context & Role:** 'Act as a Senior SaaS Product Marketing Lead...'\n2. **Target Intent:** 'Write a high-converting announcement with 3 core value props...'\n3. **Formatting Constraints:** 'Include H2 headers, bullet points, and actionable next steps.'"
  }
];

const CATEGORIES = ["All", "AI & Tech", "SEO", "Content Strategy", "Tutorials", "Case Studies"];

function getCategoryClass(cat) {
  switch (cat) {
    case "AI & Tech": return "cat-tech";
    case "SEO": return "cat-seo";
    case "Content Strategy": return "cat-strategy";
    case "Tutorials": return "cat-tutorials";
    case "Case Studies": return "cat-cases";
    default: return "cat-tech";
  }
}

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("magazine"); // "magazine" | "showcase" | "list"
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      if (!supabase) {
        setPosts(fallbackPosts);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("ai_blogs")
        .select("*");

      if (!active) return;

      if (queryError || !data || data.length === 0) {
        setPosts(fallbackPosts);
      } else {
        const sortedPosts = [...data].sort((first, second) => {
          const firstDate = new Date(first.created_at || first.updated_at || 0);
          const secondDate = new Date(second.created_at || second.updated_at || 0);
          return secondDate - firstDate;
        });
        setPosts(sortedPosts.length ? sortedPosts : fallbackPosts);
      }

      setLoading(false);
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  function getImage(post) {
    return post.image_url || post.image || post.featured_image || post.thumbnail_url || fallbackPosts[0].image;
  }

  function getTitle(post) {
    return String(post.title || post.heading || post.name || post.blog_title || "Untitled post")
      .replace(/^\s*["']|["']\s*$/g, "")
      .replace(/^\s*#{1,6}\s*/, "")
      .replace(/\*\*/g, "")
      .trim();
  }

  function getExcerpt(post) {
    return String(post.excerpt || post.description || post.content || post.blog_content || "")
      .replace(/^\s*["']|["']\s*$/g, "")
      .replace(/^\s*#{1,6}\s*/, "")
      .replace(/\*\*/g, "")
      .trim();
  }

  function getAuthor(post) {
    return typeof post.author === "object" ? post.author.name : post.author || "Onefeed Team";
  }

  function getDate(post) {
    const value = post.created_at || post.publishDate || post.date;
    if (!value) return "Recently Published";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getReadTime(post) {
    if (post.readTime) return `${post.readTime} min read`;
    const words = getExcerpt(post).split(" ").length || 400;
    return `${Math.max(3, Math.round(words / 50))} min read`;
  }

  // Filter and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCat = selectedCategory === "All" || post.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        getTitle(post).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getExcerpt(post).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== "All") return null;
    return filteredPosts.find((p) => p.featured) || filteredPosts[0];
  }, [filteredPosts, searchQuery, selectedCategory]);

  const gridPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  const currentShowcasePost = filteredPosts[activeSlide % (filteredPosts.length || 1)] || filteredPosts[0];

  function handleNextSlide() {
    setActiveSlide((prev) => (prev + 1) % filteredPosts.length);
  }

  function handlePrevSlide() {
    setActiveSlide((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length);
  }

  return (
    <section className="sec blog-page" style={{ borderBottom: "none", paddingTop: "20px" }}>
      <div className="shell">
        {/* Editorial Header */}
        <div className="blog-hero-wrap">
          <div className="badge-pill" style={{ background: "var(--yellow)" }}>
            <span>📚 Engineering &amp; Growth Journal</span>
          </div>
          <h1>Ideas for sharper, faster marketing.</h1>
          <p>
            Battle-tested frameworks on multi-channel content operations, autonomous AI pipelines, SEO scaling, and high-converting copywriting.
          </p>

          {/* Instant Search Bar */}
          <div className="blog-search-bar">
            <span className="blog-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search articles, frameworks, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="blog-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & View Switcher */}
        <div className="blog-filter-bar">
          <div className="blog-categories-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => { setSelectedCategory(cat); setActiveSlide(0); }}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="blog-views-group">
            <button
              type="button"
              className={`view-btn ${viewMode === "magazine" ? "active" : ""}`}
              onClick={() => setViewMode("magazine")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Magazine Grid</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === "showcase" ? "active" : ""}`}
              onClick={() => setViewMode("showcase")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
              <span>Featured Showcase</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Editorial List</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="auth-state">
            <span className="pulse-dot" />
            <span style={{ marginLeft: "10px" }}>Loading publication archives...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--paper-soft)", border: "var(--line)", borderRadius: "var(--radius-lg)" }}>
            <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>🔍</span>
            <h3>No articles found for "{searchQuery || selectedCategory}"</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "8px", marginBottom: "20px" }}>
              Try adjusting your search query or selecting a different topic.
            </p>
            <button
              type="button"
              className="btn btn-yellow"
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ============================================================
            VIEW MODE 1: MAGAZINE EDITORIAL GRID (DEFAULT)
            ============================================================ */}
        {!loading && filteredPosts.length > 0 && viewMode === "magazine" && (
          <>
            {/* Featured Article Spotlight */}
            {featuredPost && (
              <article
                className="blog-featured-card"
                onClick={() => navigate(`/blog/${featuredPost.id}`)}
              >
                <div className="blog-featured-media">
                  <img src={getImage(featuredPost)} alt={getTitle(featuredPost)} />
                  <span className="featured-badge-overlay">
                    ★ EDITOR'S SPOTLIGHT
                  </span>
                </div>
                <div className="blog-featured-content">
                  <div>
                    <div className="blog-meta-row">
                      <span className={`blog-category-tag ${getCategoryClass(featuredPost.category)}`}>
                        {featuredPost.category || "AI & Tech"}
                      </span>
                      <span>•</span>
                      <span>{getReadTime(featuredPost)}</span>
                    </div>
                    <h2 style={{ margin: "12px 0 14px" }}>
                      {getTitle(featuredPost)}
                    </h2>
                    <p>{getExcerpt(featuredPost)}</p>
                  </div>

                  <div className="blog-author-row">
                    <div className="author-info">
                      <div className="author-avatar">
                        {getAuthor(featuredPost).charAt(0)}
                      </div>
                      <div>
                        <div className="author-name">{getAuthor(featuredPost)}</div>
                        <div className="author-date">{getDate(featuredPost)}</div>
                      </div>
                    </div>
                    <span className="read-more-link">
                      <span>Read Story</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* 3-Column Magazine Cards Grid */}
            <div className="blog-mag-grid">
              {gridPosts.map((post, idx) => (
                <article
                  key={post.id || idx}
                  className="blog-mag-card"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className="blog-mag-image-wrap">
                    <img src={getImage(post)} alt={getTitle(post)} loading="lazy" />
                    <span className={`mag-card-badge blog-category-tag ${getCategoryClass(post.category)}`}>
                      {post.category || "General"}
                    </span>
                  </div>
                  <div className="blog-mag-body">
                    <div className="blog-meta-row" style={{ fontSize: "11.5px" }}>
                      <span>{getDate(post)}</span>
                      <span>•</span>
                      <span>{getReadTime(post)}</span>
                    </div>
                    <h3>{getTitle(post)}</h3>
                    <p>{getExcerpt(post)}</p>
                    <div className="blog-mag-footer">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="author-avatar" style={{ width: "26px", height: "26px", fontSize: "11px" }}>
                          {getAuthor(post).charAt(0)}
                        </div>
                        <span style={{ fontWeight: "700", color: "var(--ink)", fontSize: "12px" }}>
                          {getAuthor(post)}
                        </span>
                      </div>
                      <span className="read-more-link">
                        Read →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Inline Newsletter Teardown */}
            <div className="blog-inline-newsletter">
              <div className="newsletter-content">
                <span className="badge-pill" style={{ background: "#fff", color: "#000", marginBottom: "8px" }}>
                  ⚡ Weekly Insights
                </span>
                <h3>Get the autonomous marketing playbook</h3>
                <p>Join 15,000+ content leaders getting our weekly teardowns every Tuesday morning.</p>
              </div>
              <div style={{ minWidth: "300px" }}>
                <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your work email"
                    className="newsletter-input"
                    style={{ background: "var(--paper)" }}
                  />
                  <button type="submit" className="btn btn-blue">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* ============================================================
            VIEW MODE 2: MODERN FEATURED SHOWCASE SLIDER
            ============================================================ */}
        {!loading && filteredPosts.length > 0 && viewMode === "showcase" && currentShowcasePost && (
          <div className="showcase-slider-wrap">
            <div className="showcase-stage">
              <div className="showcase-content">
                <div>
                  <div className="blog-meta-row" style={{ marginBottom: "12px" }}>
                    <span className={`blog-category-tag ${getCategoryClass(currentShowcasePost.category)}`}>
                      {currentShowcasePost.category || "Featured"}
                    </span>
                    <span>•</span>
                    <span>⏱️ {getReadTime(currentShowcasePost)}</span>
                  </div>
                  <h2 onClick={() => navigate(`/blog/${currentShowcasePost.id}`)}>
                    {getTitle(currentShowcasePost)}
                  </h2>
                  <p style={{ marginTop: "14px" }}>
                    {getExcerpt(currentShowcasePost)}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderTop: "1px dashed var(--grey-dark)", paddingTop: "18px" }}>
                  <div className="author-info">
                    <div className="author-avatar" style={{ width: "40px", height: "40px" }}>
                      {getAuthor(currentShowcasePost).charAt(0)}
                    </div>
                    <div>
                      <div className="author-name">{getAuthor(currentShowcasePost)}</div>
                      <div className="author-date">{getDate(currentShowcasePost)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-blue"
                    onClick={() => navigate(`/blog/${currentShowcasePost.id}`)}
                  >
                    <span>Read Full Story</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                className="showcase-media"
                onClick={() => navigate(`/blog/${currentShowcasePost.id}`)}
              >
                <img src={getImage(currentShowcasePost)} alt={getTitle(currentShowcasePost)} />
              </div>
            </div>

            {/* Slider Navigation Bar */}
            <div className="showcase-controls-bar">
              <div className="showcase-counter">
                SLIDE <strong>{String((activeSlide % filteredPosts.length) + 1).padStart(2, "0")}</strong> / {String(filteredPosts.length).padStart(2, "0")}
              </div>
              <div className="showcase-nav-btns">
                <button
                  type="button"
                  className="showcase-btn"
                  onClick={handlePrevSlide}
                  aria-label="Previous Slide"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="showcase-btn"
                  onClick={handleNextSlide}
                  aria-label="Next Slide"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Interactive Thumbnail Deck */}
            <div className="showcase-thumb-deck">
              {filteredPosts.map((post, idx) => (
                <button
                  key={post.id || idx}
                  type="button"
                  className={`showcase-thumb-card ${idx === activeSlide % filteredPosts.length ? "active" : ""}`}
                  onClick={() => setActiveSlide(idx)}
                >
                  <img src={getImage(post)} alt="" className="showcase-thumb-img" />
                  <span className="showcase-thumb-title">{getTitle(post)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            VIEW MODE 3: SLEEK MODERN EDITORIAL LIST VIEW
            ============================================================ */}
        {!loading && filteredPosts.length > 0 && viewMode === "list" && (
          <div className="blog-list-modern">
            {filteredPosts.map((post, idx) => (
              <article
                key={post.id || idx}
                className="blog-list-row"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className="blog-list-row-content">
                  <div className="blog-meta-row" style={{ fontSize: "12px" }}>
                    <span className={`blog-category-tag ${getCategoryClass(post.category)}`}>
                      {post.category || "Journal"}
                    </span>
                    <span>•</span>
                    <span>{getDate(post)}</span>
                    <span>•</span>
                    <span>⏱️ {getReadTime(post)}</span>
                  </div>
                  <h3>{getTitle(post)}</h3>
                  <p>{getExcerpt(post)}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="author-avatar" style={{ width: "26px", height: "26px", fontSize: "11px" }}>
                        {getAuthor(post).charAt(0)}
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--ink)", fontSize: "12.5px" }}>
                        {getAuthor(post)}
                      </span>
                    </div>
                    <span className="read-more-link" style={{ fontSize: "13.5px" }}>
                      Read Article →
                    </span>
                  </div>
                </div>

                <div className="blog-list-row-media">
                  <img src={getImage(post)} alt={getTitle(post)} loading="lazy" />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

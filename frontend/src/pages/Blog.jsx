import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export const fallbackPosts = [
  {
    id: "fallback-ai-content",
    title: "How AI is Revolutionizing Content Creation in 2025",
    excerpt: "Discover how artificial intelligence is transforming the way we create, optimize, and distribute content at scale.",
    category: "AI & Tech",
    author: "Sarah Chen",
    date: "Jun 5, 2025",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&h=600&fit=crop",
    content: "AI is changing how marketing teams plan, write, review, and distribute content. The strongest teams use automation to create more space for judgment, creativity, and better customer conversations."
  },
  {
    id: "fallback-seo-guide",
    title: "The Complete Guide to SEO Blog Optimization",
    excerpt: "Learn the proven strategies to rank your blog posts higher on Google and drive organic traffic consistently.",
    category: "SEO",
    author: "James Wilson",
    date: "Jun 3, 2025",
    readTime: 8,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=900&h=600&fit=crop",
    content: "A useful SEO article starts with a clear search intent, a strong structure, and answers that are genuinely useful. Build around the reader first, then make the page easy for search engines to understand."
  },
  {
    id: "fallback-content-strategy",
    title: "Building a Content Strategy That Scales",
    excerpt: "From solo blogger to content team, here is how to build a strategy that grows with your business.",
    category: "Content Strategy",
    author: "Maria Garcia",
    date: "Jun 1, 2025",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&h=600&fit=crop",
    content: "A scalable content system begins with one clear audience and a repeatable editorial rhythm. Document your process, reuse strong ideas across channels, and measure what helps the business move forward."
  },
  {
    id: "fallback-n8n-workflow",
    title: "Automating Your Publishing Workflow with n8n",
    excerpt: "Step-by-step ideas for setting up automated blog publishing pipelines using n8n workflows.",
    category: "Tutorials",
    author: "Alex Kumar",
    date: "May 28, 2025",
    readTime: 10,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=600&fit=crop",
    content: "Connect your brief, content generation, review, and publishing steps into one visible workflow. Automation works best when every handoff has a clear owner and a useful failure state."
  },
  {
    id: "fallback-readers",
    title: "How We Grew to 100k Readers in 6 Months",
    excerpt: "A real case study on how automated content creation helped a startup build massive organic reach.",
    category: "Case Studies",
    author: "David Park",
    date: "May 25, 2025",
    readTime: 7,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=600&fit=crop",
    content: "Audience growth came from a steady publishing system, useful evergreen topics, and careful review of what readers actually returned to read. Consistency made the learning loop faster."
  },
  {
    id: "fallback-prompts",
    title: "Writing Prompts That Get Better AI Output",
    excerpt: "Master the art of prompt engineering to get consistently high-quality blog content from AI models.",
    category: "AI & Tech",
    author: "Lisa Wang",
    date: "May 22, 2025",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop",
    content: "Good prompts provide context, audience, constraints, examples, and a clear definition of success. The more useful the brief, the less time you spend correcting generic output."
  }
];

function getTitle(post) {
  return String(post.title || post.heading || post.name || post.blog_title || "Untitled post")
    .replace(/^\s*["']|["']\s*$/g, "")
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
}

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState("slider");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

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

      if (queryError) {
        setPosts(fallbackPosts);
      } else {
        const sortedPosts = [...(data || [])].sort((first, second) => {
          const firstDate = new Date(first.created_at || first.updated_at || 0);
          const secondDate = new Date(second.created_at || second.updated_at || 0);
          return secondDate - firstDate;
        });
        setPosts(sortedPosts.length ? sortedPosts : fallbackPosts);
      }

      setLoading(false);
    }

    loadPosts();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredPosts = posts;

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

  function getWrappingDiff(index) {
    const count = filteredPosts.length;
    if (count <= 1) return 0;
    let difference = index - activeIndex;
    if (difference > (count - 1) / 2) difference -= count;
    if (difference <= -count / 2) difference += count;
    return difference;
  }

  function getCardStyle(index) {
    const difference = getWrappingDiff(index);
    const absoluteDifference = Math.abs(difference);
    if (absoluteDifference > 2) {
      return { opacity: 0, visibility: "hidden", transform: `translate3d(${difference > 0 ? 300 : -300}px, 0, -300px) scale(0.6) rotateY(${difference > 0 ? -40 : 40}deg)`, zIndex: 0 };
    }
    const spacing = isMobile ? 85 : 170;
    const overlap = isMobile ? 25 : 45;
    const zSpacing = isMobile ? 90 : 130;
    const translateX = difference * spacing - (difference > 0 ? overlap : difference < 0 ? -overlap : 0);
    return {
      transform: `translate3d(${translateX}px, 0, ${-absoluteDifference * zSpacing}px) scale(${difference === 0 ? 1.05 : 0.88 - (absoluteDifference - 1) * 0.05}) rotateY(${difference === 0 ? 0 : difference > 0 ? -40 : 40}deg)`,
      opacity: difference === 0 ? 1 : 0.65 - (absoluteDifference - 1) * 0.2,
      zIndex: 20 - absoluteDifference,
      pointerEvents: difference === 0 ? "auto" : "none"
    };
  }

  function handleCardClick(index, post) {
    if (index === activeIndex) navigate(`/blog/${post.id}`);
    else setActiveIndex(index);
  }

  return (
    <section className="sec blog-page" style={{ borderBottom: "none" }}>
      <div className="shell">
        <div className="sec-head">
          <span className="badge badge-blog">Onefeed journal</span>
          <h1>Ideas for sharper marketing.</h1>
          <p>
            Practical notes on content systems, campaign planning, and turning
            one strong brief into work that travels across every channel.
          </p>
        </div>
        {loading && <p className="auth-state">Loading blog posts...</p>}
        {!loading && filteredPosts.length > 0 && (
          <div className="blog-view-switcher">
            <button className={viewMode === "slider" ? "active" : ""} type="button" onClick={() => setViewMode("slider")}>3D Slider</button>
            <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")}>Show List</button>
          </div>
        )}
        {loading ? <p className="auth-state">Loading blog posts...</p> : filteredPosts.length === 0 ? (
          <p className="auth-message">No articles found in this category.</p>
        ) : viewMode === "slider" ? (
          <div className="blog-slider-wrap">
            <div className="blog-slider">
              {filteredPosts.map((post, index) => (
                <article className={`blog-slide ${index === activeIndex ? "active" : ""}`} style={getCardStyle(index)} key={post.id || index} onClick={() => handleCardClick(index, post)}>
                  <img src={getImage(post)} alt={getTitle(post)} />
                  <div className="blog-slide-body">
                    <span className="blog-meta">{post.category || "Onefeed journal"}</span>
                    <h3>{getTitle(post)}</h3>
                    <p>{getExcerpt(post)}</p>
                    <small>{post.readTime || Math.max(3, Math.round((getExcerpt(post).split(" ").length || 600) / 200))} min read</small>
                  </div>
                </article>
              ))}
              {filteredPosts.length > 1 && <>
                <button className="blog-slider-arrow prev" type="button" onClick={() => setActiveIndex((activeIndex - 1 + filteredPosts.length) % filteredPosts.length)} aria-label="Previous post">&#8249;</button>
                <button className="blog-slider-arrow next" type="button" onClick={() => setActiveIndex((activeIndex + 1) % filteredPosts.length)} aria-label="Next post">&#8250;</button>
              </>}
            </div>
            <div className="blog-slider-dots">
              {filteredPosts.map((post, index) => <button className={index === activeIndex ? "active" : ""} type="button" key={post.id || index} onClick={() => setActiveIndex(index)} aria-label={`Go to slide ${index + 1}`} />)}
            </div>
          </div>
        ) : (
          <div className="blog-list">
            {filteredPosts.map((post, index) => (
              <article className="blog-list-card" key={post.id || index} onClick={() => navigate(`/blog/${post.id}`)}>
                <img src={getImage(post)} alt={getTitle(post)} />
                <div><span className="blog-meta">{post.category || "Onefeed journal"}</span><h3>{getTitle(post)}</h3><p>{getExcerpt(post)}</p><small>{post.author || "Admin"} {post.date || ""}</small></div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

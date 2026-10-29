import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, BoltIcon, BrandIcon } from "../components/icons/Icons.jsx";
import { BRAND_ICONS } from "../components/icons/brandIcons.js";

const PRESET_PROMPTS = [
  {
    id: "sale",
    title: "Summer Flash Sale",
    emoji: "🛍️",
    prompt: "Launch a 48-hour 40% OFF summer flash sale for our premium SaaS tier with urgency and social proof.",
    outputs: {
      blog: {
        title: "The 48-Hour Summer Flash Sale: Upgrade Your Workflow at 40% Off",
        snippet: "Summer is here, and so is our biggest upgrade event of the season. For the next 48 hours only, get unlimited access to Onefeed's AI engine at 40% discount with promo code SUMMER40...",
        meta: "1,200 words • SEO Optimized • Includes Key Takeaways & CTA"
      },
      image: {
        title: "Vibrant Summer Neon Banner (1200x630 & 1080x1080)",
        snippet: "Bold 3D typography 'SUMMER FLASH SALE - 40% OFF' with modern gradient backdrop, holographic badge, and sleek CTA button overlay.",
        meta: "PNG & WebP • 3 Aspect Ratios (1:1, 16:9, 9:16)"
      },
      video: {
        title: "15s High-Energy TikTok / Reels Hook & Script",
        snippet: "[0-3s] Fast zoom: 'Stop making marketing content the slow way!' [4-9s] Rapid screen recording of 1-click generation. [10-15s] 'Use code SUMMER40 for 40% off this weekend only!'",
        meta: "9:16 Vertical Cut • Captions Included • Background Music Cue"
      },
      whatsapp: {
        title: "VIP Customer Broadcast Message",
        snippet: "⚡ *FLASH SALE ALERT:* Hey there! We just unlocked 40% OFF on all annual plans for the next 48 hours. Grab your spot before midnight Sunday: https://onefeed.app/summer40 🚀",
        meta: "Broadcast Ready • Formatted Markdown • 100% Delivery Optimized"
      }
    }
  },
  {
    id: "product",
    title: "AI 2.0 Product Update",
    emoji: "🚀",
    prompt: "Announce our major Onefeed 2.0 release featuring autonomous multichannel generation and team collaboration.",
    outputs: {
      blog: {
        title: "Introducing Onefeed 2.0: The Next Generation Multimodal Content Engine",
        snippet: "Today we are thrilled to unveil Onefeed 2.0. Built from the ground up with parallel workflow agents, real-time previewing, and enterprise review controls...",
        meta: "1,500 words • Technical Changelog • Feature Screenshots"
      },
      image: {
        title: "Futuristic Glassmorphic Product Mockup",
        snippet: "Multi-layered dashboard interface floating on dark titanium mesh with glowing neon accents and 'ONEFEED 2.0' embossed badge.",
        meta: "Ultra-HD 4K Asset • Hero Header & Social Media Pack"
      },
      video: {
        title: "30s Product Trailer & Feature Highlights",
        snippet: "[0-5s] Dynamic glitch transition: 'Content creation just evolved.' [6-20s] Feature montage showcasing Blog, Image, Video, and WhatsApp outputs simultaneously. [21-30s] 'Try 2.0 today.'",
        meta: "16:9 & 9:16 Formats • Cinematic Color Grade • Sound Design Cue"
      },
      whatsapp: {
        title: "Community & Beta Tester Announcement",
        snippet: "🚀 *Big News:* Onefeed 2.0 is officially LIVE! Experience 10x faster multimodal publishing directly from your dashboard: https://onefeed.app/v2-launch Let us know your feedback! 🔥",
        meta: "Formatted Broadcast • Direct CTA Link Included"
      }
    }
  },
  {
    id: "growth",
    title: "Growth Marketing Playbook",
    emoji: "📈",
    prompt: "Share our top 5 content distribution strategies that helped us scale to 100k readers without paid ads.",
    outputs: {
      blog: {
        title: "How to Scale Organic Reach: The 5-Step Multichannel Distribution Playbook",
        snippet: "Creating content is only 20% of the battle. The remaining 80% is smart distribution. Here is the exact framework we used to turn single core ideas into 100,000 monthly readers...",
        meta: "2,100 words • Step-by-Step Guide • Downloadable Cheat Sheet"
      },
      image: {
        title: "Data Infographic & Distribution Flowchart",
        snippet: "Clean minimalist diagram showing 1 core prompt branching out to SEO, Social Feeds, Video Reels, and Direct Messaging channels.",
        meta: "Infographic Format • High Contrast • High Shareability"
      },
      video: {
        title: "45s Educational Breakdown for LinkedIn & YouTube Shorts",
        snippet: "[0-5s] 'Most marketers make this 1 big mistake with their content.' [6-35s] Whiteboard animation explaining prompt leverage and multi-channel syndication. [36-45s] 'Follow for more playbook drops.'",
        meta: "Square & Vertical Cuts • Subtitles Baked In"
      },
      whatsapp: {
        title: "Weekly Growth Insights Dispatch",
        snippet: "📊 *Weekly Playbook:* Why repurposing manually wastes 15 hours every week. Read the full 5-step framework here: https://onefeed.app/distribution-playbook Enjoy reading! ✨",
        meta: "Engaging Hook • High Click-Through Rate"
      }
    }
  }
];

const CHANNELS = [
  {
    id: "blog",
    label: "Blog",
    tone: "amber",
    name: "Long-Form SEO Blog",
    badge: "Editorial Grade",
    file: "blog-post.md",
    desc: "Generate comprehensive, human-sounding articles complete with outline headings, key takeaways, SEO meta descriptions, and custom tone control.",
    features: ["Deep semantic keyword integration", "Automatic Table of Contents & Anchor links", "Ready for WordPress, Webflow, and Supabase"]
  },
  {
    id: "image",
    label: "Image",
    tone: "coral",
    name: "On-Brand Campaign Visuals",
    badge: "Multi-Ratio",
    file: "campaign-visual.png",
    desc: "Create high-impact visuals tailored for landscape web headers, square Instagram feeds, and vertical story layouts simultaneously.",
    features: ["1:1 Square, 16:9 Landscape, 9:16 Vertical", "Consistent color harmonizing with your brand", "Ultra-sharp HD resolution ready to download"]
  },
  {
    id: "video",
    label: "Video",
    tone: "ink",
    name: "Short-Form Video Scripts",
    badge: "Viral Hooks",
    file: "video-script.md",
    desc: "Turn your brief into high-retention video storyboards with 3-second scroll-stopping hooks, visual cues, and timed voiceover narration.",
    features: ["Optimized for TikTok, Instagram Reels, and YT Shorts", "B-roll and footage direction markers", "Voiceover audio script with pacing markers"]
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    tone: "teal",
    name: "WhatsApp & Direct Broadcasts",
    badge: "High Open Rate",
    file: "whatsapp-broadcast.txt",
    desc: "High-converting direct response messages formatted with bold highlights, bullet markers, emojis, and tracked call-to-action links.",
    features: ["WhatsApp markdown formatted (*bold*, _italic_)", "Segmented for VIP customers, leads, or communities", "Instant copy button for zero-delay sending"]
  }
];

const PLATFORM_CARDS = [
  {
    icon: "review",
    tone: "sand",
    name: "Unified Review Dashboard",
    badge: "You approve",
    desc: "Every piece of generated content can be inspected, tweaked, regenerated, or approved with a single click before going to external channels."
  },
  {
    icon: "lock",
    tone: "sand",
    name: "Private by Default",
    badge: "Encrypted",
    desc: "Prompt briefs and workspace assets are stored with role-based access control, encrypted in transit and at rest, and never used to train public models."
  }
];

const FORMAT_ROWS = [
  ["SEO blog posts", "Key takeaways", "Table of contents", "Meta descriptions", "Custom tone control", "WordPress-ready", "Webflow-ready", "Supabase-ready"],
  ["1:1 Square", "16:9 Landscape", "9:16 Vertical", "Web headers", "Instagram feeds", "Story layouts", "HD downloads", "Brand color harmony"],
  ["TikTok hooks", "Instagram Reels", "YouTube Shorts", "B-roll markers", "Voiceover scripts", "WhatsApp *bold* formatting", "VIP segments", "Tracked CTA links"]
];

const PUBLISH_TARGETS = ["wordpress", "webflow", "supabase", "instagram", "tiktok", "youtubeshorts", "whatsapp"];

const COMPARISON = [
  { task: "Briefing writers, designers & video editors", old: "3–5 days delay" },
  { task: "Consistent messaging across every channel", old: "Inconsistent", oldMuted: true },
  { task: "Tools and logins to manage", old: "6 SaaS subscriptions" },
  { task: "Feedback and file versions", old: "Endless Slack threads" },
  { task: "Review & edit before publishing", old: "Scattered across tools", oldMuted: true }
];

const FAQS = [
  {
    q: "How does Onefeed generate four distinct channels from a single prompt?",
    a: "Onefeed uses specialized autonomous AI agents chained through modern workflow orchestration. When you submit a prompt, it simultaneously constructs structured markdown for blogs, generates visual creative prompts for images, storyboard scripts for videos, and concise formatted copy for WhatsApp broadcasts."
  },
  {
    q: "Can I review and edit content before it gets published?",
    a: "Absolutely. Onefeed features a Unified Review Dashboard where every piece of generated content can be inspected, tweaked, regenerated, or approved with a single click before going to external channels."
  },
  {
    q: "What AI models and engines power Onefeed?",
    a: "Onefeed integrates state-of-the-art multimodal AI models (including advanced LLMs and high-resolution generative image models) connected with automated webhook pipelines to ensure industry-leading speed and accuracy."
  },
  {
    q: "Do I need technical skills or coding knowledge to use Onefeed?",
    a: "Not at all. If you can type a message in a chat box, you can run entire multi-channel marketing campaigns in seconds. The UI is designed for marketing managers, content creators, and founders."
  },
  {
    q: "Is my business data and content private?",
    a: "Yes. All prompt briefs and workspace assets are securely stored with role-based access control, encryption in transit and at rest, and are never shared or used to train public foundational models."
  }
];

const channelById = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));

export default function Home() {
  const [selectedPromptId, setSelectedPromptId] = useState("sale");
  const [activeTab, setActiveTab] = useState("blog");

  const activePrompt = PRESET_PROMPTS.find((p) => p.id === selectedPromptId) || PRESET_PROMPTS[0];

  return (
    <div className="home">
      <Hero />
      <StudioPreview
        activePrompt={activePrompt}
        onSelectPrompt={setSelectedPromptId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
      <StepBrief activePrompt={activePrompt} onSelectPrompt={setSelectedPromptId} />
      <StepGenerate />
      <StepPublish />
      <CampaignExamples />
      <SampleOutputs />
      <Comparison />
      <JournalPromo />
      <Faq />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hero() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard", { state: { prompt: brief.trim() } });
  }

  return (
    <section className="ok-hero">
      <span className="tile-accents" aria-hidden="true" />
      <div className="ok-container ok-hero-inner">
        <Link to="/about" className="announce-card">
          <strong>Next-Gen Multi-Channel AI Platform</strong>
          <span>Blog · Image · Video · WhatsApp from one brief</span>
        </Link>

        <span className="hero-mark" aria-hidden="true">
          <BoltIcon size={30} />
        </span>

        <h1>One prompt. Every channel, handled.</h1>
        <p className="ok-hero-sub">
          Onefeed turns a single brief into a publication-ready blog post, stunning campaign visuals, engaging video scripts, and formatted WhatsApp broadcasts in seconds.
        </p>

        <form className="pill-form ok-hero-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe your campaign…"
            aria-label="Describe your campaign"
          />
          <button type="submit" className="btn btn-blue">
            Open Studio
            <Icon name="arrowRight" size={16} strokeWidth={2} />
          </button>
        </form>
        <p className="ok-hero-note">No prompt engineering required · Review everything before it ships</p>

        <p className="ok-hero-agents-label">Onefeed runs 4 channel agents in parallel</p>
        <div className="ok-hero-agents">
          {CHANNELS.map((c) => (
            <Link key={c.id} to={`/dashboard/${c.id}`} className="hero-agent">
              <span className={`icon-tile tone-${c.tone}`}>
                <Icon name={c.id} size={20} />
              </span>
              <span className="hero-agent-label">{c.label}</span>
              <span className="hero-agent-tip" role="tooltip">{c.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="format-marquee">
        <p className="format-marquee-label">50,000+ marketing assets generated · formatted for every channel</p>
        {FORMAT_ROWS.map((row, i) => (
          <div key={i} className={`marquee-row ${i % 2 ? "reverse" : ""}`}>
            <div className="marquee-track">
              {[...row, ...row].map((chip, j) => (
                <span key={j} className="format-chip" aria-hidden={j >= row.length}>
                  <span className={`chip-dot tone-${CHANNELS[(i + j) % 4].tone}`} />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StudioPreview({ activePrompt, onSelectPrompt, activeTab, onSelectTab }) {
  const activeOutput = activePrompt.outputs[activeTab];

  return (
    <section className="ok-section studio-preview-section" aria-label="Onefeed studio preview">
      <div className="ok-container">
        <div className="studio-frame">
          <div className="studio-topbar">
            <span className="studio-workspace">
              <span className="studio-avatar">O</span>
              Onefeed Studio
              <Icon name="chevronDown" size={12} strokeWidth={2} />
            </span>
            <span className="studio-live">
              <span className="pulse-dot green" />4 agents ready
            </span>
            <span className="studio-stat">Assets <b>50K+</b></span>
            <span className="studio-stat">Uptime <b>99.9%</b></span>
            <span className="studio-stat hide-sm">Speed <b>10x</b></span>
            <span className="studio-stat hide-sm">Channels <b>4-in-1</b></span>
          </div>

          <div className="studio-body">
            <aside className="studio-side">
              <div className="studio-side-head">
                Briefs <small>{PRESET_PROMPTS.length}</small>
              </div>
              {PRESET_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`studio-side-item ${p.id === activePrompt.id ? "active" : ""}`}
                  onClick={() => onSelectPrompt(p.id)}
                >
                  <Icon name="file" size={14} />
                  <span>{p.title}</span>
                </button>
              ))}

              <div className="studio-side-head">
                Channels <small>{CHANNELS.length}</small>
              </div>
              {CHANNELS.map((c) => (
                <div key={c.id} className="studio-side-item static">
                  <span className={`chip-dot tone-${c.tone}`} />
                  <span>{c.label}</span>
                </div>
              ))}

              <div className="studio-user">
                <span className="studio-avatar lg">O</span>
                <span>
                  <strong>Onefeed Team</strong>
                  <small>Studio workspace</small>
                </span>
              </div>
            </aside>

            <div className="studio-main">
              <div className="studio-welcome">
                <h3>Welcome back.</h3>
                <p>4 assets are ready for review. Approve, edit, or regenerate.</p>
              </div>

              <div className="studio-brief">
                <span className="studio-label">Input brief</span>
                <p>"{activePrompt.prompt}"</p>
              </div>

              <div className="studio-list-head">
                <span>Today</span>
                <span className="studio-progress">
                  <span className="studio-progress-bar" />4 of 4 generated
                </span>
              </div>
              <div className="studio-list">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`studio-row ${activeTab === c.id ? "active" : ""}`}
                    onClick={() => onSelectTab(c.id)}
                  >
                    <span className={`icon-tile sm tone-${c.tone}`}>
                      <Icon name={c.id} size={14} />
                    </span>
                    <span className="studio-row-text">
                      <span className="studio-row-kind">{c.label} ·</span> {activePrompt.outputs[c.id].title}
                    </span>
                    <span className="studio-row-action">{activeTab === c.id ? "Previewing" : "Preview"}</span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="studio-preview">
              <div className="studio-preview-tab">
                <Icon name="chat" size={13} /> Preview
              </div>
              <div className="studio-preview-body">
                <span className={`output-tag tag-${activeTab}`}>{channelById[activeTab].label} output generated</span>
                <h4>{activeOutput.title}</h4>
                <p>{activeOutput.snippet}</p>
                <div className="studio-preview-meta">⚡ {activeOutput.meta}</div>
              </div>
              <div className="studio-preview-actions">
                <span className="studio-btn ghost">Regenerate</span>
                <span className="studio-btn">Approve</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepBrief({ activePrompt, onSelectPrompt }) {
  return (
    <section className="ok-section step-brief">
      <div className="ok-container step-brief-grid">
        <div className="step-brief-copy">
          <span className="step-chip">Step 1 — Brief</span>
          <h2 className="ok-h2">Submit a brief in plain English</h2>
          <p className="ok-lead">
            Type a campaign goal, product update, or paste raw notes in the Onefeed studio chat. No complex prompt engineering required.
          </p>
          <div className="pill-tabs" role="tablist" aria-label="Example briefs">
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === activePrompt.id}
                className={`pill-tab ${p.id === activePrompt.id ? "active" : ""}`}
                onClick={() => onSelectPrompt(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <article className="brief-doc">
          <header>
            <h3>Campaign Brief</h3>
            <p>
              <Icon name="calendar" size={13} /> Generated today · {activePrompt.title}
            </p>
          </header>
          <h4>Goal</h4>
          <p>{activePrompt.prompt}</p>
          {CHANNELS.map((c) => (
            <div key={c.id} className="brief-doc-block">
              <h4>{c.name}</h4>
              <p>{activePrompt.outputs[c.id].title}</p>
              <small>{activePrompt.outputs[c.id].meta}</small>
            </div>
          ))}
        </article>
      </div>

      <div className="step-connector" aria-hidden="true" />
      <div className="handoff-card">
        <span className="ok-eyebrow">The handoff</span>
        <p>One brief feeds all four agents, so every output inherits identical campaign DNA.</p>
        <div className="file-chips">
          {CHANNELS.map((c) => (
            <span key={c.id} className="file-chip">
              <Icon name="file" size={12} />
              {c.file}
            </span>
          ))}
        </div>
      </div>
      <div className="step-connector arrow" aria-hidden="true">
        <Icon name="arrowDown" size={14} />
      </div>
    </section>
  );
}

function StepGenerate() {
  return (
    <section className="ok-section step-generate">
      <div className="ok-container">
        <div className="ok-head center">
          <span className="step-chip">Step 2 — Generate</span>
          <h2 className="ok-h2">Multimodal agents run in parallel, channel by channel.</h2>
          <p className="ok-lead">
            Autonomous workflows process your request simultaneously: copywriters craft the blog, vision engines render images, and scriptwriters structure the video.
          </p>
        </div>

        <div className="agent-grid">
          {CHANNELS.map((c) => (
            <article key={c.id} className="agent-card">
              <span className="checker" aria-hidden="true" />
              <span className={`icon-tile tone-${c.tone}`}>
                <Icon name={c.id} size={20} />
              </span>
              <h3>
                {c.name} <span className="mini-badge">{c.badge}</span>
              </h3>
              <p>{c.desc}</p>
              <ul className="agent-features">
                {c.features.map((f) => (
                  <li key={f}>
                    <Icon name="review" size={14} />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {PLATFORM_CARDS.map((card) => (
            <article key={card.name} className="agent-card">
              <span className="checker" aria-hidden="true" />
              <span className={`icon-tile tone-${card.tone}`}>
                <Icon name={card.icon} size={20} />
              </span>
              <h3>
                {card.name} <span className="mini-badge">{card.badge}</span>
              </h3>
              <p>{card.desc}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="step-connector arrow tall" aria-hidden="true">
        <Icon name="arrowDown" size={14} />
      </div>
    </section>
  );
}

function StepPublish() {
  return (
    <section className="ok-section step-publish">
      <div className="ok-container">
        <div className="ok-head center">
          <span className="step-chip">Step 3 — Publish</span>
          <h2 className="ok-h2">
            Review, polish &amp; ship.
            <br className="br-desktop" /> Publish where your audience is.
          </h2>
          <p className="ok-lead">
            Everything lands neatly in your dashboard. Review each asset, make any quick adjustments, and push to live channels with total confidence.
          </p>
        </div>

        <div className="publish-grid">
          {PUBLISH_TARGETS.map((id) => (
            <div key={id} className="publish-tile">
              <span className="publish-icon">
                <BrandIcon id={id} size={22} />
              </span>
              <span>{BRAND_ICONS[id].name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CampaignExamples() {
  const [index, setIndex] = useState(0);
  const last = PRESET_PROMPTS.length - 1;

  return (
    <section className="ok-section stories">
      <div className="ok-container">
        <div className="ok-head center">
          <p className="ok-kicker">Campaign examples</p>
          <h2 className="ok-h2">One brief. Four finished assets.</h2>
          <p className="ok-lead">
            See how a single prompt becomes a blog post, campaign visual, video script, and WhatsApp broadcast, ready to review.
          </p>
          <Link to="/dashboard" className="text-link">
            Try it in the studio <Icon name="arrowRight" size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>

      <div className="story-viewport">
        <div className="story-track" style={{ "--slide": index }}>
          {PRESET_PROMPTS.map((p, i) => (
            <article key={p.id} className={`story-card ${i === index ? "active" : ""}`} aria-hidden={i !== index}>
              <div className="story-copy">
                <div className="story-brand">
                  <span className="story-logo">{p.emoji}</span>
                  <span>
                    <strong>{p.title}</strong>
                    <small>Campaign brief</small>
                  </span>
                </div>
                <h3>{p.outputs.blog.title}</h3>
                <div className="story-stat">
                  <span>4 assets</span>
                  <small>Blog · Visual · Video · WhatsApp</small>
                </div>
                <Link to="/dashboard" className="text-link" tabIndex={i === index ? 0 : -1}>
                  Open in studio <Icon name="arrowRight" size={15} strokeWidth={2} />
                </Link>
              </div>
              <div className={`story-visual v${i % 3}`}>
                <p>“{p.prompt}”</p>
                <div className="story-visual-chips">
                  {CHANNELS.map((c) => (
                    <span key={c.id}>{c.label}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="story-controls">
        <button type="button" className="round-btn" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} aria-label="Previous example">
          <Icon name="arrowLeft" size={16} />
        </button>
        <div className="story-dots">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={i === index ? "active" : ""}
              onClick={() => setIndex(i)}
              aria-label={`Show ${p.title}`}
              aria-current={i === index}
            />
          ))}
        </div>
        <button type="button" className="round-btn" onClick={() => setIndex((i) => Math.min(last, i + 1))} disabled={index === last} aria-label="Next example">
          <Icon name="arrowRight" size={16} />
        </button>
      </div>
    </section>
  );
}

function SampleOutputs() {
  const samples = PRESET_PROMPTS.flatMap((p) =>
    CHANNELS.map((c) => ({ key: `${p.id}-${c.id}`, channel: c, campaign: p.title, text: p.outputs[c.id].snippet }))
  );
  const rows = [samples.filter((_, i) => i % 2 === 0), samples.filter((_, i) => i % 2 === 1)];

  return (
    <section className="ok-section samples">
      <p className="ok-kicker wide">Sample outputs</p>
      <h2 className="ok-h2 sm center">Written once. Ready everywhere.</h2>
      <div className="samples-rows">
        {rows.map((row, i) => (
          <div key={i} className={`marquee-row slow ${i ? "reverse" : ""}`}>
            <div className="marquee-track">
              {[...row, ...row].map((s, j) => (
                <figure key={`${s.key}-${j}`} className="sample-card" aria-hidden={j >= row.length}>
                  <blockquote>“{s.text}”</blockquote>
                  <figcaption>
                    <span className={`icon-tile xs tone-${s.channel.tone}`}>
                      <Icon name={s.channel.id} size={11} />
                    </span>
                    <span>
                      <strong>{s.channel.label}</strong>
                      <small>{s.campaign}</small>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="ok-section compare">
      <div className="ok-container">
        <div className="ok-head center">
          <span className="step-chip">From 3–5 days to under 30 seconds</span>
          <h2 className="ok-h2">Why modern teams switch to Onefeed</h2>
        </div>
        <div className="compare-scroll">
          <div className="compare-table" role="table" aria-label="The disconnected way compared with Onefeed">
            <div className="compare-row head" role="row">
              <span role="columnheader">What needs doing</span>
              <span role="columnheader">The disconnected way</span>
              <span role="columnheader" className="good">With Onefeed</span>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.task} className="compare-row" role="row">
                <span role="cell">{row.task}</span>
                <span role="cell" className={row.oldMuted ? "muted" : ""}>{row.old}</span>
                <span role="cell" className="good">
                  <Icon name="checkCircle" size={16} />
                </span>
              </div>
            ))}
            <div className="compare-row total" role="row">
              <span role="cell">Idea to launch</span>
              <span role="cell" className="bad">3–5 days</span>
              <span role="cell" className="good">Same day</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function JournalPromo() {
  return (
    <section className="ok-section journal">
      <div className="ok-container">
        <div className="journal-card">
          <div className="journal-copy">
            <span className="journal-mark" aria-hidden="true">
              <BoltIcon size={22} />
            </span>
            <h2 className="ok-h2">Ideas for sharper, faster marketing.</h2>
            <p>
              Battle-tested frameworks on multi-channel content operations, autonomous AI pipelines, SEO scaling, and high-converting copywriting.
            </p>
            <Link to="/blog" className="btn btn-blue btn-square">
              Read the journal
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </Link>
          </div>
          <div className="journal-visual" aria-hidden="true">
            <div className="journal-book">
              <span className="journal-book-mark">
                <BoltIcon size={26} />
              </span>
              <span className="journal-book-rule" />
              <strong>The Onefeed Journal</strong>
              <small>Engineering &amp; growth playbooks for multi-channel teams.</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="ok-section faq">
      <span className="tile-accents left" aria-hidden="true" />
      <div className="ok-container faq-layout">
        <div className="faq-intro">
          <span className="faq-mark" aria-hidden="true">
            <Icon name="chat" size={28} strokeWidth={1.6} />
          </span>
          <p>Got questions?</p>
          <h2 className="ok-h2">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="faq-trigger"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <Icon name="sparkle" size={16} className="faq-icon" />
                </button>
                {isOpen && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


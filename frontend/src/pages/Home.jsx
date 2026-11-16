import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../components/icons/Icons.jsx";
import { useJourney } from "../lib/journey.js";
import { useScrollFx } from "../lib/useScrollFx.js";
import { useSmoothScroll } from "../lib/smoothScroll.js";

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
    name: "SEO blog post",
    desc: "A long-form article with headings, key takeaways and a meta description."
  },
  {
    id: "image",
    label: "Image",
    tone: "coral",
    name: "Campaign visuals",
    desc: "On-brand images sized for web headers, square feeds and vertical stories."
  },
  {
    id: "video",
    label: "Video",
    tone: "ink",
    name: "Short video script",
    desc: "A hook-first script with visual cues, ready for Reels, TikTok and Shorts."
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    tone: "teal",
    name: "WhatsApp broadcast",
    desc: "A formatted message with a clear call to action, ready to send."
  }
];

const FORMAT_ROWS = [
  ["SEO blog posts", "Key takeaways", "Table of contents", "Meta descriptions", "Custom tone control", "WordPress-ready", "Webflow-ready", "Supabase-ready"],
  ["1:1 Square", "16:9 Landscape", "9:16 Vertical", "Web headers", "Instagram feeds", "Story layouts", "HD downloads", "Brand color harmony"],
  ["TikTok hooks", "Instagram Reels", "YouTube Shorts", "B-roll markers", "Voiceover scripts", "WhatsApp *bold* formatting", "VIP segments", "Tracked CTA links"]
];

const STEPS = [
  {
    label: "Brief",
    title: "Write one brief",
    desc: "Describe a campaign or product update, or paste rough notes. Plain English is enough.",
    visual: "brief"
  },
  {
    label: "Agents",
    title: "Agents draft every channel",
    desc: "Four channel agents write the blog post, visuals, video script and WhatsApp message at the same time.",
    visual: "agents"
  },
  {
    label: "Review",
    title: "Review and publish",
    desc: "Everything lands in your dashboard. Edit, regenerate or approve each piece before it goes out.",
    visual: "review"
  }
];

// One entry per scene of the 3D journey, in order; shown in the dot navigation.
const SCENE_LABELS = ["Intro", "Studio", ...STEPS.map((step) => step.label), "Channels"];

// Chips and icon tiles that float past the camera between scenes.
const DEBRIS_LABELS = FORMAT_ROWS.flat();
const DEBRIS = Array.from({ length: 26 }, (_, i) => {
  const channel = CHANNELS[(i + Math.floor(i / 4)) % CHANNELS.length];
  return i % 4 === 1
    ? { icon: channel.id, tone: channel.tone }
    : { label: DEBRIS_LABELS[(i * 5) % DEBRIS_LABELS.length], tone: channel.tone };
});

const FAQS = [
  {
    q: "How does Onefeed create four channels from one prompt?",
    a: "Your brief goes to four channel agents that run in parallel. Each one writes for its own format: a structured blog post, image prompts and visuals, a video script, and a short WhatsApp broadcast."
  },
  {
    q: "Can I review and edit content before it is published?",
    a: "Yes. Every piece lands in your dashboard first, where you can edit, regenerate or approve it."
  },
  {
    q: "Do I need technical skills to use Onefeed?",
    a: "No. If you can type a message in a chat box, you can run a multi-channel campaign."
  },
  {
    q: "Is my business data private?",
    a: "Your briefs and generated content are stored in your own workspace and are only visible to people you give access to."
  }
];

const channelById = Object.fromEntries(CHANNELS.map((c) => [c.id, c]));

export default function Home() {
  const [selectedPromptId, setSelectedPromptId] = useState("sale");
  const [activeTab, setActiveTab] = useState("blog");
  const journeyRef = useRef(null);
  useSmoothScroll();
  useJourney(journeyRef);
  useScrollFx();

  const activePrompt = PRESET_PROMPTS.find((p) => p.id === selectedPromptId) || PRESET_PROMPTS[0];

  return (
    <div className="home">
      {/* The scenes below are stacked sections by default; lib/journey.js turns them into a 3D fly-through. */}
      <section className="journey" ref={journeyRef} aria-label="Onefeed product tour">
        <div className="journey-stage">
          <canvas className="journey-canvas" aria-hidden="true" />
          <div className="journey-glow" aria-hidden="true">
            <div className="journey-glow-orbs">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="journey-world">
            <Scene className="scene-hero">
              <Hero />
            </Scene>
            <Scene className="scene-studio">
              <StudioPreview
                activePrompt={activePrompt}
                onSelectPrompt={setSelectedPromptId}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            </Scene>
            {STEPS.map((step, i) => (
              <Scene key={step.title} className="scene-step">
                <StepCard step={step} index={i} />
              </Scene>
            ))}
            <Scene className="scene-ring">
              <Channels />
            </Scene>

            {DEBRIS.map((item, i) => (
              <span key={i} className="debris" aria-hidden="true">
                <span
                  className="debris-body"
                  style={{ "--ry": `${((i % 5) - 2) * 9}deg`, "--rz": `${((i % 3) - 1) * 5}deg`, "--fd": `${-i * 0.7}s` }}
                >
                  {item.icon ? (
                    <span className={`icon-tile tone-${item.tone}`}>
                      <Icon name={item.icon} size={26} />
                    </span>
                  ) : (
                    <span className="format-chip">
                      <span className={`chip-dot tone-${item.tone}`} />
                      {item.label}
                    </span>
                  )}
                </span>
              </span>
            ))}
          </div>

          <nav className="journey-nav" aria-label="Tour sections">
            {SCENE_LABELS.map((label) => (
              <button key={label} type="button" className="journey-dot" data-label={label} aria-label={`Go to ${label}`} />
            ))}
          </nav>
          <div className="journey-hint" aria-hidden="true">Scroll</div>
        </div>
      </section>

      <Faq />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Scene({ className, children }) {
  return (
    <div className={`scene ${className}`}>
      <div className="scene-inner">{children}</div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard", { state: { prompt: brief.trim() } });
  }

  return (
    <div className="ok-hero">
      <div className="ok-container ok-hero-inner">
        <span className="hero-pill hero-in" style={{ "--d": 0 }}>
          <span className="pulse-dot green" />
          Blog · Image · Video · WhatsApp
        </span>

        <h1 className="hero-in" style={{ "--d": 1 }}>One prompt. Every channel, handled.</h1>
        <p className="ok-hero-sub hero-in" style={{ "--d": 2 }}>
          Write one brief and get a blog post, campaign visuals, a video script and a WhatsApp broadcast, ready to review.
        </p>

        <form className="pill-form ok-hero-form hero-in" style={{ "--d": 3 }} onSubmit={handleSubmit}>
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
        <p className="ok-hero-note hero-in" style={{ "--d": 4 }}>
          No prompt engineering required · Review everything before it ships
        </p>
      </div>

      <div className="format-marquee">
        <p className="format-marquee-label">Formatted for every channel</p>
        {FORMAT_ROWS.map((row, i) => (
          <div key={i} className={`marquee-row ${i % 2 ? "reverse" : ""}`}>
            <div className="marquee-track">
              {[...row, ...row].map((chip, j) => (
                <span key={j} className="format-chip" aria-hidden={j >= row.length}>
                  <span className={`chip-dot tone-${CHANNELS[(i + j) % CHANNELS.length].tone}`} />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudioPreview({ activePrompt, onSelectPrompt, activeTab, onSelectTab }) {
  const activeOutput = activePrompt.outputs[activeTab];

  return (
    <div className="ok-container">
      <div className="scene-head">
        <p className="ok-kicker">The studio</p>
        <h2 className="ok-h2">Every asset lands in one workspace</h2>
      </div>

      <div className="studio-frame">
        <div className="studio-topbar">
          <span className="studio-workspace">
            <span className="studio-avatar">O</span>
            Onefeed Studio
          </span>
          <span className="studio-live">
            <span className="pulse-dot green" />4 agents ready
          </span>
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
          </aside>

          <div className="studio-main">
            <div className="studio-brief">
              <span className="studio-label">Input brief</span>
              <p>"{activePrompt.prompt}"</p>
            </div>

            <div className="studio-list-head">
              <span>Generated</span>
              <span className="studio-progress">
                <span className="studio-progress-bar" />4 of 4 ready
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
              <span className={`output-tag tag-${activeTab}`}>{channelById[activeTab].label}</span>
              <h4>{activeOutput.title}</h4>
              <p>{activeOutput.snippet}</p>
              <div className="studio-preview-meta">{activeOutput.meta}</div>
            </div>
            <div className="studio-preview-actions">
              <span className="studio-btn ghost">Regenerate</span>
              <span className="studio-btn">Approve</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, index }) {
  return (
    <div className="ok-container step-wrap">
      <article className="step-card">
        <div className="step-copy">
          <p className="ok-kicker">
            How it works · Step {index + 1} of {STEPS.length}
          </p>
          <span className="step-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <h2>{step.title}</h2>
          <p>{step.desc}</p>
        </div>
        <StepVisual kind={step.visual} />
      </article>
    </div>
  );
}

// Small illustrated UI for each step; it plays once when its scene arrives.
function StepVisual({ kind }) {
  if (kind === "brief") {
    return (
      <div className="mock-window" aria-hidden="true">
        <div className="mock-bar"><span /><span /><span /></div>
        <p className="mock-label">New brief</p>
        <p className="mock-input">
          <span className="mock-typed">Launch a 48-hour summer sale, friendly tone.</span>
        </p>
        <div className="mock-chips">
          <span>Friendly tone</span>
          <span>4 channels</span>
          <span>Launch week</span>
        </div>
      </div>
    );
  }

  if (kind === "agents") {
    return (
      <div className="mock-window" aria-hidden="true">
        <div className="mock-bar"><span /><span /><span /></div>
        <p className="mock-label">Agents running</p>
        {CHANNELS.map((c, i) => (
          <div key={c.id} className="mock-agent" style={{ "--i": i }}>
            <span className={`icon-tile sm tone-${c.tone}`}>
              <Icon name={c.id} size={14} />
            </span>
            <span className="mock-agent-name">{c.label}</span>
            <span className="mock-track"><span className="mock-fill" /></span>
            <span className="mock-done"><Icon name="check" size={12} strokeWidth={3} /></span>
          </div>
        ))}
      </div>
    );
  }

  const sample = PRESET_PROMPTS[0].outputs.blog;
  return (
    <div className="mock-window" aria-hidden="true">
      <div className="mock-bar"><span /><span /><span /></div>
      <div className="mock-doc-head">
        <span className="output-tag tag-blog">Blog</span>
        <span className="mock-approved"><Icon name="check" size={12} strokeWidth={3} /> Approved</span>
      </div>
      <p className="mock-doc-title">{sample.title}</p>
      <span className="mock-line w90" />
      <span className="mock-line w75" />
      <span className="mock-line w60" />
      <div className="mock-actions">
        <span className="studio-btn ghost">Regenerate</span>
        <span className="studio-btn">Approve</span>
      </div>
    </div>
  );
}

function Channels() {
  const samples = PRESET_PROMPTS[0].outputs;

  return (
    <>
      <div className="ok-container scene-head">
        <p className="ok-kicker">What you get</p>
        <h2 className="ok-h2">Four channels from every brief</h2>
        <div className="ring-meter" aria-hidden="true">
          <span className="ring-meter-fill" />
        </div>
      </div>

      <div className="ring-view">
        <div className="ring">
          {CHANNELS.map((c, i) => (
            <Link key={c.id} to={`/dashboard/${c.id}`} className="ring-card">
              <div className="ring-card-top">
                <span className={`icon-tile tone-${c.tone}`}>
                  <Icon name={c.id} size={20} />
                </span>
                <span className="ring-index">
                  {String(i + 1).padStart(2, "0")} / {String(CHANNELS.length).padStart(2, "0")}
                </span>
              </div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <div className="ring-sample">
                <span className="mock-label">Sample output</span>
                <strong>{samples[c.id].title}</strong>
                <p>{samples[c.id].snippet}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section className="ok-section faq">
      <div className="ok-container faq-layout">
        <div className="faq-intro" data-reveal>
          <p className="ok-kicker">FAQ</p>
          <h2 className="ok-h2">Questions, answered</h2>
        </div>
        <div className="faq-list" data-reveal>
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

import { useState } from "react";
import { Link } from "react-router-dom";

const PRESET_PROMPTS = [
  {
    id: "sale",
    title: "Summer Flash Sale 🛍️",
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
    title: "AI 2.0 Product Update 🚀",
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
    title: "Growth Marketing Playbook 📈",
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

export default function Home() {
  const [selectedPromptId, setSelectedPromptId] = useState("sale");
  const [activeTab, setActiveTab] = useState("blog");
  const [openFaq, setOpenFaq] = useState(0);

  const activePrompt = PRESET_PROMPTS.find((p) => p.id === selectedPromptId) || PRESET_PROMPTS[0];
  const activeOutput = activePrompt.outputs[activeTab];

  return (
    <>
      {/* ============================================================
          HERO SECTION (Split Layout with Live Interactive Simulator)
          ============================================================ */}
      <section className="hero-v2">
        <div className="shell">
          <div className="hero-v2-grid">
            {/* Left Column: Copy & CTAs */}
            <div className="hero-v2-content">
              <div className="badge-pill blue">
                <span className="pulse-dot" />
                <span>Next-Gen Multi-Channel AI Platform</span>
              </div>

              <h1>
                One prompt. <span className="highlight-text">Every channel</span>, handled.
              </h1>

              <p className="hero-desc">
                Onefeed turns a single brief into a publication-ready <strong>Blog Post</strong>, stunning <strong>Campaign Visuals</strong>, engaging <strong>Video Scripts</strong>, and formatted <strong>WhatsApp Broadcasts</strong> in seconds.
              </p>

              <div className="hero-v2-cta">
                <Link to="/dashboard" className="btn btn-blue btn-lg">
                  <span>Open Studio Dashboard</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link to="/about" className="btn btn-yellow btn-lg">
                  <span>Explore Architecture</span>
                </Link>
              </div>

              <div className="hero-trust-bar">
                <div className="trust-avatars">
                  <div className="trust-avatar">🚀</div>
                  <div className="trust-avatar">⚡</div>
                  <div className="trust-avatar">💡</div>
                  <div className="trust-avatar">🔥</div>
                </div>
                <div className="trust-text">
                  <strong>50,000+</strong> marketing assets generated with 99.9% publishing reliability.
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Demo Simulator */}
            <div className="hero-playground">
              <div className="playground-header">
                <div className="window-controls">
                  <span className="win-dot red" />
                  <span className="win-dot yellow" />
                  <span className="win-dot green" />
                </div>
                <div className="playground-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <span>Live Prompt Simulator</span>
                </div>
                <span className="badge-pill" style={{ padding: "2px 8px", fontSize: "11px", background: "var(--lime-light)", color: "var(--lime-hover)" }}>
                  ● Ready
                </span>
              </div>

              <div className="playground-body">
                {/* Preset Chips */}
                <div className="playground-prompt-box">
                  <div className="prompt-label">
                    <span>Input Brief</span>
                    <span style={{ color: "var(--blue)" }}>Click to simulate ▾</span>
                  </div>
                  <div className="prompt-input-text">
                    "{activePrompt.prompt}"
                  </div>
                  <div className="prompt-chips">
                    {PRESET_PROMPTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`prompt-chip ${p.id === selectedPromptId ? "active" : ""}`}
                        onClick={() => setSelectedPromptId(p.id)}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel Selector Tabs */}
                <div className="playground-tabs">
                  <button
                    type="button"
                    className={`tab-btn tab-blog ${activeTab === "blog" ? "active" : ""}`}
                    onClick={() => setActiveTab("blog")}
                  >
                    📝 Blog
                  </button>
                  <button
                    type="button"
                    className={`tab-btn tab-image ${activeTab === "image" ? "active" : ""}`}
                    onClick={() => setActiveTab("image")}
                  >
                    🎨 Image
                  </button>
                  <button
                    type="button"
                    className={`tab-btn tab-video ${activeTab === "video" ? "active" : ""}`}
                    onClick={() => setActiveTab("video")}
                  >
                    🎬 Video
                  </button>
                  <button
                    type="button"
                    className={`tab-btn tab-whatsapp ${activeTab === "whatsapp" ? "active" : ""}`}
                    onClick={() => setActiveTab("whatsapp")}
                  >
                    💬 WhatsApp
                  </button>
                </div>

                {/* Output Preview */}
                <div className="playground-preview-window">
                  <span className={`output-tag tag-${activeTab}`}>
                    {activeTab.toUpperCase()} OUTPUT GENERATED
                  </span>
                  <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--ink)" }}>
                    {activeOutput.title}
                  </h4>
                  <p style={{ color: "var(--ink-soft)", fontSize: "13.5px", lineHeight: "1.55", marginBottom: "12px" }}>
                    {activeOutput.snippet}
                  </p>
                  <div style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--text-muted)", borderTop: "1px dashed var(--grey-dark)", paddingTop: "8px" }}>
                    ⚡ {activeOutput.meta}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS PROOF STRIP
          ============================================================ */}
      <section className="stats-strip">
        <div className="shell">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10x</div>
              <div className="stat-label">Faster Production</div>
              <div className="stat-sub">From brief to 4 finished channels</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">4-in-1</div>
              <div className="stat-label">Channels Synchronized</div>
              <div className="stat-sub">Zero manual copy-pasting</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50k+</div>
              <div className="stat-label">Generated Assets</div>
              <div className="stat-sub">Used across active campaigns</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Workflow Uptime</div>
              <div className="stat-sub">Enterprise-grade reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MULTI-CHANNEL FEATURE SHOWCASE (4 CHANNELS)
          ============================================================ */}
      <section className="sec" style={{ background: "var(--paper-soft)" }}>
        <div className="shell">
          <div className="sec-head center">
            <div className="badge-pill" style={{ background: "var(--yellow)" }}>
              <span>Multi-Channel Studio</span>
            </div>
            <h2>Four outputs. One unified workspace.</h2>
            <p>
              Stop juggling 5 disconnected tools. Onefeed orchestrates your entire content pipeline from a single command center.
            </p>
          </div>

          <div className="channel-grid">
            {/* Channel 1: Blog */}
            <div className="channel-card card-blog">
              <div className="channel-card-head">
                <div className="channel-title">
                  <span>📝</span>
                  <span>Long-Form SEO Blog</span>
                </div>
                <span className="channel-badge">Editorial Grade</span>
              </div>
              <div className="channel-card-body">
                <p>
                  Generate comprehensive, human-sounding articles complete with outline headings, key takeaways, SEO meta descriptions, and custom tone control.
                </p>
                <ul className="channel-feature-list">
                  <li><span className="check-icon">✓</span> Deep semantic keyword integration</li>
                  <li><span className="check-icon">✓</span> Automatic Table of Contents &amp; Anchor links</li>
                  <li><span className="check-icon">✓</span> Ready for WordPress, Webflow, and Supabase</li>
                </ul>
                <div className="channel-mockup">
                  <strong>Preview:</strong> <em>"How AI is Revolutionizing Content Creation in 2025"</em> (1,850 words • 8 min read)
                </div>
              </div>
            </div>

            {/* Channel 2: Image */}
            <div className="channel-card card-image">
              <div className="channel-card-head">
                <div className="channel-title">
                  <span>🎨</span>
                  <span>On-Brand Campaign Visuals</span>
                </div>
                <span className="channel-badge">Multi-Ratio</span>
              </div>
              <div className="channel-card-body">
                <p>
                  Create high-impact visuals tailored for landscape web headers, square Instagram feeds, and vertical story layouts simultaneously.
                </p>
                <ul className="channel-feature-list">
                  <li><span className="check-icon">✓</span> 1:1 Square, 16:9 Landscape, 9:16 Vertical</li>
                  <li><span className="check-icon">✓</span> Consistent color harmonizing with your brand</li>
                  <li><span className="check-icon">✓</span> Ultra-sharp HD resolution ready to download</li>
                </ul>
                <div className="channel-mockup">
                  <strong>Preview:</strong> <em>3D isometric campaign graphics with dynamic lighting &amp; typography</em>
                </div>
              </div>
            </div>

            {/* Channel 3: Video */}
            <div className="channel-card card-video">
              <div className="channel-card-head">
                <div className="channel-title">
                  <span>🎬</span>
                  <span>Short-Form Video Scripts</span>
                </div>
                <span className="channel-badge">Viral Hooks</span>
              </div>
              <div className="channel-card-body">
                <p>
                  Turn your brief into high-retention video storyboards with 3-second scroll-stopping hooks, visual cues, and timed voiceover narration.
                </p>
                <ul className="channel-feature-list">
                  <li><span className="check-icon">✓</span> Optimized for TikTok, Instagram Reels, and YT Shorts</li>
                  <li><span className="check-icon">✓</span> B-roll and footage direction markers</li>
                  <li><span className="check-icon">✓</span> Voiceover audio script with pacing markers</li>
                </ul>
                <div className="channel-mockup">
                  <strong>Preview:</strong> <em>[0-3s] Hook → [4-15s] Solution Demo → [16-20s] Final CTA</em>
                </div>
              </div>
            </div>

            {/* Channel 4: WhatsApp */}
            <div className="channel-card card-whatsapp">
              <div className="channel-card-head">
                <div className="channel-title">
                  <span>💬</span>
                  <span>WhatsApp &amp; Direct Broadcasts</span>
                </div>
                <span className="channel-badge">High Open Rate</span>
              </div>
              <div className="channel-card-body">
                <p>
                  High-converting direct response messages formatted with bold highlights, bullet markers, emojis, and tracked call-to-action links.
                </p>
                <ul className="channel-feature-list">
                  <li><span className="check-icon">✓</span> WhatsApp markdown formatted (*bold*, _italic_)</li>
                  <li><span className="check-icon">✓</span> Segmented for VIP customers, leads, or communities</li>
                  <li><span className="check-icon">✓</span> Instant copy button for zero-delay sending</li>
                </ul>
                <div className="channel-mockup">
                  <strong>Preview:</strong> <em>⚡ Exclusive VIP flash drop announcement with instant tap-to-claim link</em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          WORKFLOW PIPELINE ("How It Works")
          ============================================================ */}
      <section className="sec">
        <div className="shell">
          <div className="sec-head center">
            <div className="badge-pill" style={{ background: "var(--blue-light)", color: "var(--blue-hover)" }}>
              <span>Autonomous Workflow</span>
            </div>
            <h2>How the engine turns 1 into 4</h2>
            <p>From a casual thought to four ready-to-publish assets in under 30 seconds.</p>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-step">
              <div className="step-badge">1</div>
              <span className="step-pill">Input Stage</span>
              <h3>Submit a Brief in Plain English</h3>
              <p>
                Type a campaign goal, product update, or paste raw notes in the Onefeed studio chat. No complex prompt engineering required.
              </p>
            </div>

            <div className="pipeline-step">
              <div className="step-badge">2</div>
              <span className="step-pill">AI Orchestration</span>
              <h3>Multimodal Agents Run in Parallel</h3>
              <p>
                Autonomous workflows process your request simultaneously: copywriters craft the blog, vision engines render images, and scriptwriters structure the video.
              </p>
            </div>

            <div className="pipeline-step">
              <div className="step-badge">3</div>
              <span className="step-pill">Publishing Control</span>
              <h3>Review, Polish &amp; Ship</h3>
              <p>
                Everything lands neatly in your color-coded dashboard. Review each asset, make any quick adjustments, and push to live channels with total confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMPARISON: OLD MANUAL WAY VS ONEFEED
          ============================================================ */}
      <section className="sec" style={{ background: "var(--paper-soft)" }}>
        <div className="shell">
          <div className="sec-head center">
            <div className="badge-pill" style={{ background: "var(--lime-light)", color: "var(--lime-hover)" }}>
              <span>Efficiency Comparison</span>
            </div>
            <h2>Why modern teams switch to Onefeed</h2>
            <p>See how traditional marketing workflows compare to the Onefeed engine.</p>
          </div>

          <div className="comparison-grid">
            {/* Old Way */}
            <div className="comp-card old">
              <div className="comp-card-head">
                <span style={{ fontSize: "24px" }}>❌</span>
                <h3>The Disconnected Way</h3>
              </div>
              <ul className="comp-list">
                <li>
                  <span className="comp-icon">⚠️</span>
                  <span>Writing separate briefs for writers, designers, and video editors (3–5 days delay).</span>
                </li>
                <li>
                  <span className="comp-icon">⚠️</span>
                  <span>Inconsistent messaging across blog, social channels, and WhatsApp.</span>
                </li>
                <li>
                  <span className="comp-icon">⚠️</span>
                  <span>Switching between 6 different SaaS subscriptions and logins.</span>
                </li>
                <li>
                  <span className="comp-icon">⚠️</span>
                  <span>Endless Slack feedback threads and lost file versions.</span>
                </li>
              </ul>
            </div>

            {/* Onefeed Way */}
            <div className="comp-card onefeed">
              <div className="comp-card-head">
                <span style={{ fontSize: "24px" }}>⚡</span>
                <h3>The Onefeed Advantage</h3>
              </div>
              <ul className="comp-list">
                <li>
                  <span className="comp-icon">✅</span>
                  <span><strong>1 single brief</strong> produces all 4 channel assets in under 30 seconds.</span>
                </li>
                <li>
                  <span className="comp-icon">✅</span>
                  <span><strong>100% Brand Consistency:</strong> All outputs inherit identical campaign DNA.</span>
                </li>
                <li>
                  <span className="comp-icon">✅</span>
                  <span><strong>Unified Dashboard:</strong> Review, edit, and manage all formats in one place.</span>
                </li>
                <li>
                  <span className="comp-icon">✅</span>
                  <span><strong>Massive Cost &amp; Time Savings:</strong> Move from idea to launch on the same day.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          INTERACTIVE FAQ ACCORDION
          ============================================================ */}
      <section className="sec">
        <div className="shell">
          <div className="sec-head center">
            <div className="badge-pill" style={{ background: "var(--yellow)" }}>
              <span>Frequently Asked Questions</span>
            </div>
            <h2>Got questions? We've got answers.</h2>
            <p>Everything you need to know about getting started with Onefeed.</p>
          </div>

          <div className="faq-grid">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          HIGH-IMPACT CLOSER CTA
          ============================================================ */}
      <section className="closer-v2">
        <div className="shell">
          <div className="badge-pill" style={{ background: "#ffffff", color: "#000000" }}>
            <span>⚡ Instant Launch Ready</span>
          </div>
          <h2>Ready to revolutionize your marketing engine?</h2>
          <p>
            Open the studio dashboard, write a single prompt, and watch four high-impact channel assets generate in real-time.
          </p>
          <div className="closer-v2-actions">
            <Link to="/dashboard" className="btn btn-yellow btn-lg">
              <span>Open Studio Dashboard</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link to="/blog" className="btn btn-outline btn-lg" style={{ color: "#000" }}>
              <span>Read Case Studies</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

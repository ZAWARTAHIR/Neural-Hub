import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="about-hero">
        <div className="shell">
          <div className="about-hero-content">
            <div className="badge-pill yellow">
              <span>🚀 Our Mission &amp; Vision</span>
            </div>
            <h1>The Autonomous Multi-Channel Content Platform</h1>
            <p className="lead-p">
              Onefeed was engineered to eliminate marketing fragmentation. We believe modern growth teams should spend their time strategizing and connecting with customers — not endlessly copy-pasting and formatting content across disparate software tools.
            </p>
          </div>
        </div>
      </section>

      {/* The Origin / Problem & Solution */}
      <section className="sec">
        <div className="shell">
          <div className="sec-head">
            <div className="badge-pill blue">
              <span>Why We Built Onefeed</span>
            </div>
            <h2>From 5 disconnected tabs to 1 unified command center</h2>
            <p>
              Traditional content operations are fundamentally broken. A single campaign brief used to require separate workflows for SEO writers, graphic designers, video editors, and social managers — creating bottlenecks, mixed messaging, and days of lag time.
            </p>
          </div>

          <div className="about-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">🧠</div>
              <h3>1. Central Prompt Intelligence</h3>
              <p>
                A single brief captures your target audience, core message, value proposition, and campaign tone. No repetitive briefing meetings or lost context.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">⚡</div>
              <h3>2. Parallel Multimodal Generation</h3>
              <p>
                Our orchestrated AI pipelines generate long-form SEO articles, high-resolution visual assets, short-form video scripts, and formatted WhatsApp broadcasts simultaneously.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">🛡️</div>
              <h3>3. Unified Editorial Review Gate</h3>
              <p>
                Human-in-the-loop control is non-negotiable. Every piece of generated media lands in a color-coded review panel where you retain 100% editorial authority.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📡</div>
              <h3>4. Multi-Channel Distribution</h3>
              <p>
                Once approved, content is ready for instant syndication across web CMS, social media feeds, video platforms, and direct messaging channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="sec" style={{ background: "var(--paper-soft)" }}>
        <div className="shell">
          <div className="sec-head">
            <div className="badge-pill green">
              <span>Core Principles</span>
            </div>
            <h2>Designed for speed, built for quality</h2>
            <p>The four foundations that guide everything we build at Onefeed.</p>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-step">
              <div className="step-badge">01</div>
              <h3>Zero Quality Compromise</h3>
              <p>
                We do not output generic spam. Every generated piece follows rigorous content structure, persuasive copywriting frameworks, and high aesthetic standards.
              </p>
            </div>

            <div className="pipeline-step">
              <div className="step-badge">02</div>
              <h3>Total Brand Consistency</h3>
              <p>
                Because all four outputs originate from the identical master prompt, your campaign voice remains perfectly aligned across every touchpoint.
              </p>
            </div>

            <div className="pipeline-step">
              <div className="step-badge">03</div>
              <h3>Empowered Creators</h3>
              <p>
                AI should not replace human creativity; it should remove tedious mechanical drudgery so marketers can focus on creative direction and high-level strategy.
              </p>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1.5px dashed var(--grey-dark)" }}>
            <h4 style={{ fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "16px" }}>
              Built With Modern Industry-Standard Architecture
            </h4>
            <div className="tech-badges-wrap">
              <span className="tech-badge">⚛️ React 18 + Vite</span>
              <span className="tech-badge">⚡ Supabase Auth &amp; Database</span>
              <span className="tech-badge">🔄 n8n Autonomous Pipelines</span>
              <span className="tech-badge">🤖 Advanced Multimodal LLMs</span>
              <span className="tech-badge">🎨 Diffusion Vision Models</span>
              <span className="tech-badge">🔒 Enterprise TLS &amp; Encryption</span>
            </div>
          </div>
        </div>
      </section>

      {/* Closer */}
      <section className="closer-v2">
        <div className="shell">
          <h2>Experience the future of content operations</h2>
          <p>
            Join forward-thinking marketing teams who produce 10x more content in half the time.
          </p>
          <div className="closer-v2-actions">
            <Link to="/dashboard" className="btn btn-yellow btn-lg">
              <span>Launch Studio Dashboard</span>
            </Link>
            <Link to="/blog" className="btn btn-outline btn-lg" style={{ color: "#000" }}>
              <span>Read Engineering Blog</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

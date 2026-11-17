import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons/Icons.jsx";
import "../../styles/campaign-studio.css";

// What the studio can produce from one prompt.
export const OUTPUTS = [
  { key: "blog", label: "Blog post", desc: "Long-form, SEO-ready article", icon: "blog", accent: "var(--amber)" },
  { key: "image", label: "Images", desc: "Campaign visuals & creatives", icon: "image", accent: "var(--coral)" },
  { key: "gif", label: "GIF", desc: "Short animated loops", icon: "gif", accent: "#e0559b" },
  { key: "video", label: "Video", desc: "Short-form video for socials", icon: "video", accent: "#8b7cf6" },
  { key: "whatsapp", label: "WhatsApp campaign", desc: "Broadcast message copy", icon: "whatsapp", accent: "#25d366" }
];

const MODES = [
  {
    key: "auto",
    label: "Auto-generate",
    desc: "Create everything right away, no stops.",
    icon: "bolt"
  },
  {
    key: "permission",
    label: "Generate with permission",
    desc: "Review and approve each output before it is created.",
    icon: "shieldCheck"
  }
];

const labelFor = (key) => OUTPUTS.find((o) => o.key === key)?.label ?? key;
let nextId = 0;
const uid = () => `m${++nextId}`;

/**
 * Campaign chat (rendered full page at /dashboard/campaign). Outputs (blog /
 * image / GIF / video / WhatsApp) and the generation mode are chosen in the
 * composer; sending produces the request. `onGenerate` gets { prompt, outputs, mode }.
 */
export default function CampaignStudio({ onGenerate, onClose, className = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState([]); // outputs chosen in the composer
  const [mode, setMode] = useState("permission"); // generation mode chosen in the composer
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to the newest message only when one is added.
  useEffect(() => {
    const list = listRef.current;
    if (list && messages.length) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  const allSelected = selected.length === OUTPUTS.length;
  const canSend = Boolean(input.trim()) && selected.length > 0;

  function toggleOutput(key) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : OUTPUTS.map((o) => o.key));
  }

  function send() {
    const text = input.trim();
    if (!text || selected.length === 0) return;
    const outputs = OUTPUTS.map((o) => o.key).filter((k) => selected.includes(k));
    const request = { prompt: text, outputs, mode };
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "user", type: "text", text, outputs, mode },
      { id: uid(), role: "assistant", type: "plan", request }
    ]);
    onGenerate?.(request);
  }

  return (
    <section className={`cs ${className}`} aria-label="Campaign studio">
      <header className="cs-head">
        <span className="cs-avatar" aria-hidden="true"><Icon name="bot" size={22} strokeWidth={1.8} /></span>
        <div className="cs-head-text">
          <div className="cs-title">
            Onefeed AI
            <span className="cs-badge"><Icon name="sparkle" size={11} strokeWidth={2.4} />AI</span>
          </div>
          <p>One prompt. Blog, images, GIFs, video and WhatsApp, all generated for you.</p>
        </div>
        {onClose && (
          <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Close" title="Close">
            <Icon name="close" size={18} />
          </button>
        )}
      </header>

      <div className="cs-thread" ref={listRef}>
        <div className="cs-row cs-row-ai">
          <span className="cs-mini-avatar" aria-hidden="true"><Icon name="bot" size={15} strokeWidth={2} /></span>
          <div className="cs-intro">
            <p>
              Hi, I&rsquo;m your AI content assistant. Describe your campaign in one
              message and I&rsquo;ll turn it into everything you need.
            </p>
          </div>
        </div>

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="cs-row cs-row-user">
                <div className="cs-user">
                  <div className="cs-bubble">{m.text}</div>
                  <OutputTags outputs={m.outputs} mode={m.mode} />
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="cs-row cs-row-ai">
              <span className="cs-mini-avatar" aria-hidden="true"><Icon name="bot" size={15} strokeWidth={2} /></span>
              <PlanSummary request={m.request} />
            </div>
          );
        })}
      </div>

      <form
        className="app-composer cs-composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="cs-outputs" role="group" aria-label="What to generate">
          <span className="cs-outputs-label">Generate</span>
          {OUTPUTS.map((o) => {
            const on = selected.includes(o.key);
            return (
              <button
                key={o.key}
                type="button"
                className={`cs-chip ${on ? "is-on" : ""}`}
                onClick={() => toggleOutput(o.key)}
                aria-pressed={on}
                title={o.desc}
              >
                <span className="cs-checkbox" aria-hidden="true">{on && <Icon name="check" size={11} strokeWidth={3} />}</span>
                {o.label}
              </button>
            );
          })}
          <button
            type="button"
            className={`cs-chip cs-chip-all ${allSelected ? "is-on" : ""}`}
            onClick={toggleAll}
            aria-pressed={allSelected}
          >
            <span className="cs-checkbox" aria-hidden="true">{allSelected && <Icon name="check" size={11} strokeWidth={3} />}</span>
            Select all
          </button>
        </div>

        <textarea
          ref={inputRef}
          value={input}
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Describe your campaign, e.g. “Launch our summer sale, 40% off, friendly tone”"
        />
        <div className="app-composer-bar cs-composer-bar">
          <div className="cs-mode-switch" role="radiogroup" aria-label="Generation mode">
            {MODES.map((md) => (
              <button
                key={md.key}
                type="button"
                role="radio"
                aria-checked={mode === md.key}
                className={`cs-mode-opt ${mode === md.key ? "is-on" : ""}`}
                onClick={() => setMode(md.key)}
                title={md.desc}
              >
                <Icon name={md.icon} size={14} strokeWidth={2} />
                <span>{md.label}</span>
              </button>
            ))}
          </div>
          <span className="app-composer-hint cs-hint">
            {selected.length === 0 ? "Select at least one output" : "Enter to send"}
          </span>
          <button type="submit" className="app-send-btn" disabled={!canSend} aria-label="Send" title="Send">
            <Icon name="arrowUp" size={18} strokeWidth={2.2} />
          </button>
        </div>
      </form>
    </section>
  );
}

function OutputTags({ outputs, mode }) {
  const md = MODES.find((x) => x.key === mode);
  return (
    <div className="cs-plan-tags cs-user-tags">
      {outputs.map((k) => {
        const o = OUTPUTS.find((x) => x.key === k);
        return (
          <span key={k}>
            <Icon name={o.icon} size={13} strokeWidth={2} />
            {o.label}
          </span>
        );
      })}
      {md && (
        <span className="cs-user-mode">
          <Icon name={md.icon} size={13} strokeWidth={2} />
          {md.label}
        </span>
      )}
    </div>
  );
}

function PlanSummary({ request }) {
  const auto = request.mode === "auto";
  return (
    <div className="cs-plan">
      <div className="cs-plan-head">
        <span className="cs-plan-check"><Icon name="check" size={14} strokeWidth={3} /></span>
        <strong>Campaign request ready</strong>
      </div>
      <dl>
        <div>
          <dt>Generating</dt>
          <dd className="cs-plan-tags">
            {request.outputs.map((k) => {
              const o = OUTPUTS.find((x) => x.key === k);
              return (
                <span key={k}>
                  <Icon name={o.icon} size={13} strokeWidth={2} />
                  {labelFor(k)}
                </span>
              );
            })}
          </dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{auto ? "Auto-generate" : "Generate with permission"}</dd>
        </div>
      </dl>
      <p className="cs-plan-note">
        {auto
          ? "Everything selected will be created in one go."
          : "You'll be asked to approve each output before it's created."}
      </p>
    </div>
  );
}

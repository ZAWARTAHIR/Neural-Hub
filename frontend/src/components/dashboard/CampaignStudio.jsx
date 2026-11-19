import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../icons/Icons.jsx";
import { triggerCampaign, resumeCampaign, campaignReplyText } from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import {
  loadCampaigns,
  loadThreads,
  insertCampaign,
  updateCampaign,
  fetchCampaignState,
  isMissingTable
} from "../../lib/campaigns.js";
import "../../styles/campaign-studio.css";

// Fallback n8n session id when nobody is signed in.
const TAB_SESSION_ID = `campaign-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const newId = () =>
  crypto.randomUUID?.() ??
  "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );

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

// States where this page is waiting on n8n.
const IN_FLIGHT = new Set(["sending", "generating", "cancelling"]);
// How often the chat reads n8n's progress from the campaign row.
const POLL_MS = 3000;
// A saved in-flight campaign with no progress for this long is treated as dead.
const STALE_MS = 20 * 60 * 1000;

// Decides how a campaign saved in the database is shown after a reload.
function restoreStatus(c) {
  if (c.status === "sent") return "unknown"; // older rows: n8n replied without a result
  if (!IN_FLIGHT.has(c.status)) return c.status;
  // Prompts for review only reach the browser that sent the request.
  if (c.status === "sending" && c.mode === "permission") return "interrupted";
  if (c.status === "cancelling") return "cancelled";
  const age = Date.now() - new Date(c.updatedAt || c.createdAt || 0).getTime();
  // Still running: keep polling, n8n saves the progress and the final result.
  return age < STALE_MS ? c.status : "interrupted";
}

/**
 * Campaign chat (rendered full page at /dashboard/campaign). Outputs (blog /
 * image / GIF / video / WhatsApp) and the generation mode are chosen in the
 * composer; sending produces the request. `onGenerate` gets { prompt, outputs, mode }.
 */
export default function CampaignStudio({ onGenerate, onClose, onOpenSidebar, className = "" }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [campaigns, setCampaigns] = useState([]);
  const [historyNote, setHistoryNote] = useState("");
  // Current chat thread. Saved chats are opened with ?chat=<id>; a new chat
  // gets a fresh id that goes into the URL once its first message is sent.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlChat = searchParams.get("chat");
  const [threadId, setThreadId] = useState(() => urlChat || newId());
  const [threads, setThreads] = useState([]);
  const [threadsSupported, setThreadsSupported] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState([]); // outputs chosen in the composer
  const [mode, setMode] = useState("permission"); // generation mode chosen in the composer
  const listRef = useRef(null);
  const inputRef = useRef(null);
  // id -> promise of the row insert, so updates never run before the row exists.
  const inserts = useRef({});
  // Chats started with "New chat" in this tab: nothing is saved for them yet,
  // so they open empty without asking the database.
  const freshThreads = useRef(new Set());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Browser back/forward or a ?chat= link switches the open chat.
  useEffect(() => {
    if (urlChat && urlChat !== threadId) setThreadId(urlChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlChat]);

  // Load the open chat's campaigns from Supabase.
  useEffect(() => {
    let active = true;
    setCampaigns([]);
    setHistoryNote("");
    if (!userId || freshThreads.current.has(threadId)) return undefined;
    loadCampaigns(userId, threadId).then(({ campaigns: saved, threads: supported, error }) => {
      if (!active) return;
      setThreadsSupported(supported);
      if (!supported) {
        setHistoryNote("Separate chats are off until supabase/campaign-chats.sql is run in Supabase.");
      }
      if (error) {
        console.error("Could not load campaigns", error);
        setHistoryNote(
          isMissingTable(error)
            ? "Chat history is off: the campaigns table is missing. Run supabase/campaigns.sql in Supabase."
            : "Could not load your previous campaigns."
        );
        return;
      }
      setCampaigns((current) => [
        ...saved.map((c) => ({ ...c, status: restoreStatus(c) })),
        ...current.filter((c) => !saved.some((s) => s.id === c.id))
      ]);
    });
    return () => {
      active = false;
    };
  }, [userId, threadId]);

  async function refreshThreads() {
    if (!userId) return;
    setHistoryLoading(true);
    const { threads: list, supported, error } = await loadThreads(userId);
    setHistoryLoading(false);
    setThreadsSupported(supported);
    if (error) console.error("Could not load chat history", error);
    setThreads(list);
  }

  function toggleHistory() {
    if (!historyOpen) refreshThreads();
    setHistoryOpen((v) => !v);
  }

  function startNewChat() {
    const id = newId();
    freshThreads.current.add(id);
    setThreadId(id);
    setSearchParams({}, { replace: false });
    setHistoryOpen(false);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function openThread(id) {
    setHistoryOpen(false);
    if (id === threadId) return;
    setThreadId(id);
    setSearchParams({ chat: id });
  }

  // Esc closes the history panel.
  useEffect(() => {
    if (!historyOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setHistoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [historyOpen]);

  // While n8n works, read the progress (and final result) it writes to the
  // campaign row. Only updates the screen; the row is already up to date.
  const campaignsRef = useRef(campaigns);
  campaignsRef.current = campaigns;
  const hasInFlight = campaigns.some((c) => c.status === "sending" || c.status === "generating");

  useEffect(() => {
    if (!userId || !hasInFlight) return undefined;
    let cancelled = false;
    async function poll() {
      const live = campaignsRef.current.filter((c) => c.status === "sending" || c.status === "generating");
      const states = await Promise.all(live.map((c) => fetchCampaignState(c.id).then((st) => [c.id, st])));
      if (cancelled) return;
      setCampaigns((prev) =>
        prev.map((c) => {
          const st = states.find(([id]) => id === c.id)?.[1];
          if (!st || !IN_FLIGHT.has(c.status)) return c;
          const next = { ...c, progress: st.progress || c.progress };
          // n8n saved the final result (e.g. this tab was reloaded mid-run).
          if (st.status === "done" && st.result) Object.assign(next, { status: "done", result: st.result, reply: "" });
          if (st.status === "cancelled") next.status = "cancelled";
          return next;
        })
      );
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId, hasInFlight]);

  // Scroll to the newest campaign when one is added (or history loads).
  useEffect(() => {
    const list = listRef.current;
    if (list && campaigns.length) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [campaigns.length]);

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
    setInput("");
    submit({ prompt: text, outputs, mode });
  }

  // Sends one campaign request (new message or "Try again").
  function submit(request) {
    const planId = newId();
    const campaign = {
      id: planId,
      threadId,
      ...request,
      status: "sending",
      reply: "",
      review: null,
      result: null,
      startedAt: Date.now()
    };
    setCampaigns((prev) => [...prev, campaign]);
    onGenerate?.(request);
    // The chat now has saved campaigns, so reopening it must load them.
    freshThreads.current.delete(threadId);
    // First message of a new chat: put it in the URL so a reload reopens it.
    if (urlChat !== threadId) setSearchParams({ chat: threadId }, { replace: true });

    if (userId) {
      inserts.current[planId] = insertCampaign(userId, campaign).then(({ error }) => {
        if (error) {
          console.error("Could not save campaign", error);
          setHistoryNote(
            isMissingTable(error)
              ? "Chat history is off: the campaigns table is missing. Run supabase/campaigns.sql in Supabase."
              : "This campaign could not be saved to your history."
          );
        }
        return !error;
      });
    }

    const sessionId = userId ? `onefeed-${userId}` : TAB_SESSION_ID;
    triggerCampaign({ ...request, campaignId: planId, userId: userId ?? null, sessionId, sentAt: new Date().toISOString() })
      .then((data) => applyResponse(planId, data))
      .catch((err) => {
        console.error("Campaign webhook failed", err);
        patchMessage(planId, {
          status: "error",
          reply:
            err?.response?.status === 404
              ? "n8n webhook not listening. In n8n click “Listen for test event” (or activate the workflow) and try again."
              : "Could not reach the n8n campaign webhook. Check that n8n is running."
        });
      });
  }

  // Updates the card on screen and saves the change to Supabase.
  function patchMessage(id, patch) {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    const inserted = inserts.current[id] ?? (userId ? Promise.resolve(true) : null);
    inserted?.then((ok) => {
      if (!ok) return;
      updateCampaign(id, patch).then(({ error }) => {
        if (error) console.error("Could not update campaign", error);
      });
    });
  }

  // Routes an n8n response to the right card state.
  function applyResponse(id, data) {
    if (data?.status === "awaiting_approval" && data.resumeUrl) {
      patchMessage(id, { status: "review", review: data, reply: "" });
    } else if (data?.status === "completed") {
      patchMessage(id, { status: "done", result: data, reply: "" });
    } else if (data?.status === "cancelled") {
      patchMessage(id, { status: "cancelled", reply: "" });
    } else {
      // Anything else means n8n stopped without reaching "Send Final Result"
      // (usually a failed node), so don't present it as a success.
      const text = campaignReplyText(data);
      patchMessage(id, {
        status: "unknown",
        reply: text && !/^\s*$/.test(text) ? `n8n said: ${text}` : ""
      });
    }
  }

  function approve(id, review, steps) {
    patchMessage(id, {
      status: "generating",
      startedAt: Date.now(),
      progress: {},
      working: steps.filter((s) => s.approved).map((s) => s.type)
    });
    resumeCampaign(review.resumeUrl, {
      action: "approve",
      steps: steps.map((s) => ({
        type: s.type,
        approved: s.approved,
        prompts: s.prompts.map(({ key, text }) => ({ key, text }))
      }))
    })
      .then((data) => applyResponse(id, data))
      .catch((err) => {
        console.error("Campaign approval failed", err);
        const detail = campaignReplyText(err?.response?.data);
        patchMessage(id, {
          status: "error",
          reply: err?.response
            ? `n8n stopped with an error while generating${detail ? `: ${detail}` : ""}. Open execution ${review.executionId ?? ""} in n8n to see which step failed.`
            : "Could not reach n8n to resume the campaign. Check that n8n is running."
        });
      });
  }

  function cancel(id, review) {
    patchMessage(id, { status: "cancelling" });
    resumeCampaign(review.resumeUrl, { action: "cancel", approved: false })
      .catch(() => {})
      .finally(() => patchMessage(id, { status: "cancelled" }));
  }

  return (
    <section className={`cs ${className}`} aria-label="Campaign studio">
      <header className="cs-head">
        {onOpenSidebar && (
          <button type="button" className="app-icon-btn" onClick={onOpenSidebar} aria-label="Open sidebar" title="Open sidebar">
            <Icon name="menu" size={20} />
          </button>
        )}
        <span className="cs-avatar" aria-hidden="true"><Icon name="bot" size={22} strokeWidth={1.8} /></span>
        <div className="cs-head-text">
          <div className="cs-title">
            Onefeed AI
            <span className="cs-badge"><Icon name="sparkle" size={11} strokeWidth={2.4} />AI</span>
          </div>
          <p>One prompt. Blog, images, GIFs, video and WhatsApp, all generated for you.</p>
        </div>
        {userId && (
          <div className="cs-head-actions">
            <button
              type="button"
              className={`cs-head-btn ${historyOpen ? "is-on" : ""}`}
              onClick={toggleHistory}
              aria-expanded={historyOpen}
              title="Chat history"
            >
              <Icon name="history" size={16} strokeWidth={2} />
              <span>History</span>
            </button>
            <button type="button" className="cs-head-btn" onClick={startNewChat} title="Start a new chat">
              <Icon name="plus" size={16} strokeWidth={2.2} />
              <span>New chat</span>
            </button>
          </div>
        )}
        {onClose && (
          <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Close" title="Close">
            <Icon name="close" size={18} />
          </button>
        )}
      </header>

      <div className="cs-main">
      {historyOpen && (
        <HistoryPanel
          threads={threads}
          loading={historyLoading}
          supported={threadsSupported}
          currentId={threadId}
          onOpen={openThread}
          onNew={startNewChat}
          onClose={() => setHistoryOpen(false)}
        />
      )}
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

        {historyNote && <p className="cs-history-note">{historyNote}</p>}

        {campaigns.map((c) => (
          <div key={c.id} className="cs-campaign">
            <div className="cs-row cs-row-user">
              <div className="cs-user">
                <div className="cs-bubble">{c.prompt}</div>
                <OutputTags outputs={c.outputs} mode={c.mode} />
              </div>
            </div>
            <div className="cs-row cs-row-ai">
              <span className="cs-mini-avatar" aria-hidden="true"><Icon name="bot" size={15} strokeWidth={2} /></span>
              <PlanSummary
                message={c}
                onApprove={(steps) => approve(c.id, c.review, steps)}
                onCancel={() => cancel(c.id, c.review)}
                onRetry={() => submit({ prompt: c.prompt, outputs: c.outputs, mode: c.mode })}
              />
            </div>
          </div>
        ))}
      </div>

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

function formatWhen(value) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date(today.getTime() - 86400000).toDateString() === d.toDateString();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Previous chats; each one is a thread of campaigns.
function HistoryPanel({ threads, loading, supported, currentId, onOpen, onNew, onClose }) {
  return (
    <div className="cs-history" role="dialog" aria-label="Chat history">
      <div className="cs-history-head">
        <strong>Chat history</strong>
        <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Close history" title="Close">
          <Icon name="close" size={16} />
        </button>
      </div>
      <button type="button" className="cs-history-new" onClick={onNew}>
        <Icon name="plus" size={15} strokeWidth={2.2} />
        New chat
      </button>
      {!supported ? (
        <p className="cs-history-empty">Run supabase/campaign-chats.sql in Supabase to keep separate chats.</p>
      ) : loading && threads.length === 0 ? (
        <p className="cs-history-empty">Loading…</p>
      ) : threads.length === 0 ? (
        <p className="cs-history-empty">No previous chats yet.</p>
      ) : (
        <ul>
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={t.id === currentId ? "is-current" : ""}
                onClick={() => onOpen(t.id)}
                title={t.title}
              >
                <Icon name="chat" size={15} />
                <span className="cs-history-title">{t.title}</span>
                <span className="cs-history-meta">
                  {t.count > 1 ? `${t.count} · ` : ""}
                  {formatWhen(t.lastAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const STATUS_TITLE = {
  sending: "Sending campaign to n8n…",
  sent: "Campaign sent to n8n",
  review: "Review before generating",
  generating: "Generating approved outputs…",
  cancelling: "Cancelling…",
  cancelled: "Campaign cancelled",
  done: "Campaign generated",
  interrupted: "This request didn’t finish",
  unknown: "We couldn’t generate this campaign",
  error: "We couldn’t generate this campaign"
};

// Dashboard page where each output type is listed.
const OUTPUT_PAGES = {
  blog: "/dashboard/blog",
  image: "/dashboard/image",
  gif: "/dashboard/gif",
  video: "/dashboard/video",
  whatsapp: "/dashboard/whatsapp"
};

function OutputLinks({ outputs }) {
  return (
    <div className="cs-plan-links">
      {outputs.map((k) => (
        <Link key={k} to={OUTPUT_PAGES[k]}>
          Open {labelFor(k)} page <Icon name="arrowRight" size={13} strokeWidth={2.2} />
        </Link>
      ))}
    </div>
  );
}

const BUSY = new Set(["sending", "generating", "cancelling"]);
const FAILED = new Set(["error", "unknown", "interrupted"]);

const listText = (keys) => {
  const names = keys.map(labelFor);
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
};

// Shown when a campaign didn't complete. Uses n8n's progress reports to tell
// apart outputs that were still created from the ones that failed.
function FailurePanel({ message, request, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const progress = message.progress || {};
  const finished = request.outputs.filter((k) => progress[k]?.state === "done");
  const failed = request.outputs.filter((k) => !finished.includes(k));
  const interrupted = message.status === "interrupted";

  let text;
  if (interrupted) {
    text = "The page was closed before this request was ready, so it couldn’t continue. Nothing was published.";
  } else if (finished.length > 0) {
    text = `${listText(finished)} ${finished.length === 1 ? "was" : "were"} created, but ${listText(failed)} couldn’t be generated because of a problem on our side.`;
  } else {
    text = `Something went wrong while creating your ${listText(failed)}. Nothing was published, so you can safely try again.`;
  }

  return (
    <div className="cs-fail">
      <p className="cs-fail-text">{text}</p>
      {finished.length > 0 && <OutputLinks outputs={finished} />}
      <div className="cs-fail-actions">
        <button type="button" className="cs-btn cs-btn-primary" onClick={onRetry}>
          <Icon name="refresh" size={14} strokeWidth={2.4} />
          {failed.length < request.outputs.length ? "Try again for everything" : "Try again"}
        </button>
        {message.reply && (
          <button type="button" className="cs-fail-details-btn" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
            {showDetails ? "Hide details" : "Show details"}
          </button>
        )}
      </div>
      {showDetails && message.reply && <p className="cs-fail-details">{message.reply}</p>}
      <p className="cs-fail-hint">If this keeps happening, check that the n8n workflow is running.</p>
    </div>
  );
}

function PlanSummary({ message, onApprove, onCancel, onRetry }) {
  const { status = "sent", reply, review, result } = message;
  const request = message.request ?? message;
  const auto = request.mode === "auto";
  const failedState = FAILED.has(status);
  const icon =
    failedState || status === "cancelled" ? "close" : status === "review" ? "shieldCheck" : "check";

  return (
    <div className={`cs-plan cs-plan-${status} ${BUSY.has(status) ? "is-busy" : ""} ${failedState ? "is-failed" : ""}`}>
      <div className="cs-plan-head">
        <span className="cs-plan-check">
          <Icon name={icon} size={14} strokeWidth={3} />
        </span>
        <strong>{STATUS_TITLE[status] ?? STATUS_TITLE.sent}</strong>
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

      {status === "sending" && (
        <GenerationProgress
          outputs={request.outputs}
          startedAt={message.startedAt}
          progress={message.progress}
          phase={auto ? "generate" : "prompts"}
        />
      )}
      {status === "generating" && (
        <GenerationProgress
          outputs={message.working?.length ? message.working : request.outputs}
          startedAt={message.startedAt}
          progress={message.progress}
          phase="generate"
        />
      )}
      {failedState && <FailurePanel message={message} request={request} onRetry={onRetry} />}

      {(status === "review" || status === "cancelling") && review && (
        <ReviewPanel review={review} busy={status === "cancelling"} onApprove={onApprove} onCancel={onCancel} />
      )}

      {status === "done" && result && <CampaignResults result={result} />}

      {reply && !failedState && <p className="cs-plan-reply">{reply}</p>}
    </div>
  );
}

// What n8n is doing for each output, shown while the request is open.
const WORK_TEXT = {
  prompts: {
    blog: "Writing the blog brief",
    image: "Writing the image prompt",
    gif: "Writing the GIF prompt",
    video: "Planning 4 video scenes",
    whatsapp: "Writing the WhatsApp brief"
  },
  generate: {
    blog: "Writing the article and saving it",
    image: "Rendering the image and uploading it",
    gif: "Rendering the clip and converting it to GIF",
    video: "Rendering 4 scenes and stitching the video",
    whatsapp: "Writing the broadcast message"
  }
};

function useElapsed(startedAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!startedAt) return null;
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

// Per-output state from n8n's progress reports (campaigns.progress), or a
// generic "working" line until the first report arrives.
function outputState(k, phase, progress = {}) {
  if (phase === "prompts") {
    const p = progress.prompts;
    const ready = Boolean(p?.steps?.[k]);
    return { label: ready ? "Prompt ready" : WORK_TEXT.prompts[k], done: ready ? 1 : 0, total: 1, finished: ready, live: Boolean(p) };
  }
  const p = progress[k];
  if (!p) return { label: WORK_TEXT.generate[k], done: 0, total: 0, finished: false, live: false };
  const done = Object.keys(p.steps || {}).length;
  const total = p.total || 0;
  return { label: p.label, done, total, finished: p.state === "done", live: true };
}

// Live loader. n8n reports each step to the campaign row and the chat polls
// it, so every output shows what it is doing and how many steps are done.
function GenerationProgress({ outputs, startedAt, progress, phase }) {
  const elapsed = useElapsed(startedAt);
  const rows = outputs.map((k) => ({ key: k, ...outputState(k, phase, progress) }));
  const live = rows.some((r) => r.live);
  const total = rows.reduce((s, r) => s + r.total, 0);
  const done = rows.reduce((s, r) => s + Math.min(r.done, r.total), 0);
  const pct = live && total ? Math.round((done / total) * 100) : null;
  const slow = outputs.some((k) => k === "video" || k === "gif");

  return (
    <div className="cs-progress" role="status" aria-live="polite">
      <div className={`cs-progress-bar ${pct == null ? "" : "is-determinate"}`} aria-hidden="true">
        <span style={pct == null ? undefined : { width: `${Math.max(pct, 4)}%` }} />
      </div>
      <ul>
        {rows.map((r) => {
          const o = OUTPUTS.find((x) => x.key === r.key);
          return (
            <li key={r.key} className={r.finished ? "is-done" : ""}>
              {r.finished ? (
                <span className="cs-step-done" aria-hidden="true"><Icon name="check" size={10} strokeWidth={3.5} /></span>
              ) : (
                <span className="cs-spinner" aria-hidden="true" />
              )}
              {o && <Icon name={o.icon} size={14} strokeWidth={2} />}
              <strong>{labelFor(r.key)}</strong>
              <span className={`cs-progress-text ${r.finished ? "" : "is-working"}`}>{r.label ?? "Working"}</span>
              {r.total > 1 && (
                <span className="cs-step-count">
                  {Math.min(r.done, r.total)}/{r.total}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="cs-progress-foot">
        <span>
          {elapsed ? `Elapsed ${elapsed}` : "Working"}
          {pct != null ? ` · ${pct}%` : ""}
        </span>
        <span>
          {phase === "prompts"
            ? "Prompts will appear here for your approval."
            : slow
              ? "Video and GIF can take several minutes. You can reload; progress is saved."
              : "Progress is saved, you can reload this page."}
        </span>
      </p>
    </div>
  );
}

// Lets the user edit each generated prompt, skip outputs, then approve or cancel.
function ReviewPanel({ review, busy, onApprove, onCancel }) {
  const [steps, setSteps] = useState(() =>
    (review.steps || []).map((s) => ({
      ...s,
      approved: true,
      prompts: (s.prompts || []).map((p) => ({ ...p, text: p.text ?? "" }))
    }))
  );
  const anyApproved = steps.some((s) => s.approved);

  function toggleStep(i) {
    setSteps((prev) => prev.map((s, si) => (si === i ? { ...s, approved: !s.approved } : s)));
  }

  function editPrompt(i, key, text) {
    setSteps((prev) =>
      prev.map((s, si) =>
        si === i ? { ...s, prompts: s.prompts.map((p) => (p.key === key ? { ...p, text } : p)) } : s
      )
    );
  }

  return (
    <div className="cs-review">
      <p className="cs-plan-note">Check or edit the prompts below. Skip anything you don't want, then approve.</p>
      {steps.map((s, i) => {
        const o = OUTPUTS.find((x) => x.key === s.type);
        return (
          <div key={s.type} className={`cs-review-step ${s.approved ? "" : "is-off"}`}>
            <div className="cs-review-step-head">
              <span className="cs-review-step-name">
                {o && <Icon name={o.icon} size={14} strokeWidth={2} />}
                {s.label || labelFor(s.type)}
              </span>
              <button type="button" className="cs-review-toggle" onClick={() => toggleStep(i)} disabled={busy}>
                {s.approved ? "Skip" : "Include"}
              </button>
            </div>
            {s.approved &&
              s.prompts.map((p) => (
                <label key={p.key} className="cs-review-prompt">
                  <span>{p.label || p.key}</span>
                  <textarea
                    value={p.text}
                    rows={3}
                    disabled={busy}
                    onChange={(e) => editPrompt(i, p.key, e.target.value)}
                  />
                </label>
              ))}
          </div>
        );
      })}
      <div className="cs-review-actions">
        <button type="button" className="cs-btn cs-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className="cs-btn cs-btn-primary"
          onClick={() => onApprove(steps)}
          disabled={busy || !anyApproved}
        >
          <Icon name="check" size={14} strokeWidth={2.6} />
          Approve &amp; generate
        </button>
      </div>
    </div>
  );
}

// Final output from the workflow's "Build Final Result" node, as a grid of
// small preview cards (full size opens in a new tab / on the library page).
function CampaignResults({ result }) {
  const r = result.results || {};
  const skipped = result.rejected || [];
  const cards = [];

  if (r.image?.url) {
    cards.push({ key: "image", media: { type: "img", url: r.image.url }, title: "Generated image", openUrl: r.image.url });
  }
  if (r.blog) {
    // Text only: the featured image already has its own Images card, and the
    // blog page still shows it with the post.
    cards.push({ key: "blog", title: r.blog.title || "Blog post", text: r.blog.excerpt });
  }
  if (r.video?.url) {
    cards.push({ key: "video", media: { type: "video", url: r.video.url }, title: "Short-form video", openUrl: r.video.url });
  }
  if (r.gif?.url) {
    cards.push({ key: "gif", media: { type: "img", url: r.gif.url }, title: "Animated GIF", openUrl: r.gif.url });
  }
  if (r.whatsapp?.message) {
    cards.push({ key: "whatsapp", title: "Broadcast message", text: r.whatsapp.message, copy: r.whatsapp.message, quote: true });
  }

  return (
    <div className="cs-results">
      {cards.length > 0 ? (
        <div className="cs-res-grid">
          {cards.map((c) => (
            <ResultCard key={c.key} card={c} />
          ))}
        </div>
      ) : (
        <p className="cs-plan-note">The campaign finished but no files came back.</p>
      )}
      {skipped.length > 0 && <p className="cs-plan-note">Skipped: {skipped.map(labelFor).join(", ")}</p>}
    </div>
  );
}

function ResultCard({ card }) {
  const [copied, setCopied] = useState(false);
  const o = OUTPUTS.find((x) => x.key === card.key);

  async function copy() {
    try {
      await navigator.clipboard.writeText(card.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked.
    }
  }

  return (
    <article className={`cs-res-card cs-res-${card.key}`}>
      {card.media && (
        <a
          className="cs-res-media"
          href={card.openUrl || card.media.url}
          target="_blank"
          rel="noreferrer"
          title="Open full size"
        >
          {card.media.type === "video" ? (
            <video src={`${card.media.url}#t=0.1`} muted playsInline preload="metadata" />
          ) : (
            <img src={card.media.url} alt={card.title} loading="lazy" />
          )}
          {card.media.type === "video" && (
            <span className="cs-res-play" aria-hidden="true">
              <Icon name="video" size={14} strokeWidth={2.2} />
            </span>
          )}
        </a>
      )}
      <div className="cs-res-body">
        <span className="cs-res-kind">
          {o && <Icon name={o.icon} size={12} strokeWidth={2.2} />}
          {labelFor(card.key)}
        </span>
        <strong className="cs-res-title" title={card.title}>{card.title}</strong>
        {card.text && <p className={`cs-res-text ${card.quote ? "is-quote" : ""}`}>{card.text}</p>}
      </div>
      <div className="cs-res-actions">
        {card.copy && (
          <button type="button" onClick={copy}>
            <Icon name={copied ? "check" : "copy"} size={13} strokeWidth={2.2} />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
        <Link to={OUTPUT_PAGES[card.key]}>
          View in library <Icon name="arrowRight" size={13} strokeWidth={2.2} />
        </Link>
      </div>
    </article>
  );
}

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { sendAiHelperMessage } from "../../lib/api.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { BoltIcon, Icon } from "../icons/Icons.jsx";

// One n8n chat session per signed-in user (falls back to a per-browser id),
// so the agent's memory follows the conversation.
function getSessionId(user) {
  if (user?.id) return `onefeed-${user.id}`;
  const key = "onefeed-ai-helper-session";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = `onefeed-${crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `onefeed-${Date.now().toString(36)}`;
  }
}

export default function ChatPanel({ inputRef, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  // Prefilled when arriving from a "Describe your campaign" form on the marketing site.
  const [input, setInput] = useState(location.state?.prompt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const localRef = useRef(null);
  const textareaRef = inputRef || localRef;
  const listRef = useRef(null);

  useEffect(() => {
    async function loadMessages() {
      if (!supabase || !user) return;
      const { data, error: loadError } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (!loadError && data) setMessages(data.map(({ role, content }) => ({ role, content })));
    }
    loadMessages();
  }, [user]);

  // Keep the newest message in view.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, loading]);

  // Grow the textarea with its content, up to the CSS max-height.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input, textareaRef]);

  async function persistMessage(role, content) {
    if (!supabase || !user) return;
    const { error: saveError } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      role,
      content
    });
    if (saveError) setError("Your response was generated, but could not be saved.");
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    await persistMessage("user", text);
    setInput("");
    setError("");
    setLoading(true);

    try {
      // Goes straight to the n8n Chat Trigger webhook (see lib/api.js).
      const reply = await sendAiHelperMessage(text, getSessionId(user));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      await persistMessage("assistant", reply);
    } catch (err) {
      setError(
        "Could not reach the AI Helper. Check that n8n is running and the chat workflow is active."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  async function copyMessage(index, content) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin or denied permission); nothing to undo.
    }
  }

  return (
    <section className="app-chat" aria-label="AI Helper chat">
      <header className="app-chat-head">
        <div className="app-chat-title">
          <span className="app-chat-avatar" aria-hidden="true"><Icon name="bot" size={18} strokeWidth={1.9} /></span>
          AI Helper
          <span className="app-live-dot" aria-hidden="true" />
        </div>
        <button type="button" className="app-icon-btn" onClick={onClose} aria-label="Minimize AI Helper" title="Minimize">
          <Icon name="chevronDown" size={20} />
        </button>
      </header>

      <div className="app-chat-messages" ref={listRef}>
        {messages.length === 0 && !loading && (
          <div className="app-chat-empty">
            <span className="app-chat-empty-mark"><BoltIcon size={20} /></span>
            <p>
              Hi! I&rsquo;m your AI Helper. Ask me anything, for example:
              &ldquo;Write a week of content for our new product launch,
              friendly tone.&rdquo;
            </p>
          </div>
        )}

        {messages.map((message, index) =>
          message.role === "user" ? (
            <div key={index} className="app-msg app-msg-user">{message.content}</div>
          ) : (
            <div key={index} className="app-msg app-msg-assistant">
              <div className="app-msg-text">{message.content}</div>
              <div className="app-msg-actions">
                <button
                  type="button"
                  className="app-icon-btn app-icon-btn-sm"
                  onClick={() => copyMessage(index, message.content)}
                  aria-label="Copy reply"
                  title={copiedIndex === index ? "Copied" : "Copy"}
                >
                  <Icon name={copiedIndex === index ? "check" : "copy"} size={16} />
                </button>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="app-msg app-msg-assistant app-typing" aria-label="Generating a response">
            <span /><span /><span />
          </div>
        )}
      </div>

      {error && <div className="app-chat-error">{error}</div>}

      <form
        className="app-composer"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI Helper…"
          rows={2}
        />
        <div className="app-composer-bar">
          <span className="app-composer-hint">Enter to send · Shift + Enter for a new line</span>
          <button
            type="submit"
            className="app-send-btn"
            disabled={loading || !input.trim()}
            aria-label="Send"
            title="Send"
          >
            <Icon name="arrowUp" size={18} strokeWidth={2.2} />
          </button>
        </div>
      </form>
    </section>
  );
}

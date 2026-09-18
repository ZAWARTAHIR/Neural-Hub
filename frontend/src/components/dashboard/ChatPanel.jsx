import { useEffect, useState, useRef } from "react";
import { sendChatMessage } from "../../lib/api.js";
import { supabase } from "../../lib/supabase.js";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function ChatPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

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
      // The backend forwards this to the n8n "chat" webhook and
      // returns whatever n8n responds with, e.g. { reply: "..." }
      const data = await sendChatMessage(text, nextMessages);
      const reply =
        typeof data?.reply === "string" ? data.reply : JSON.stringify(data);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      await persistMessage("assistant", reply);
    } catch (err) {
      setError(
        "Could not reach the automation service. Check that the backend and the n8n webhook are running."
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

  return (
    <div className="chat-panel">
      <div className="chat-panel-head">
        <span className="mark" />
        New campaign
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            Describe a campaign or update. For example: &ldquo;Write a week
            of content for our new product launch, friendly tone.&rdquo;
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`chat-bubble ${message.role}`}>
            {message.content}
          </div>
        ))}

        {loading && <div className="chat-bubble loading">Generating a response…</div>}
      </div>

      {error && <div className="chat-error">{error}</div>}

      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your campaign…"
          rows={1}
        />
        <button type="button" className="btn btn-blue" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

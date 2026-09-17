import { useState, useRef } from "react";
import { sendChatMessage } from "../../lib/api.js";

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
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

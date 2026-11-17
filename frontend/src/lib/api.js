import axios from "axios";

// Base URL of the backend controllers (see backend/.env.example).
// The backend forwards every request to the matching n8n webhook.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Sends a chat message to the backend, which forwards it to the
// n8n "chat" webhook and returns whatever n8n responds with.
export async function sendChatMessage(message, history = []) {
  const { data } = await api.post("/chat", { message, history });
  return data;
}

// n8n "Chat Trigger" webhook used by the AI Helper widget. Called directly
// from the browser (the Chat Trigger node answers CORS itself).
const N8N_CHAT_URL =
  import.meta.env.VITE_N8N_CHAT_URL ||
  "http://localhost:5688/webhook/2d6603d9-873d-4c0e-9c93-f52e806a459b/chat";

// Sends one message to the n8n Chat Trigger and returns the reply text.
// The Chat Trigger expects { action, sessionId, chatInput }; the AI Agent
// behind it usually answers with { output: "..." }.
export async function sendAiHelperMessage(chatInput, sessionId) {
  const { data } = await axios.post(
    N8N_CHAT_URL,
    { action: "sendMessage", sessionId, chatInput },
    { headers: { "Content-Type": "application/json" } }
  );
  return extractReply(data);
}

function extractReply(data) {
  const item = Array.isArray(data) ? data[0] : data;
  if (typeof item === "string") return item;
  const text = item?.output ?? item?.text ?? item?.reply ?? item?.message ?? item?.response;
  if (typeof text === "string") return text;
  return JSON.stringify(data);
}

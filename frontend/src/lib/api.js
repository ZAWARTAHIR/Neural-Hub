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
// Set via VITE_N8N_CHAT_URL in frontend/.env.
const N8N_CHAT_URL = import.meta.env.VITE_N8N_CHAT_URL;

// Sends one message to the n8n Chat Trigger and returns the reply text.
// The Chat Trigger expects { action, sessionId, chatInput }; the AI Agent
// behind it usually answers with { output: "..." }.
export async function sendAiHelperMessage(chatInput, sessionId) {
  if (!N8N_CHAT_URL) throw new Error("VITE_N8N_CHAT_URL is not set in frontend/.env");
  const { data } = await axios.post(
    N8N_CHAT_URL,
    { action: "sendMessage", sessionId, chatInput },
    { headers: { "Content-Type": "application/json" } }
  );
  return extractReply(data);
}

// n8n Webhook that runs the campaign workflow (Campaign studio chat),
// set via VITE_N8N_CAMPAIGN_URL in frontend/.env.
const N8N_CAMPAIGN_URL = import.meta.env.VITE_N8N_CAMPAIGN_URL;

// Triggers the campaign workflow with { prompt, outputs, mode, sessionId }
// and returns whatever the n8n workflow responds with.
export async function triggerCampaign(request) {
  if (!N8N_CAMPAIGN_URL) throw new Error("VITE_N8N_CAMPAIGN_URL is not set in frontend/.env");
  const { data } = await axios.post(N8N_CAMPAIGN_URL, request, {
    headers: { "Content-Type": "application/json" }
  });
  return parseCampaignResponse(data);
}

// Resumes a campaign paused at the n8n "Wait For Approval" node.
// `resumeUrl` comes from the awaiting_approval response. Sent as text/plain so
// the browser skips the CORS preflight (n8n's waiting webhook doesn't answer
// OPTIONS); the workflow's "Apply Approvals" node JSON-parses string bodies.
// Body: { action: "approve" | "cancel", steps: [{ type, approved, prompts: [{ key, text }] }] }
export async function resumeCampaign(resumeUrl, body) {
  const { data } = await axios.post(resumeUrl, JSON.stringify(body), {
    headers: { "Content-Type": "text/plain" }
  });
  return parseCampaignResponse(data);
}

function parseCampaignResponse(data) {
  let out = data;
  if (typeof out === "string") {
    try {
      out = JSON.parse(out);
    } catch {
      return out;
    }
  }
  return Array.isArray(out) ? out[0] : out;
}

export function campaignReplyText(data) {
  if (data == null || data === "") return "";
  return extractReply(data);
}

function extractReply(data) {
  const item = Array.isArray(data) ? data[0] : data;
  if (typeof item === "string") return item;
  const text = item?.output ?? item?.text ?? item?.reply ?? item?.message ?? item?.response;
  if (typeof text === "string") return text;
  return JSON.stringify(data);
}

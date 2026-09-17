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

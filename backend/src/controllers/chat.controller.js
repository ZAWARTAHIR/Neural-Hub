import axios from "axios";
import { env } from "../config/env.js";

// Forwards the chat message to the n8n "chat" webhook and
// returns whatever n8n sends back to the frontend as-is.
export async function handleChat(req, res, next) {
  try {
    if (!env.n8n.chatUrl) {
      return res.status(500).json({ error: "N8N_WEBHOOK_CHAT_URL is not set." });
    }

    const { data } = await axios.post(env.n8n.chatUrl, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

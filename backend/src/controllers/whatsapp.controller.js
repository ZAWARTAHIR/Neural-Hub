import axios from "axios";
import { env } from "../config/env.js";

export async function handleWhatsapp(req, res, next) {
  try {
    if (!env.n8n.whatsappUrl) {
      return res.status(500).json({ error: "N8N_WEBHOOK_WHATSAPP_URL is not set." });
    }

    const { data } = await axios.post(env.n8n.whatsappUrl, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

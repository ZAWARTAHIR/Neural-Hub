import axios from "axios";
import { env } from "../config/env.js";

export async function handleVideo(req, res, next) {
  try {
    if (!env.n8n.videoUrl) {
      return res.status(500).json({ error: "N8N_WEBHOOK_VIDEO_URL is not set." });
    }

    const { data } = await axios.post(env.n8n.videoUrl, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

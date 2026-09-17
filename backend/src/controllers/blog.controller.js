import axios from "axios";
import { env } from "../config/env.js";

export async function handleBlog(req, res, next) {
  try {
    if (!env.n8n.blogUrl) {
      return res.status(500).json({ error: "N8N_WEBHOOK_BLOG_URL is not set." });
    }

    const { data } = await axios.post(env.n8n.blogUrl, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

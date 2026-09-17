import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,

  n8n: {
    chatUrl: process.env.N8N_WEBHOOK_CHAT_URL,
    blogUrl: process.env.N8N_WEBHOOK_BLOG_URL,
    imageUrl: process.env.N8N_WEBHOOK_IMAGE_URL,
    videoUrl: process.env.N8N_WEBHOOK_VIDEO_URL,
    whatsappUrl: process.env.N8N_WEBHOOK_WHATSAPP_URL
  },

  // Placeholder only — no database client is created from these yet.
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// The dashboard channels. Sidebar, overview and top bar all read from this list.
export const CHANNELS = [
  { key: "chat", to: "/dashboard", end: true, label: "Chat", icon: "chat", accent: "var(--teal)", desc: "Campaign briefs" },
  { key: "blog", to: "/dashboard/blog", label: "Blog", icon: "blog", accent: "var(--amber)", desc: "Long-form posts" },
  { key: "image", to: "/dashboard/image", label: "Image", icon: "image", accent: "var(--coral)", desc: "Campaign visuals" },
  { key: "video", to: "/dashboard/video", label: "Video", icon: "video", accent: "#8b7cf6", desc: "Short-form video" },
  { key: "whatsapp", to: "/dashboard/whatsapp", label: "WhatsApp", icon: "whatsapp", accent: "#25d366", desc: "Broadcast messages" }
];

export function channelForPath(pathname) {
  const path = pathname.replace(/\/+$/, "");
  return CHANNELS.find((c) => c.to === path) || CHANNELS[0];
}

// "admin@neuralhub.com" -> "Admin"; prefers a real name from the Supabase profile when set.
export function displayName(user) {
  const fromProfile = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (fromProfile) return fromProfile;
  const local = (user?.email || "there").split("@")[0].split(/[._-]/)[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

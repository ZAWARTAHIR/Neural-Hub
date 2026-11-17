import { supabase } from "./supabase.js";

export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Uploads a new profile picture to Storage (avatars/<user id>/...) and
// returns its public URL. Older pictures of the same user are removed.
export async function uploadAvatar(user, file) {
  if (!AVATAR_TYPES.includes(file.type)) throw new Error("Please choose a JPG, PNG, WEBP or GIF image.");
  if (file.size > AVATAR_MAX_BYTES) throw new Error("Image is too large. The maximum size is 2 MB.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });
  if (error) throw new Error(error.message || "Upload failed.");

  await removeOldAvatars(user, path);
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function removeOldAvatars(user, keepPath = null) {
  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(user.id);
  const stale = (files || []).map((f) => `${user.id}/${f.name}`).filter((p) => p !== keepPath);
  if (stale.length) await supabase.storage.from(AVATAR_BUCKET).remove(stale);
}

// Saves name / picture on the auth user (drives the UI) and mirrors them to public.profiles.
export async function saveProfile(user, { fullName, avatarUrl }) {
  const { data, error } = await supabase.auth.updateUser({
    data: { full_name: fullName, avatar_url: avatarUrl }
  });
  if (error) throw new Error(error.message || "Could not save your profile.");

  await supabase
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() });

  return data.user;
}

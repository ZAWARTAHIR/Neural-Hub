import { supabase } from "./supabase.js";
import { getImageUrl } from "./blogFormat.jsx";

// Public bucket the n8n workflows upload generated media to
// (image_*.jpg, video_*.mp4, gif_*.gif).
export const IMAGES_BUCKET = "Images";

// GIFs have their own page, so they are left out of the Images gallery.
const IMAGE_EXT = /\.(png|jpe?g|webp|avif|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const GIF_EXT = /\.gif$/i;

const isImage = (f) =>
  IMAGE_EXT.test(f.name) || (f.metadata?.mimetype?.startsWith("image/") && f.metadata.mimetype !== "image/gif");
const isVideo = (f) => VIDEO_EXT.test(f.name) || f.metadata?.mimetype?.startsWith("video/");
const isGif = (f) => GIF_EXT.test(f.name) || f.metadata?.mimetype === "image/gif";

// Lists every file in the bucket (top level plus one folder level deep).
async function listBucket() {
  const bucket = supabase.storage.from(IMAGES_BUCKET);
  const options = { limit: 1000, sortBy: { column: "created_at", order: "desc" } };
  const { data, error } = await bucket.list("", options);
  if (error) throw error;

  const files = [];
  const folders = [];
  for (const item of data || []) {
    if (item.id) files.push({ ...item, path: item.name });
    else folders.push(item.name); // folders come back without an id
  }
  const nested = await Promise.all(
    folders.map(async (folder) => {
      const { data: inner } = await bucket.list(folder, options);
      return (inner || []).filter((f) => f.id).map((f) => ({ ...f, path: `${folder}/${f.name}` }));
    })
  );
  return files.concat(...nested);
}

function pathFromUrl(url) {
  const marker = `/object/public/${IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

/**
 * Every generated image: files in the Images bucket merged with the featured
 * images of blog posts. `listed` is false when the bucket could not be listed
 * (missing storage policy), in which case only blog images are returned.
 */
export async function loadImages() {
  const [bucketResult, blogResult] = await Promise.allSettled([
    listBucket().then((all) => all.filter(isImage)),
    supabase.from("ai_blogs").select("id, title, featured_image, created_at").order("created_at", { ascending: false })
  ]);

  const byPath = new Map();
  const files = bucketResult.status === "fulfilled" ? bucketResult.value : [];
  for (const f of files) {
    const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(f.path);
    byPath.set(f.path, {
      key: f.path,
      name: f.name,
      url: data.publicUrl,
      size: f.metadata?.size ?? null,
      type: f.metadata?.mimetype ?? null,
      createdAt: f.created_at ?? null,
      usedIn: []
    });
  }

  const blogs = blogResult.status === "fulfilled" ? blogResult.value.data || [] : [];
  for (const post of blogs) {
    const url = getImageUrl(post);
    if (!url) continue;
    const path = pathFromUrl(url) || url;
    if (!byPath.has(path)) {
      byPath.set(path, {
        key: path,
        name: path.split("/").pop(),
        url,
        size: null,
        type: null,
        createdAt: post.created_at,
        usedIn: []
      });
    }
    byPath.get(path).usedIn.push({ id: post.id, title: post.title });
  }

  const images = [...byPath.values()].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return {
    images,
    listed: bucketResult.status === "fulfilled" && files.length > 0,
    error: blogResult.status === "rejected" && bucketResult.status === "rejected" ? "Could not load images." : ""
  };
}

export function formatBytes(bytes) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Campaign results (public.campaigns) indexed by asset URL, so a file can show
// the prompt it was generated from. Empty when the table is missing.
async function loadCampaignIndex() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, prompt, result, created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(200);
  const byUrl = new Map();
  if (error || !data) return { byUrl, campaigns: [] };
  for (const c of data) {
    const r = c.result?.results || {};
    for (const kind of ["image", "video", "gif"]) {
      if (r[kind]?.url) byUrl.set(r[kind].url, { campaignId: c.id, topic: c.prompt, createdAt: c.created_at });
    }
  }
  return { byUrl, campaigns: data };
}

function toAsset(f, byUrl) {
  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(f.path);
  const campaign = byUrl.get(data.publicUrl);
  return {
    key: f.path,
    name: f.name,
    url: data.publicUrl,
    size: f.metadata?.size ?? null,
    type: f.metadata?.mimetype ?? null,
    createdAt: f.created_at ?? campaign?.createdAt ?? null,
    topic: campaign?.topic ?? null
  };
}

/**
 * Generated videos or GIFs from the Images bucket, with the campaign prompt
 * attached when the campaign was saved. Campaign results whose file isn't in
 * the bucket listing (e.g. listing policy missing) are added from their URL.
 */
export async function loadMedia(kind) {
  const match = kind === "video" ? isVideo : isGif;
  const [bucketResult, indexResult] = await Promise.allSettled([listBucket(), loadCampaignIndex()]);
  const byUrl = indexResult.status === "fulfilled" ? indexResult.value.byUrl : new Map();
  const files = bucketResult.status === "fulfilled" ? bucketResult.value.filter(match) : [];

  const items = files.map((f) => toAsset(f, byUrl));
  const seen = new Set(items.map((i) => i.url));
  const campaigns = indexResult.status === "fulfilled" ? indexResult.value.campaigns : [];
  for (const c of campaigns) {
    const asset = c.result?.results?.[kind];
    if (!asset?.url || seen.has(asset.url)) continue;
    seen.add(asset.url);
    items.push({
      key: asset.url,
      name: asset.url.split("/").pop(),
      url: asset.url,
      size: null,
      type: null,
      createdAt: c.created_at,
      topic: c.prompt
    });
  }

  items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return {
    items,
    error: bucketResult.status === "rejected" && items.length === 0 ? "Could not list the Images bucket." : ""
  };
}

// WhatsApp messages from completed campaigns (newest first).
export async function loadWhatsappMessages() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, prompt, result, created_at")
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data || [])
    .filter((c) => c.result?.results?.whatsapp?.message)
    .map((c) => ({
      id: c.id,
      topic: c.prompt,
      message: c.result.results.whatsapp.message,
      createdAt: c.created_at
    }));
}

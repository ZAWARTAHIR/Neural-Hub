import { supabase } from "./supabase.js";
import { getImageUrl } from "./blogFormat.jsx";

// Public bucket the n8n workflows upload generated images to.
export const IMAGES_BUCKET = "Images";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

// Lists every image in the bucket (top level plus one folder level deep).
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
  return files.concat(...nested).filter((f) => IMAGE_EXT.test(f.name) || f.metadata?.mimetype?.startsWith("image/"));
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
    listBucket(),
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

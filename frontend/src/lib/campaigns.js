import { supabase } from "./supabase.js";

// Supabase persistence for the Campaign studio chat (table: public.campaigns,
// see supabase/campaigns.sql, campaign-progress.sql, campaign-chats.sql).
// Every call is a no-op when Supabase or the signed-in user is missing, so the
// chat still works in memory.

const BASE_COLUMNS = "id, prompt, outputs, mode, status, reply, execution_id, review, result, created_at, updated_at";
const PROGRESS_COLUMNS = "progress, progress_at"; // campaign-progress.sql
const HISTORY_LIMIT = 50;
const THREAD_SCAN_LIMIT = 500;

// Errors from optional columns whose migration hasn't been run yet.
const missingColumn = (error, column) => error?.code === "42703" && (error.message || "").includes(column);

export function rowToCampaign(row) {
  return {
    id: row.id,
    threadId: row.thread_id ?? null,
    prompt: row.prompt,
    outputs: row.outputs || [],
    mode: row.mode,
    status: row.status,
    reply: row.reply || "",
    review: row.review || null,
    result: row.result || null,
    progress: row.progress || {},
    createdAt: row.created_at,
    updatedAt: row.progress_at || row.updated_at || row.created_at
  };
}

/**
 * Campaigns of one chat thread, oldest first. `threads` is false when the
 * thread_id column doesn't exist yet; then every campaign is returned.
 */
export async function loadCampaigns(userId, threadId) {
  if (!supabase || !userId) return { campaigns: [], threads: true, error: null };
  const run = (columns, byThread) => {
    let q = supabase.from("campaigns").select(columns).eq("user_id", userId);
    if (byThread) q = q.eq("thread_id", threadId);
    return q.order("created_at", { ascending: false }).limit(HISTORY_LIMIT);
  };

  let threads = true;
  let columns = `${BASE_COLUMNS}, ${PROGRESS_COLUMNS}, thread_id`;
  let { data, error } = await run(columns, true);
  if (missingColumn(error, "progress")) {
    columns = `${BASE_COLUMNS}, thread_id`;
    ({ data, error } = await run(columns, true));
  }
  if (missingColumn(error, "thread_id")) {
    threads = false;
    ({ data, error } = await run(columns.replace(", thread_id", ""), false));
    if (missingColumn(error, "progress")) ({ data, error } = await run(BASE_COLUMNS, false));
  }
  if (error) return { campaigns: [], threads, error };
  return { campaigns: data.reverse().map(rowToCampaign), threads, error: null };
}

/**
 * Chat history: one entry per thread, newest activity first.
 * Title is the thread's first prompt.
 */
export async function loadThreads(userId) {
  if (!supabase || !userId) return { threads: [], supported: true, error: null };
  const { data, error } = await supabase
    .from("campaigns")
    .select("thread_id, prompt, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(THREAD_SCAN_LIMIT);
  if (missingColumn(error, "thread_id")) return { threads: [], supported: false, error: null };
  if (error) return { threads: [], supported: true, error };

  const byId = new Map();
  for (const row of data) {
    const t = byId.get(row.thread_id);
    if (!t) {
      byId.set(row.thread_id, { id: row.thread_id, title: row.prompt, count: 1, lastAt: row.created_at });
    } else {
      t.count += 1;
      t.title = row.prompt; // rows are newest first, so the last one seen is the first prompt
    }
  }
  return { threads: [...byId.values()], supported: true, error: null };
}

// Live state written by n8n (progress, and the final result when it finishes).
export async function fetchCampaignState(id) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("campaigns")
    .select("status, progress, progress_at, result")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (!missingColumn(error, "progress")) console.error("Could not read campaign progress", error);
    return null;
  }
  return data;
}

export async function insertCampaign(userId, campaign) {
  if (!supabase || !userId) return { error: null };
  const row = {
    id: campaign.id,
    user_id: userId,
    thread_id: campaign.threadId,
    prompt: campaign.prompt,
    outputs: campaign.outputs,
    mode: campaign.mode,
    status: campaign.status
  };
  let { error } = await supabase.from("campaigns").insert(row);
  if (missingColumn(error, "thread_id") || (error?.code === "PGRST204" && /thread_id/.test(error.message || ""))) {
    delete row.thread_id;
    ({ error } = await supabase.from("campaigns").insert(row));
  }
  return { error };
}

// Saves only the fields that change over a campaign's life.
export async function updateCampaign(id, patch) {
  if (!supabase) return { error: null };
  const row = { updated_at: new Date().toISOString() };
  if ("status" in patch) row.status = patch.status;
  if ("reply" in patch) row.reply = patch.reply || null;
  if ("review" in patch) {
    row.review = patch.review;
    row.execution_id = patch.review?.executionId ?? null;
  }
  if ("result" in patch) row.result = patch.result;
  const { error } = await supabase.from("campaigns").update(row).eq("id", id);
  return { error };
}

export function isMissingTable(error) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

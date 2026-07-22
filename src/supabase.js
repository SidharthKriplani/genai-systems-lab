// src/supabase.js — Supabase client + auth helpers
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in Vercel env vars.

import { applyAnnotationMerge } from "./utils/annotationsSync.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

export async function signInWithGitHub() {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

// callback receives (event, user) — handle SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED, SIGNED_OUT
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session?.user || null)
  );
  return () => subscription.unsubscribe();
}

export async function getUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Progress sync ─────────────────────────────────────────────────────────────
// Key-value store in Supabase user_progress table.
// Table schema (run in Supabase SQL editor):
//   create table user_progress (
//     id uuid default gen_random_uuid() primary key,
//     user_id uuid references auth.users not null,
//     key text not null,
//     value jsonb not null,
//     updated_at timestamptz default now(),
//     unique(user_id, key)
//   );
//   alter table user_progress enable row level security;
//   create policy "own_progress" on user_progress for all using (auth.uid() = user_id);

// Keys synced to cloud (localStorage key → sync priority)
export const SYNC_KEYS = [
  "gsl-preplab-history",   // PrepLab question history
  "genai_leaderboard",     // RAG Lab completions
  "gsl-concepts-mastery",  // Concepts gym completions
  "gsl-preplab-spaced",    // Spaced repetition queue
  "gsl-bookmarks",         // GT post bookmarks
  "gsl-streak",            // Streak count
  "gsl-last-visit",        // Last visit date
  "gsl-last-touched-v1",  // Continue-strip: last Foundations module opened
  // Annotations (2026-07-22): sticky notes + in-place highlights + their
  // delete-tombstones. Pull side MERGES these (per-item newest-wins) instead
  // of local-wins — see pullProgress + utils/annotationsSync.js.
  "lab-stickies-v1",
  "lab-stickies-tomb-v1",
  "gsl_page_highlights_v1",
  "gsl_page_highlights_v1-tomb-v1",
];

// Pull cloud → merge with localStorage (cloud wins for keys not in localStorage)
// Annotation stores (stickies/highlights) and their delete-tombstones. These
// get a per-item merge on pull (annotationsSync.js) — module-scope so both
// full pulls and the annotations-only pull share ONE definition (no drift).
const ANNOT_PAIRS = {
  "lab-stickies-v1": "lab-stickies-tomb-v1",
  "gsl_page_highlights_v1": "gsl_page_highlights_v1-tomb-v1",
};
const TOMB_TO_STORE = Object.fromEntries(Object.entries(ANNOT_PAIRS).map(([st, t]) => [t, st]));

// Annotations-only pull: cheap + side-effect-safe (per-item merge, idempotent,
// touches NO other keys' semantics) — safe to call on every tab-visible.
export async function pullAnnotationsOnly(userId) {
  if (!supabase || !userId) return;
  try {
    const keys = [...Object.keys(ANNOT_PAIRS), ...Object.keys(TOMB_TO_STORE)];
    const { data, error } = await supabase
      .from("user_progress")
      .select("key, value")
      .eq("user_id", userId)
      .in("key", keys);
    if (error || !data) return;
    for (const { key, value } of data) {
      if (ANNOT_PAIRS[key]) applyAnnotationMerge(key, ANNOT_PAIRS[key], value, null);
      else if (TOMB_TO_STORE[key]) applyAnnotationMerge(TOMB_TO_STORE[key], key, null, value);
    }
  } catch { /* best effort */ }
}

export async function pullProgress(userId) {
  if (!supabase || !userId) return;
  try {
    const { data, error } = await supabase
      .from("user_progress")
      .select("key, value")
      .eq("user_id", userId);
    if (error || !data) return;
    // Annotation blobs (stickies/highlights) get a REAL merge — per-item
    // newest-wins with delete tombstones — instead of the local-wins rule,
    // which would either clobber or resurrect notes across devices.
    data.forEach(({ key, value }) => {
      if (ANNOT_PAIRS[key]) { applyAnnotationMerge(key, ANNOT_PAIRS[key], value, null); return; }
      if (TOMB_TO_STORE[key]) { applyAnnotationMerge(TOMB_TO_STORE[key], key, null, value); return; }
      const local = localStorage.getItem(key);
      if (!local) {
        // Nothing local — write cloud value
        localStorage.setItem(key, JSON.stringify(value));
      }
      // If local exists, local wins (most recent session)
    });
  } catch {}
}

// Push localStorage → cloud (upsert)
export async function pushProgress(userId) {
  if (!supabase || !userId) return;
  try {
    const rows = SYNC_KEYS.map(key => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try {
        return { user_id: userId, key, value: JSON.parse(raw), updated_at: new Date().toISOString() };
      } catch { return null; }
    }).filter(Boolean);
    if (!rows.length) return;
    await supabase.from("user_progress").upsert(rows, { onConflict: "user_id,key" });
  } catch {}
}

// Push a single key immediately (called after each PrepLab answer / lab completion)
export async function pushKey(userId, key) {
  if (!supabase || !userId) return;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const value = JSON.parse(raw);
    await supabase.from("user_progress").upsert(
      [{ user_id: userId, key, value, updated_at: new Date().toISOString() }],
      { onConflict: "user_id,key" }
    );
  } catch {}
}

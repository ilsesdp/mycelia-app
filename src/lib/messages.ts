import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

export type ThreadSummary = {
  id: string;
  farmId: string;
  displayName: string;
  preview: string;
  when: string;
  unread: boolean;
};

export type MessageRow = {
  id: string;
  senderId: string;
  body: string;
  when: string;
};

// Ports the prototype's relative "when" strings (THREADS[].when: '2h',
// 'Yesterday', 'Mon'…) from a real timestamp.
export function relativeWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24 && d.getDate() === now.getDate()) return `${diffHr}h`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// A thread is visible to either party per RLS (message_threads_select):
// the counterpart (a visitor who messaged a farm) or that farm's owner. A
// single query naturally returns both directions, so one inbox — rather
// than a separate "My Farm" messages screen — works for both, without
// needing the My Farm tools group (not built yet) to exist first.
export async function getMyThreads(supabase: Client, myId: string): Promise<ThreadSummary[]> {
  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, farm_id, counterpart_id, last_message_at, farms ( name, owner_id )")
    .order("last_message_at", { ascending: false });

  if (!threads || threads.length === 0) return [];

  // profiles RLS only allows reading your own row, so embedding
  // profiles!message_threads_counterpart_id_fkey here silently comes back
  // null for every thread where you're not that counterpart yourself (the
  // common case: a farm owner viewing a visitor's name). contact_name/
  // full_name aren't sensitive — profile_display_names exposes just those
  // two columns for any profile, the same deliberate RLS bypass
  // farm_public_contact already uses for contact_name.
  const { data: names } = await supabase
    .from("profile_display_names")
    .select("id, contact_name, full_name")
    .in(
      "id",
      threads.map((t) => t.counterpart_id)
    );
  const nameById = new Map((names ?? []).map((n) => [n.id, n]));

  const { data: messages } = await supabase
    .from("messages")
    .select("thread_id, sender_id, body, created_at, read_at")
    .in(
      "thread_id",
      threads.map((t) => t.id)
    )
    .order("created_at", { ascending: true });

  const latestByThread = new Map<string, { body: string; created_at: string }>();
  const unreadByThread = new Set<string>();
  (messages ?? []).forEach((m) => {
    latestByThread.set(m.thread_id, m);
    if (m.sender_id !== myId && !m.read_at) unreadByThread.add(m.thread_id);
  });

  return threads.map((t) => {
    const amOwner = t.farms?.owner_id === myId;
    const counterpart = nameById.get(t.counterpart_id);
    const displayName = amOwner ? counterpart?.contact_name || counterpart?.full_name || "A visitor" : t.farms?.name || "A farm";
    const latest = latestByThread.get(t.id);
    return {
      id: t.id,
      farmId: t.farm_id,
      displayName,
      preview: latest?.body ?? "",
      when: latest ? relativeWhen(latest.created_at) : relativeWhen(t.last_message_at),
      unread: unreadByThread.has(t.id),
    };
  });
}

export async function getThreadMessages(supabase: Client, threadId: string): Promise<MessageRow[]> {
  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((m) => ({ id: m.id, senderId: m.sender_id, body: m.body, when: relativeWhen(m.created_at) }));
}

// Marks every message in this thread that wasn't sent by me as read. Safe to
// call repeatedly (on mount and on each live-received message) — the
// read_at IS NULL filter means an already-read message is just skipped.
export async function markThreadRead(supabase: Client, threadId: string, myId: string): Promise<void> {
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("thread_id", threadId).neq("sender_id", myId).is("read_at", null);
}

// Finds the one thread (unique on farm_id+counterpart_id) between this
// visitor and this farm, if the first message has already been sent.
export async function findThreadForFarm(supabase: Client, farmId: string, myId: string): Promise<string | null> {
  const { data } = await supabase
    .from("message_threads")
    .select("id")
    .eq("farm_id", farmId)
    .eq("counterpart_id", myId)
    .maybeSingle();
  return data?.id ?? null;
}

export type ThreadStartCheck = "allowed" | "growers_only" | "nobody";

// Mirrors message_threads_insert's RLS check (see Supabase migrations
// fix_message_threads_insert_policy_alter / fix_farm_public_contact_add_visibility)
// so a visitor who can't actually start a new thread sees why instead of a
// composer whose first send silently fails. Only gates a brand-new
// thread — Privacy & visibility's "Who can message you" only has to answer
// "can a new conversation start", not retroactively cut off one already
// underway, so an existing thread (threadId already found) is never
// checked against this.
//
// Reads through farm_public_contact (keyed by farmId, not ownerId) rather
// than profiles directly — profiles RLS only allows reading your own row,
// so a plain `profiles.select(...).eq("id", farmOwnerId)` from anyone else
// silently returns nothing and this would always fall through to the
// growers_only default, even for farms set to "everyone" or "nobody".
export async function canStartThread(supabase: Client, farmId: string, farmOwnerId: string, myId: string): Promise<ThreadStartCheck> {
  if (farmOwnerId === myId) return "allowed";
  const { data: owner } = await supabase.from("farm_public_contact").select("message_visibility").eq("farm_id", farmId).maybeSingle();
  const visibility = owner?.message_visibility ?? "growers_only";
  if (visibility === "nobody") return "nobody";
  if (visibility === "everyone") return "allowed";
  const { data: myFarm } = await supabase.from("farms").select("id").eq("owner_id", myId).eq("published", true).maybeSingle();
  return myFarm ? "allowed" : "growers_only";
}

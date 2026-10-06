import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;

// "Everyone" has been retired as a choosable option (contact info is now
// either shared with other growers or kept private to the owner), but the
// visibility_t enum still has the "everyone" value for any pre-existing
// data — mapped to its nearest remaining display option rather than widened
// to a value the UI no longer offers.
export const VISIBILITY_DISPLAY: Record<Database["public"]["Enums"]["visibility_t"], "Growers only" | "Only me"> = {
  everyone: "Growers only",
  growers_only: "Growers only",
  nobody: "Only me",
};
export const VISIBILITY_DB: Record<"Growers only" | "Only me", Database["public"]["Enums"]["visibility_t"]> = {
  "Growers only": "growers_only",
  "Only me": "nobody",
};

export const CHANNEL_DISPLAY: Record<Database["public"]["Enums"]["message_channel_t"], "Text" | "Email" | "Text & Email"> = {
  text_me: "Text",
  email_me: "Email",
  both: "Text & Email",
};
export const CHANNEL_DB: Record<"Text" | "Email" | "Text & Email", Database["public"]["Enums"]["message_channel_t"]> = {
  Text: "text_me",
  Email: "email_me",
  "Text & Email": "both",
};

export type SettingsProfile = {
  fullName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  messageChannel: Database["public"]["Enums"]["message_channel_t"];
  emailVisibility: Database["public"]["Enums"]["visibility_t"];
  phoneVisibility: Database["public"]["Enums"]["visibility_t"];
  messageVisibility: Database["public"]["Enums"]["visibility_t"];
  notifMsgOn: boolean;
  notifMarketOn: boolean;
  notifEventOn: boolean;
  notifPause: boolean;
};

export type MyFarm = { id: string; name: string } | null;

// Settings is reachable by any logged-in account — a pure visitor has a
// profiles row too (message_threads.counterpart_id references it), so
// Notifications/Privacy/Account apply either way. Only "Edit profile"
// (farm fields, 5.3) needs a farm to exist, hence the separate `myFarm`
// lookup rather than assuming every settings visitor owns one.
export async function getSettingsContext(supabase: Client, userId: string): Promise<{ profile: SettingsProfile; farm: MyFarm }> {
  const [{ data: profile }, { data: farm }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, contact_name, contact_email, contact_phone, message_channel, email_visibility, phone_visibility, message_visibility, notif_msg_on, notif_market_on, notif_event_on, notif_pause"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("farms").select("id, name").eq("owner_id", userId).maybeSingle(),
  ]);

  return {
    profile: {
      fullName: profile?.full_name ?? null,
      contactName: profile?.contact_name ?? null,
      contactEmail: profile?.contact_email ?? null,
      contactPhone: profile?.contact_phone ?? null,
      messageChannel: profile?.message_channel ?? "text_me",
      emailVisibility: profile?.email_visibility ?? "growers_only",
      phoneVisibility: profile?.phone_visibility ?? "nobody",
      messageVisibility: profile?.message_visibility ?? "growers_only",
      notifMsgOn: profile?.notif_msg_on ?? true,
      notifMarketOn: profile?.notif_market_on ?? true,
      notifEventOn: profile?.notif_event_on ?? true,
      notifPause: profile?.notif_pause ?? false,
    },
    farm,
  };
}

export const SUPPORT_TOPICS = ["Something isn't working", "I have a question", "I found a bug", "Something else"] as const;

export const FAQ_ITEMS = [
  {
    q: "How do I change my opening hours?",
    a: 'Go to My farm and tap the clock icon (or Settings → Edit profile) to open your weekly hours. Need a one-off change just for today? Use "Close early" from My farm instead — it doesn\'t touch your regular schedule. Either way, changes save immediately and show on your public page right away.',
  },
  {
    q: "Who can see my phone number?",
    a: 'You control this from Settings → Privacy. Your phone number is hidden by default — switch it to "Growers only" any time to share it with other growers, and switch it back to "Only me" just as easily. The same screen controls who sees your email.',
  },
  {
    q: "Why is my farm not on the map?",
    a: "Your farm shows up on the map once signup is finished — name, address and at least one product. If you've done all that and still don't see it, double-check you didn't leave a required field blank earlier in signup, or reach out to support and we'll take a look.",
  },
  {
    q: "How do I add a product?",
    a: 'From My farm, tap "Manage products" and then "Add a product." Fill in a name, category, quantity and availability, then save — it appears on your public page right away and can be edited or removed any time from the same list.',
  },
] as const;

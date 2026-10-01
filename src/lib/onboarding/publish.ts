import { createClient } from "@/lib/supabase/client";
import type { OnboardingState } from "@/lib/onboarding/context";
import type { Database } from "@/lib/types/database";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
// farm_hours.day_of_week is 0–6; 0 = Sunday, matching JS Date#getDay().
const DAY_INDEX: Record<(typeof DAYS)[number], number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const AVAILABILITY_DB: Record<string, Database["public"]["Enums"]["availability_t"]> = {
  "Ready now": "ready_now",
  Producing: "producing",
  Planning: "planning",
};
const VISIBILITY_DB: Record<string, Database["public"]["Enums"]["visibility_t"]> = {
  "Growers only": "growers_only",
  "Only me": "nobody",
};
const CHANNEL_DB: Record<string, Database["public"]["Enums"]["message_channel_t"]> = {
  "Text me": "text_me",
  "Email me": "email_me",
  Both: "both",
};

async function uploadPhoto(
  supabase: ReturnType<typeof createClient>,
  farmId: string,
  path: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/${path}.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Writes everything onboarding collected, all at once, at the moment the
// grower hits "Publish my farm" (1.12 → 1.13) — nothing before this point
// touches the database, matching the prototype's own single-write-at-the-
// end design. Throws with a message meant to be shown to the user on
// failure; nothing is rolled back automatically, so a mid-way failure
// leaves the farm row as a draft (published: false) the owner can retry.
export async function publishFarm(state: OnboardingState, userId: string) {
  const supabase = createClient();

  const { data: farm, error: farmError } = await supabase
    .from("farms")
    .insert({
      owner_id: userId,
      name: state.farmName,
      address: state.farmAddress || null,
      about: state.farmAbout || null,
      published: false,
    })
    .select("id")
    .single();
  if (farmError || !farm) throw new Error(farmError?.message ?? "Couldn't create your farm.");
  const farmId = farm.id;

  if (state.coverPhotoFile) {
    const url = await uploadPhoto(supabase, farmId, "cover", state.coverPhotoFile);
    if (url) await supabase.from("farms").update({ cover_photo_url: url }).eq("id", farmId);
  }

  const categories = Object.entries(state.categories)
    .filter(([, v]) => v)
    .map(([category]) => ({ farm_id: farmId, category: category as Database["public"]["Enums"]["category_t"] }));
  if (categories.length) {
    const { error } = await supabase.from("farm_categories").insert(categories);
    if (error) throw new Error(error.message);
  }

  for (const [i, p] of state.products.entries()) {
    let photo_url: string | null = null;
    if (p.photoFile) photo_url = await uploadPhoto(supabase, farmId, `products/${p.id}`, p.photoFile);
    const { error } = await supabase.from("products").insert({
      farm_id: farmId,
      name: p.name,
      category: (p.category || "Vegetables") as Database["public"]["Enums"]["category_t"],
      availability: AVAILABILITY_DB[p.availability],
      qty: p.qty || null,
      unit: (p.unit || null) as Database["public"]["Enums"]["unit_t"] | null,
      roughly_when: p.roughlyWhen || null,
      photo_url,
      sort_order: i,
    });
    if (error) throw new Error(error.message);
  }

  if (state.hoursMode) {
    const rows = DAYS.map((d) => {
      const h = state.hours[d];
      return {
        farm_id: farmId,
        day_of_week: DAY_INDEX[d],
        open_time: h.closed ? null : to24h(h.open),
        close_time: h.closed ? null : to24h(h.close),
        closed: h.closed,
      };
    });
    const { error } = await supabase.from("farm_hours").insert(rows);
    if (error) throw new Error(error.message);
  }

  if (state.selectedMarketIds.length) {
    const { error } = await supabase
      .from("farm_markets")
      .insert(state.selectedMarketIds.map((market_id) => ({ farm_id: farmId, market_id })));
    if (error) throw new Error(error.message);
  }

  if (state.contactName || state.contactEmail || state.contactPhone) {
    const { error } = await supabase
      .from("profiles")
      .update({
        contact_name: state.contactName || null,
        contact_email: state.contactEmail || null,
        contact_phone: state.contactPhone || null,
        email_visibility: VISIBILITY_DB[state.emailVisibility],
        phone_visibility: VISIBILITY_DB[state.phoneVisibility],
        message_channel: CHANNEL_DB[state.messageChannel],
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
  }

  const { error: publishError } = await supabase.from("farms").update({ published: true }).eq("id", farmId);
  if (publishError) throw new Error(publishError.message);

  return farmId;
}

// "09:00 AM" → "09:00:00" for the `time` columns.
function to24h(t: string): string | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const mer = m[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}:00`;
}

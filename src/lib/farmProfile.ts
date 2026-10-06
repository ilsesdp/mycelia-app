import type { SupabaseClient } from "@supabase/supabase-js";
import type { HourRow, TodayStatus } from "@/lib/farmStatus";
import type { Database } from "@/lib/types/database";

// Shared by every farm-profile tab (2.3 Products, 2.4 About, 2.5 Events) so
// the hero/header/tabs chrome (farmProfileShell/farmHeader in the
// prototype) always shows the same name/address/status/categories,
// fetched once per request rather than copy-pasted per tab.
export type FarmHeader = {
  id: string;
  name: string;
  address: string | null;
  about: string | null;
  directions: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  lat: number | null;
  lng: number | null;
  coverPhotoUrl: string | null;
  categories: Database["public"]["Enums"]["category_t"][];
  // Raw hours + manual override, not a precomputed status — the status
  // chip (StatusChip) computes farmTodayStatus(hours, todayStatus, timezone)
  // using the farm's own stored timezone (farms.timezone), so it's exact
  // regardless of where it's computed or who's viewing.
  hours: HourRow[];
  todayStatus: TodayStatus;
  todayStatusDate: string | null;
  timezone: string;
};

// Ports S.lastMapView — FarmList and the map's pin sheet both link in here
// with ?from=list / ?from=map so the back arrow returns to wherever the
// visitor actually came from, instead of always defaulting to the map.
// ?from=events is the same idea for the market page: the My Farm Events
// tab's "Also find us at" row links in with it so the back arrow returns
// there instead of to the map.
export function resolveBackHref(from: string | string[] | undefined): string {
  if (from === "list") return "/";
  if (from === "events") return "/my-farm/events";
  return "/map";
}

export async function getFarmHeader(
  supabase: SupabaseClient<Database>,
  farmId: string
): Promise<FarmHeader | null> {
  const { data } = await supabase
    .from("farms")
    .select(
      `
      id,
      name,
      address,
      about,
      directions,
      website,
      instagram,
      facebook,
      lat,
      lng,
      cover_photo_url,
      today_status,
      today_status_date,
      timezone,
      farm_categories ( category ),
      farm_hours ( day_of_week, open_time, close_time, closed )
    `
    )
    .eq("id", farmId)
    .eq("published", true)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    about: data.about,
    directions: data.directions,
    website: data.website,
    instagram: data.instagram,
    facebook: data.facebook,
    lat: data.lat,
    lng: data.lng,
    coverPhotoUrl: data.cover_photo_url,
    categories: data.farm_categories.map((c) => c.category),
    hours: data.farm_hours,
    todayStatus: data.today_status,
    todayStatusDate: data.today_status_date,
    timezone: data.timezone,
  };
}

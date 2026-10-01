import type { SupabaseClient } from "@supabase/supabase-js";
import { farmTodayStatus } from "@/lib/farmStatus";
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
  lat: number | null;
  lng: number | null;
  coverPhotoUrl: string | null;
  categories: Database["public"]["Enums"]["category_t"][];
  status: ReturnType<typeof farmTodayStatus>;
};

// Ports S.lastMapView — FarmList and the map's pin sheet both link in here
// with ?from=list / ?from=map so the back arrow returns to wherever the
// visitor actually came from, instead of always defaulting to the map.
export function resolveBackHref(from: string | string[] | undefined): string {
  return from === "list" ? "/" : "/map";
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
      lat,
      lng,
      cover_photo_url,
      today_status,
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
    lat: data.lat,
    lng: data.lng,
    coverPhotoUrl: data.cover_photo_url,
    categories: data.farm_categories.map((c) => c.category),
    status: farmTodayStatus(data.farm_hours, data.today_status),
  };
}

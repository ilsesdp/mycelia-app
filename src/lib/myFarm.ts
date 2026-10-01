import type { SupabaseClient } from "@supabase/supabase-js";
import { farmTodayStatus, type HourRow } from "@/lib/farmStatus";
import type { Database } from "@/lib/types/database";

type Client = SupabaseClient<Database>;
type Category = Database["public"]["Enums"]["category_t"];
type Availability = Database["public"]["Enums"]["availability_t"];
type Unit = Database["public"]["Enums"]["unit_t"];
type TodayStatusEnum = Database["public"]["Enums"]["today_status_t"];

export const CATEGORIES: Category[] = [
  "Vegetables",
  "Fruit",
  "Eggs",
  "Dairy",
  "Honey",
  "Flowers",
  "Herbs",
  "Hand Crafts",
  "Baked goods",
  "Seeds",
];
export const UNITS: Unit[] = ["lb", "oz", "kg", "bunch", "dozen", "pint", "quart", "jar", "each"];
export const AVAILABILITY_DISPLAY: Record<Availability, "Ready now" | "Producing" | "Planning"> = {
  ready_now: "Ready now",
  producing: "Producing",
  planning: "Planning",
};
export const AVAILABILITY_DB: Record<"Ready now" | "Producing" | "Planning", Availability> = {
  "Ready now": "ready_now",
  Producing: "producing",
  Planning: "planning",
};
export const AVAILABILITY_CLASS: Record<Availability, string> = {
  ready_now: "avail-ready",
  producing: "avail-producing",
  planning: "avail-planning-solid",
};

export type MyFarmIdentity = {
  id: string;
  name: string;
  address: string | null;
  coverPhotoUrl: string | null;
  categories: Category[];
  status: ReturnType<typeof farmTodayStatus>;
  hours: HourRow[];
  todayStatus: TodayStatusEnum | null;
  todayStatusNote: string | null;
};

// Looks up the farm (if any) the signed-in user owns. Settings is reachable
// by any logged-in account (see lib/settings.ts); My Farm is not — a
// visitor with no farm row is redirected to Settings by the page itself.
export async function getMyFarmId(supabase: Client, userId: string): Promise<string | null> {
  const { data } = await supabase.from("farms").select("id").eq("owner_id", userId).maybeSingle();
  return data?.id ?? null;
}

export async function getMyFarmIdentity(supabase: Client, farmId: string): Promise<MyFarmIdentity | null> {
  const { data } = await supabase
    .from("farms")
    .select(
      `
      id, name, address, cover_photo_url, today_status, today_status_note,
      farm_categories ( category ),
      farm_hours ( day_of_week, open_time, close_time, closed )
    `
    )
    .eq("id", farmId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    coverPhotoUrl: data.cover_photo_url,
    categories: data.farm_categories.map((c) => c.category),
    status: farmTodayStatus(data.farm_hours, data.today_status),
    hours: data.farm_hours,
    todayStatus: data.today_status,
    todayStatusNote: data.today_status_note,
  };
}

export type ProductRow = {
  id: string;
  name: string;
  category: Category | null;
  availability: Availability;
  qty: string | null;
  unit: Unit | null;
  roughly_when: string | null;
  photo_url: string | null;
};

export function productRailLabel(p: Pick<ProductRow, "qty" | "unit" | "roughly_when">): string {
  return p.qty ? `${p.qty} ${p.unit ?? ""}`.trim() : p.roughly_when || "";
}

export type EventRow = {
  id: string;
  name: string;
  event_date: string;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
  photo_url: string | null;
};

export function fmtEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function fmtEventTimeRange(startsAt: string | null, endsAt: string | null): string {
  return [startsAt, endsAt].filter(Boolean).join(" – ");
}

export type MarketRow = { id: string; name: string; location: string | null; schedule_text: string | null };

export async function getMyFarmMarkets(supabase: Client, farmId: string): Promise<MarketRow[]> {
  const { data } = await supabase.from("farm_markets").select("markets ( id, name, location, schedule_text )").eq("farm_id", farmId);
  return (data ?? []).map((r) => r.markets).filter((m): m is MarketRow => !!m);
}

export { type TodayStatusEnum };

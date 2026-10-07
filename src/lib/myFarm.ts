import type { SupabaseClient } from "@supabase/supabase-js";
import { farmTodayStatus, fmtTime, type HourRow } from "@/lib/farmStatus";
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
  "Handmade Crafts",
  "Baked Goods",
  "Seeds",
  "Fiber Goods",
  "Mushrooms",
  "Dry Goods",
];
// "kg" stays in the DB enum (existing rows may use it) but is dropped from
// the app-facing unit list per product decision.
export const UNITS: Unit[] = ["lb", "oz", "fl oz", "pint", "quart", "gallon", "each", "dozen", "bunch", "jar", "pack", "bag", "loaf"];

// A few example items for each category, shown as the subtitle under its
// name on the onboarding categories step (1.7) — helps a grower unsure
// which bucket something falls into (e.g. is a candle "Handmade Crafts"?).
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Vegetables: "Carrots, tomatoes, peppers, leafy greens",
  Fruit: "Apples, berries, peaches, melons",
  Eggs: "Chicken, duck, or quail eggs",
  Dairy: "Milk, cheese, yogurt, butter",
  Honey: "Raw honey, infused honey, honeycomb",
  Flowers: "Cut flowers, bouquets, dried flowers",
  Herbs: "Basil, mint, rosemary, cilantro",
  "Handmade Crafts": "Handmade soaps, candles, pottery, baskets",
  "Baked Goods": "Bread, cookies, pies, pastries",
  Seeds: "Vegetable, herb, and flower seeds",
  "Fiber Goods": "Wool, fleece, yarn, woven goods",
  Mushrooms: "Oyster, shiitake, lion's mane, button",
  "Dry Goods": "Dried beans, grains, cornmeal, flour",
};
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
  todayStatusDate: string | null;
  timezone: string;
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
      id, name, address, cover_photo_url, today_status, today_status_note, today_status_date, timezone,
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
    status: farmTodayStatus(data.farm_hours, data.today_status, data.timezone, data.today_status_date),
    hours: data.farm_hours,
    todayStatus: data.today_status,
    todayStatusNote: data.today_status_note,
    todayStatusDate: data.today_status_date,
    timezone: data.timezone,
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
  // Was qty ?? roughly_when — an "either/or" that silently dropped the
  // estimate whenever a quantity was also entered (the common case for
  // Producing/Planning items), even though both were saved. Show both,
  // joined, when both are present.
  const amount = p.qty ? `${p.qty} ${p.unit ?? ""}`.trim() : "";
  return [amount, p.roughly_when].filter(Boolean).join(" · ");
}

// An event's dates work one of three ways: a single day, a continuous
// range of days (one shared start/end time each day), or a specific set
// of individual dates — either all sharing one time, or each with its
// own. `event_date`/`starts_at`/`ends_at` always carry the *primary*
// (earliest) date/time regardless of mode, so every "upcoming" query
// (gte/order on event_date) keeps working unchanged; `end_date` only
// means something for "range", and `datesList` only exists for
// "selected" (one row per chosen date, from the event_dates table).
export type EventDateMode = "single" | "range" | "selected";
export type EventDateEntry = { id: string; event_date: string; starts_at: string | null; ends_at: string | null };

export type EventRow = {
  id: string;
  name: string;
  event_date: string;
  starts_at: string | null;
  ends_at: string | null;
  notes: string | null;
  photo_url: string | null;
  date_mode: EventDateMode;
  end_date: string | null;
  all_day: boolean;
  same_time_for_all_dates: boolean;
  datesList?: EventDateEntry[];
};

export function fmtEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// A shorter form ("Sep 20, 2026", no weekday) for the two-date span a
// range or a multi-date summary needs to fit on one line.
export function fmtEventDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

// Was joining the raw DB time strings verbatim ("01:00:00 – 13:00:00"),
// not the friendly h(:mm)am/pm format the Hours box uses everywhere else
// (fmtTime, farmStatus.ts) — events are the one place time was still
// showing in 24-hour database form.
export function fmtEventTimeRange(startsAt: string | null, endsAt: string | null): string {
  return [startsAt, endsAt].filter((t): t is string => !!t).map(fmtTime).join(" – ");
}

// The date line for a card/detail view, covering all three date modes.
export function fmtEventDateLabel(ev: Pick<EventRow, "date_mode" | "event_date" | "end_date" | "datesList">): string {
  if (ev.date_mode === "range" && ev.end_date) {
    return `${fmtEventDateShort(ev.event_date)} – ${fmtEventDateShort(ev.end_date)}`;
  }
  if (ev.date_mode === "selected" && ev.datesList && ev.datesList.length > 0) {
    const n = ev.datesList.length;
    if (n === 1) return fmtEventDate(ev.datesList[0].event_date);
    const sorted = [...ev.datesList].sort((a, b) => a.event_date.localeCompare(b.event_date));
    return `${n} dates, ${fmtEventDateShort(sorted[0].event_date)} – ${fmtEventDateShort(sorted[n - 1].event_date)}`;
  }
  return ev.event_date ? fmtEventDate(ev.event_date) : "Date TBD";
}

// The time line for a card/detail view, covering all three date modes.
export function fmtEventTimeLabel(ev: Pick<EventRow, "date_mode" | "starts_at" | "ends_at" | "all_day" | "same_time_for_all_dates">): string {
  if (ev.date_mode === "single" && ev.all_day) return "All day";
  if (ev.date_mode === "range") {
    const range = fmtEventTimeRange(ev.starts_at, ev.ends_at);
    return range ? `${range} each day` : "";
  }
  if (ev.date_mode === "selected" && !ev.same_time_for_all_dates) return "Times vary";
  return fmtEventTimeRange(ev.starts_at, ev.ends_at);
}

// The resolved list of individual {date, starts_at, ends_at} occurrences
// an event actually happens on, regardless of mode — what "Add to
// calendar" needs to build one VEVENT per occurrence, and the one place
// "range" ever gets expanded into real dates.
export function getEventOccurrences(
  ev: Pick<EventRow, "date_mode" | "event_date" | "end_date" | "starts_at" | "ends_at" | "same_time_for_all_dates" | "datesList">
): { date: string; starts_at: string | null; ends_at: string | null }[] {
  if (ev.date_mode === "range" && ev.end_date) {
    const out: { date: string; starts_at: string | null; ends_at: string | null }[] = [];
    const [y, m, d] = ev.event_date.split("-").map(Number);
    const [ey, em, ed] = ev.end_date.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    const end = new Date(ey, em - 1, ed);
    // Safety cap — a mistyped end date shouldn't generate thousands of rows.
    for (let i = 0; i < 366 && cur <= end; i++) {
      const iso = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(cur.getDate()).padStart(2, "0")}`;
      out.push({ date: iso, starts_at: ev.starts_at, ends_at: ev.ends_at });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }
  if (ev.date_mode === "selected" && ev.datesList && ev.datesList.length > 0) {
    const sorted = [...ev.datesList].sort((a, b) => a.event_date.localeCompare(b.event_date));
    return sorted.map((d) => ({
      date: d.event_date,
      starts_at: ev.same_time_for_all_dates ? ev.starts_at : d.starts_at,
      ends_at: ev.same_time_for_all_dates ? ev.ends_at : d.ends_at,
    }));
  }
  return [{ date: ev.event_date, starts_at: ev.starts_at, ends_at: ev.ends_at }];
}

export type MarketRow = { id: string; name: string; location: string | null; schedule_text: string | null };

export async function getMyFarmMarkets(supabase: Client, farmId: string): Promise<MarketRow[]> {
  const { data } = await supabase.from("farm_markets").select("markets ( id, name, location, schedule_text )").eq("farm_id", farmId);
  return (data ?? []).map((r) => r.markets).filter((m): m is MarketRow => !!m);
}

export { type TodayStatusEnum };

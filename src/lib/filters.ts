import type { Database } from "@/lib/types/database";

export type Category = Database["public"]["Enums"]["category_t"];

// The real category_t enum values — these are what farms actually pick
// from during onboarding (1.9), so they're what the Filters screen's
// "What they offer" chips offer too, replacing the prototype's own
// OFFER_CHIPS list (which named a few categories, like 'Livestock' and
// 'Grain', that don't exist in the schema).
export const CATEGORY_OPTIONS: Category[] = [
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

export const DISTANCE_OPTIONS = ["5 mi", "15 mi", "30 mi"] as const;
export type Distance = (typeof DISTANCE_OPTIONS)[number];

export type Kind = "Farms" | "Markets";

export type BrowseFilters = {
  kind: Kind | null;
  categories: Category[];
  distance: Distance;
  readyOnly: boolean;
  openOnly: boolean;
};

export const EMPTY_FILTERS: BrowseFilters = {
  kind: null,
  categories: [],
  distance: "30 mi",
  readyOnly: false,
  openOnly: false,
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

// Parses the cat/open/ready/kind/dist query params shared by /, /map and
// /filters — the URL-carried equivalent of the prototype's S.filters.
export function parseBrowseFilters(sp: Record<string, string | string[] | undefined>): BrowseFilters {
  const kindParam = typeof sp.kind === "string" ? sp.kind : undefined;
  const distParam = typeof sp.dist === "string" ? sp.dist : undefined;
  return {
    kind: kindParam === "farms" ? "Farms" : kindParam === "markets" ? "Markets" : null,
    categories: toArray(sp.cat) as Category[],
    distance: distParam === "5" ? "5 mi" : distParam === "15" ? "15 mi" : "30 mi",
    readyOnly: sp.ready === "1",
    openOnly: sp.open === "1",
  };
}

export function buildBrowseQuery(filters: BrowseFilters): string {
  const params = new URLSearchParams();
  if (filters.kind === "Farms") params.set("kind", "farms");
  if (filters.kind === "Markets") params.set("kind", "markets");
  filters.categories.forEach((c) => params.append("cat", c));
  if (filters.distance !== "30 mi") params.set("dist", filters.distance === "5 mi" ? "5" : "15");
  if (filters.readyOnly) params.set("ready", "1");
  if (filters.openOnly) params.set("open", "1");
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Ports activeFilterChips() — the pill row on 2.9/2.10/2.12 and the filter
// badge count on mapControls(). The "How far" distance chip is included for
// display parity even though distance itself isn't filtered yet (see
// matchesBrowseFilters below) — it's still part of what the visitor chose
// and chips are how the Filters screen round-trips that choice.
export function activeFilterChips(filters: BrowseFilters): string[] {
  const chips: string[] = [];
  if (filters.kind) chips.push(filters.kind);
  chips.push(...filters.categories);
  if (filters.distance !== "30 mi") chips.push(filters.distance);
  if (filters.readyOnly) chips.push("Ready now");
  if (filters.openOnly) chips.push("Open now");
  return chips;
}

export type BrowseEntry = {
  kind: "farm" | "market";
  categories: string[];
  open: boolean;
  hasReadyProduct: boolean;
};

// Ports matchesFilters(). Distance is deliberately left unfiltered: the
// prototype's own matchesFilters() only ever compares entry.dist when it's
// non-null, and real farms don't have real coordinates yet (farms.lat/lng
// exist in the schema but nothing populates them — no geocoding API is
// configured) — so every real entry behaves like the prototype's
// dist==null case and passes regardless of the "How far" control. The
// control stays visible on the Filters screen for parity with the tested
// design; it just isn't a working filter until real geocoding exists.
export function matchesBrowseFilters(entry: BrowseEntry, filters: BrowseFilters): boolean {
  if (filters.kind === "Farms" && entry.kind !== "farm") return false;
  if (filters.kind === "Markets" && entry.kind !== "market") return false;
  if (filters.categories.length && !filters.categories.some((c) => entry.categories.includes(c))) return false;
  if (filters.readyOnly && !entry.hasReadyProduct) return false;
  if (filters.openOnly && !entry.open) return false;
  return true;
}

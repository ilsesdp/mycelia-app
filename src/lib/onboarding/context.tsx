"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];
type Unit = Database["public"]["Enums"]["unit_t"];
type Availability = "Ready now" | "Producing" | "Planning";
type Visibility = "Growers only" | "Only me";

export type ProductDraft = {
  name: string;
  category: Category | "";
  availability: Availability;
  qty: string;
  unit: Unit | "";
  roughlyWhen: string;
  photoFile: File | null;
  photoPreview: string | null;
};

export type MarketDraft = {
  name: string;
  location: string;
  day: string;
  hours: string;
};

export type TimeRange = { open: string; close: string };
// A day can now hold more than one range (split shifts, e.g. 9am–12pm and
// 3pm–7pm) — closed:true means the whole day is closed and ranges is
// ignored; otherwise ranges holds 1+ open/close pairs.
export type DayHours = { ranges: TimeRange[]; closed: boolean };

// The full shape of what onboarding collects across all ~10 prototype
// screens (1.2, 1.4–1.13). 2a only uses the first few fields; the rest are
// declared now so 2b/2c slot in without reshaping this type again.
export type OnboardingState = {
  // 1.2 — choose your path
  path: "grower" | null;

  // 1.4 / 1.5 — address lookup
  farmAddress: string;
  farmAddressVerified: boolean;
  addressSearching: boolean;
  // Real coordinates from Google's Geocoding API when the address resolves
  // (null otherwise — no API key configured, or the address didn't match).
  // This is what makes the map's "2.1 mi" a real computed distance instead
  // of nothing; see geo.ts/DistanceLabel.tsx.
  farmLat: number | null;
  farmLng: number | null;

  // 1.6 — farm details
  farmName: string;
  farmDirections: string;
  farmAbout: string;
  coverPhotoFile: File | null;
  coverPhotoPreview: string | null;

  // 1.7 — categories (2b)
  categories: Partial<Record<Category, boolean>>;

  // 1.8/1.9b — products (2b)
  products: (ProductDraft & { id: string })[];

  // 1.9 — hours (2c)
  hours: Record<string, DayHours>;
  hoursMode: "weekday" | "custom" | null;

  // 1.10/1.17 — markets (2c) — ids of DB markets picked, plus any drafted here
  selectedMarketIds: string[];
  addedMarkets: MarketDraft[];
  // Photos picked for a market created during onboarding, keyed by that
  // market's (already-real) id — the farm row these need to be uploaded
  // under doesn't exist until publishFarm() creates it, so the files just
  // wait here in memory until then (same deferred-upload story as the
  // farm's own cover/product photos).
  marketPhotoFiles: Record<string, File[]>;

  // 1.11 — reach preferences (2c)
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  emailVisibility: Visibility;
  phoneVisibility: Visibility;
  messageChannel: "Text me" | "Email me" | "Both";

  // 1.11 — website & social media (optional)
  farmWebsite: string;
  farmInstagram: string;
  farmFacebook: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function initialState(): OnboardingState {
  return {
    path: null,
    farmAddress: "",
    farmAddressVerified: false,
    addressSearching: false,
    farmLat: null,
    farmLng: null,
    farmName: "",
    farmDirections: "",
    farmAbout: "",
    coverPhotoFile: null,
    coverPhotoPreview: null,
    categories: {},
    products: [],
    hours: Object.fromEntries(DAYS.map((d) => [d, { ranges: [{ open: "9:00am", close: "5:00pm" }], closed: false }])),
    hoursMode: null,
    selectedMarketIds: [],
    addedMarkets: [],
    marketPhotoFiles: {},
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    emailVisibility: "Growers only",
    phoneVisibility: "Only me",
    messageChannel: "Text me",
    farmWebsite: "",
    farmInstagram: "",
    farmFacebook: "",
  };
}

type Ctx = {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

// In-memory only, same as the prototype's S object — no localStorage. A
// refresh mid-onboarding loses progress; that's the prototype's own
// deliberate reset story (see project_hifi_prototype.md), kept here too.
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const update = (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch }));
  return <OnboardingContext.Provider value={{ state, update }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

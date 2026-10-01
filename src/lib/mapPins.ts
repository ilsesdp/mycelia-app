// Ports pinState()/pinB64()/MAP_PINS' positioning from the prototype's
// map screens (2.1, 2.2, 2.10).

export type PinKind = "farm" | "market";
export type PinVisualState = "open" | "closed" | "closed-early";

// Mirrors the prototype's pinState(): a farm that's closed because its
// owner manually shortened today's hours gets 'closed-early' (clock-badge
// pin); a farm that's simply outside its normal weekly schedule gets plain
// 'closed'. Markets only ever go open/closed.
export function pinState(kind: PinKind, open: boolean, closedEarly: boolean): PinVisualState {
  if (kind === "farm" && !open && closedEarly) return "closed-early";
  return open ? "open" : "closed";
}

const PIN_SRC: Record<PinKind, Record<PinVisualState, string>> = {
  farm: {
    open: "/pins/pin-farm-open.svg",
    closed: "/pins/pin-farm-closed.svg",
    "closed-early": "/pins/pin-farm-closed-early.svg",
  },
  market: {
    open: "/pins/pin-market-open.svg",
    closed: "/pins/pin-market-closed.svg",
    // Markets have no stored hours/status yet (see map/page.tsx), so this
    // state is never actually reached today — kept only so the type stays
    // total. No separate "closed early" market asset exists; it would
    // fall back to plain closed if that ever changed.
    "closed-early": "/pins/pin-market-closed.svg",
  },
};

export function pinImageSrc(kind: PinKind, state: PinVisualState): string {
  return PIN_SRC[kind][state];
}

// The "You are here" marker uses its own pin shape (see MapArt's comment on
// ownFarm) but follows the exact same open/closed/closed-early states —
// blue when your farm is open, the same grey (with or without the clock
// badge for a manual hours change) as any other closed pin otherwise.
const YOU_PIN_SRC: Record<PinVisualState, string> = {
  open: "/pins/pin-you-open.svg",
  closed: "/pins/pin-you-closed.svg",
  "closed-early": "/pins/pin-you-closed-early.svg",
};

export function youPinImageSrc(state: PinVisualState): string {
  return YOU_PIN_SRC[state];
}

// The prototype's MAP_PINS hand-places each demo farm/market at a fixed
// (x, y) on the stylized map illustration — there's no real coordinate
// system behind it (see mapArt()'s own comment: "real vector terrain/roads
// not reproduced"). farms.lat/lng exist as DB columns for a future real
// geocoding integration, but nothing populates them yet (no Places/Geocoding
// API key is configured — see project_dev_handoff_audit.md), so a real
// farm's row has lat: null, lng: null today.
//
// Rather than fake coordinates we don't have, this derives a stable
// pseudo-position from the farm/market's own id — same farm always lands
// in the same spot on the map, spread out across the canvas, with no
// claim to geographic accuracy (matching the prototype's own "stylized
// approximation" of this map, not a downgrade from it).
export function pinPosition(id: string): { xPct: number; yPct: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  const a = h % 1000;
  const b = Math.floor(h / 1000) % 1000;
  // Keep clear of the search bar / controls up top and the legend / nav
  // bar down below.
  const xPct = 12 + (a / 999) * 70;
  const yPct = 18 + (b / 999) * 58;
  return { xPct, yPct };
}

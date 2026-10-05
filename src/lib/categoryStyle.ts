import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];

// Ported 1:1 from the prototype's swatchColor()/catBg()/catFg() helpers.
export function swatchColor(c: Category): string {
  const map: Partial<Record<Category, string>> = {
    Vegetables: "var(--cat-veg-fg)",
    Fruit: "#c0392b",
    Eggs: "var(--cat-egg-fg)",
    Dairy: "#d4b483",
    Honey: "var(--golden-500)",
    Flowers: "#21578b",
    Herbs: "#405d28",
    "Handmade Crafts": "var(--rich-earth-700)",
    "Baked Goods": "#a9722f",
    Seeds: "#604b80",
    "Fiber Goods": "#8a7968",
    Mushrooms: "#6e5a44",
    "Dry Goods": "#9c8a54",
  };
  return map[c] || "var(--border-default)";
}

// The prototype only ever special-cased Vegetables/Eggs here (hand-tuned
// token pairs) and left every other category on one flat gray chip — so a
// product's category chip didn't match its own dot color from 1.7/4.x
// anywhere except those two. Ilse asked for the chips to match the dots
// everywhere this pair is used (farm profile, filters, pin sheet, owner
// dashboard, onboarding), so every other category now derives its chip
// from the same color as its dot (swatchColor) instead of the gray
// fallback — Vegetables/Eggs keep their existing hand-tuned pair since
// those already matched and look right as-is.
export function catBg(c: string): string {
  if (c === "Vegetables") return "var(--cat-veg-bg)";
  if (c === "Eggs") return "var(--cat-egg-bg)";
  return `color-mix(in srgb, ${swatchColor(c as Category)} 16%, white)`;
}

export function catFg(c: string): string {
  if (c === "Vegetables") return "var(--cat-veg-fg)";
  if (c === "Eggs") return "var(--cat-egg-fg)";
  return swatchColor(c as Category);
}

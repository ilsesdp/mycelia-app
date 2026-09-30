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
    Meat: "var(--rich-earth-700)",
    "Baked goods": "#a9722f",
    Fiber: "#604b80",
  };
  return map[c] || "var(--border-default)";
}

export function catBg(c: string): string {
  return c === "Vegetables" ? "var(--cat-veg-bg)" : c === "Eggs" ? "var(--cat-egg-bg)" : "var(--bg-subtle)";
}

export function catFg(c: string): string {
  return c === "Vegetables" ? "var(--cat-veg-fg)" : c === "Eggs" ? "var(--cat-egg-fg)" : "var(--text-secondary)";
}

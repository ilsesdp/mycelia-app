import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];

// Pulled directly from the "category/*/bg" variables on the Roots Design
// System's "Image placeholder" component (Figma file 1bR88yQmcRCgFA5RXlkPRu,
// node 2487:6980) — these are the soft tile colors meant to stand in for a
// product photo, distinct from categoryStyle.ts's catBg()/swatchColor(),
// which are the more saturated chip/dot colors used elsewhere. The Figma
// component also has "grain" and "livestock" variants, but both live under
// a "_archive" group there and have no matching category_t value, so they're
// left out here.
const CATEGORY_PHOTO_BG: Record<Category, string> = {
  Vegetables: "#a0e2c5",
  Herbs: "#e0e5dd",
  Eggs: "#ffc3e4",
  Honey: "#fdf1e0",
  Flowers: "#dbe4ec",
  Fruit: "#f5dfdd",
  Dairy: "#f8f3eb",
  "Handmade Crafts": "#ebe2de",
  "Baked Goods": "#f1e8de",
  Seeds: "#e6e2eb",
  "Fiber Goods": "#eceae7",
  Mushrooms: "#e8e5e1",
  "Dry Goods": "#efece4",
};

// Ilse's own icon set (Figma components, same node), cropped/padded/resized
// to clean 256px PNGs at public/category-icons/.
const CATEGORY_PHOTO_ICON: Record<Category, string> = {
  Vegetables: "/category-icons/vegetables.png",
  Herbs: "/category-icons/herbs.png",
  Eggs: "/category-icons/eggs.png",
  Honey: "/category-icons/honey.png",
  Flowers: "/category-icons/flowers.png",
  Fruit: "/category-icons/fruit.png",
  Dairy: "/category-icons/dairy.png",
  "Handmade Crafts": "/category-icons/handmade-crafts.png",
  "Baked Goods": "/category-icons/baked-goods.png",
  Seeds: "/category-icons/seeds.png",
  "Fiber Goods": "/category-icons/fiber-goods.png",
  Mushrooms: "/category-icons/mushrooms.png",
  "Dry Goods": "/category-icons/dry-goods.png",
};

// Default tile for a product with no category (or one outside the enum) —
// matches the Figma component's own "Property 1=Default" state: the plain
// --bg-subtle fill, no icon.
export const DEFAULT_PHOTO_BG = "var(--bg-subtle)";

export function categoryPhotoBg(category: Category | null | undefined): string {
  return (category && CATEGORY_PHOTO_BG[category]) || DEFAULT_PHOTO_BG;
}

export function categoryPhotoIcon(category: Category | null | undefined): string | null {
  return (category && CATEGORY_PHOTO_ICON[category]) || null;
}

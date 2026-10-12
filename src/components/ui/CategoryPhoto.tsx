import type { Database } from "@/lib/types/database";
import { categoryPhotoBg, categoryPhotoIcon } from "@/lib/categoryPhoto";

type Category = Database["public"]["Enums"]["category_t"];

// Stands in for a product's photo until the farmer uploads one — ports the
// Roots Design System's "Image placeholder" component (Figma node
// 2487:6980): a tinted tile in the product's own category color, with that
// category's icon centered on it. Used wherever a product card already
// renders its own sized/rounded container (AvailRail, FarmPinSheet,
// ManageProductsList) — this fills that container; it doesn't set its own
// size or radius, so it matches whatever shape each of those calls for.
export function CategoryPhoto({ category, className, style }: { category: Category | null; className?: string; style?: React.CSSProperties }) {
  const icon = categoryPhotoIcon(category);
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        background: categoryPhotoBg(category),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" style={{ width: "42%", height: "42%", objectFit: "contain", display: "block" }} />
      )}
    </div>
  );
}

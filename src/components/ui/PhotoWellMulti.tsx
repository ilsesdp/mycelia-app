"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export type PhotoWellMultiItem = {
  key: string;
  url: string;
};

// Multi-photo counterpart to PhotoWell — the hero image on a market/event
// page is a carousel (see PhotoCarousel), so its owner-facing form needs to
// pick/remove *several* photos rather than one. `photos` is the combined,
// ordered list of already-saved photos (kept across an edit) and
// freshly-picked-but-not-yet-uploaded ones; the caller tells them apart by
// `key` (a real row id vs. a local id it minted) since upload/removal is
// handled differently for each.
export function PhotoWellMulti({
  photos,
  label,
  onAdd,
  onRemove,
}: {
  photos: PhotoWellMultiItem[];
  label: string;
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
      {photos.map((p) => (
        <div key={p.key} style={{ position: "relative", width: 88, height: 88, flexShrink: 0, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(p.key);
            }}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 22,
              height: 22,
              borderRadius: 999,
              background: "rgba(0,0,0,.55)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
            }}
            aria-label="Remove photo"
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}

      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: 88,
          height: 88,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          background: "var(--bg-subtle)",
          border: "1px dashed var(--border-default)",
          borderRadius: "var(--radius-lg)",
          cursor: "pointer",
          color: "var(--text-tertiary)",
          textAlign: "center",
          padding: 6,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
        <span className="caption" style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
          {photos.length ? "Add more" : label}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onAdd(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

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
  id,
}: {
  photos: PhotoWellMultiItem[];
  label: string;
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const input = (
    <input
      id={id}
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
  );

  return (
    <div>
      {photos.length > 0 && (
        <>
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
                    color: "var(--text-on-brand)",
                  }}
                  aria-label="Remove photo"
                >
                  <Icon name="close" size={13} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ height: 10 }} />
        </>
      )}

      {/* Full-width dashed button — same shape, padding and camera glyph as
          the farm's single cover-photo picker (PhotoWell's button variant)
          so this and every other "add a photo" affordance in the app line
          up with the rest of the form's fields/buttons, not a small tile. */}
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "24px 0",
          border: "1px dashed var(--border-default)",
          borderRadius: 12,
          background: "var(--bg-subtle)",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 14,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h3l2-2h6l2 2h3a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        {photos.length ? "Add more photos" : label}
        {input}
      </button>
    </div>
  );
}

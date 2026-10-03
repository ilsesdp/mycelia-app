"use client";

import { useRef } from "react";

// Ports photoWell() — button/row variants, "Change"/"Remove" overlay once a
// photo is picked. Real Storage upload happens at publish time (the farm
// row — and its id, which the storage path needs — doesn't exist until
// then), so this only reads the file into a local object URL for preview,
// same as the prototype's in-memory dataUrl.
export function PhotoWell({
  preview,
  label,
  variant = "button",
  onPick,
  onRemove,
  id,
}: {
  preview: string | null;
  label: string;
  variant?: "button" | "row";
  onPick: (file: File) => void;
  onRemove: () => void;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const height = variant === "row" ? 120 : 96;

  if (preview) {
    return (
      <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: 8,
            background: "linear-gradient(0deg, rgba(0,0,0,.45), transparent 55%)",
          }}
        >
          <button
            onClick={() => inputRef.current?.click()}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,.92)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
            }}
          >
            Change
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 999,
              background: "rgba(255,255,255,.92)",
              color: "var(--text-danger)",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
            }}
          >
            Remove
          </button>
        </div>
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
        />
      </div>
    );
  }

  const shared = (
    <input
      id={id}
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
    />
  );

  if (variant === "row") {
    return (
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          display: "flex",
          gap: 12,
          background: "var(--bg-subtle)",
          border: "1px dashed var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <span>+</span>
        <span className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </span>
        {shared}
      </div>
    );
  }

  return (
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
      {label}
      {shared}
    </button>
  );
}

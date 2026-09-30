"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";
import { swatchColor } from "@/lib/categoryStyle";
import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];

// Ports SCREENS['1.7'] — first screen of onboarding sub-batch 2b. Nothing
// starts pre-checked; Continue stays disabled until at least one category
// is picked, same as every other step in this flow.
const CATEGORIES: Category[] = [
  "Vegetables",
  "Fruit",
  "Eggs",
  "Dairy",
  "Honey",
  "Flowers",
  "Herbs",
  "Meat",
  "Baked goods",
  "Fiber",
];

export default function CategoriesPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [expanded, setExpanded] = useState(false);

  const shown = CATEGORIES.slice(0, 5);
  const rest = CATEGORIES.slice(5);
  const any = Object.values(state.categories).some(Boolean);

  function toggle(c: Category) {
    update({ categories: { ...state.categories, [c]: !state.categories[c] } });
  }

  function row(c: Category) {
    const selected = !!state.categories[c];
    return (
      <div key={c} className={`cat-row ${selected ? "selected" : ""}`} onClick={() => toggle(c)}>
        <div className="cat-swatch" style={{ background: swatchColor(c) }} />
        <span className="body-m" style={{ color: "var(--text-primary)" }}>
          {c}
        </span>
        <span className="cat-checkbox">{selected ? "✓" : ""}</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/farm" />
      <div className="px-6 pt-4 pb-8 flex-1 flex flex-col">
        <StepHeader step={3} title="What do you grow or make?" subtitle="Choose the categories that best describe what you offer." />
        <div>{shown.map(row)}</div>
        {!expanded ? (
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer" }}
            onClick={() => setExpanded(true)}
          >
            <span className="body-m" style={{ color: "var(--text-brand)" }}>
              See more
            </span>
            <span>↓</span>
          </div>
        ) : (
          <div>{rest.map(row)}</div>
        )}
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-6">
          <Button variant="primary" disabled={!any} onClick={() => router.push("/onboarding/products")}>
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}

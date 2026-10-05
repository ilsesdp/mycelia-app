"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { useOnboarding, type ProductDraft } from "@/lib/onboarding/context";
import { CATEGORIES, UNITS } from "@/lib/myFarm";
import type { Database } from "@/lib/types/database";

type Category = Database["public"]["Enums"]["category_t"];
type Unit = Database["public"]["Enums"]["unit_t"];

const AVAILABILITY: ProductDraft["availability"][] = ["Ready now", "Producing", "Planning"];

function emptyDraft(): ProductDraft {
  return {
    name: "",
    category: "",
    availability: "Ready now",
    qty: "",
    unit: "",
    roughlyWhen: "",
    photoFile: null,
    photoPreview: null,
  };
}

// Ports SCREENS['1.9b']. The prototype keeps one in-progress draft on S and
// pushes it onto S.products on save — mirrored here with local component
// state (the draft itself doesn't need to survive navigation away).
export default function NewProductPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft());

  // Only offer the categories the grower already picked on 1.7 — the full
  // list only applies if nothing was picked there (shouldn't happen, since
  // 1.7 requires at least one, but keeps this screen usable standalone).
  const availableCategories = CATEGORIES.filter((c) => state.categories[c]);
  const categoryChoices = availableCategories.length ? availableCategories : CATEGORIES;

  function patch(p: Partial<ProductDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function save() {
    update({ products: [...state.products, { ...draft, id: crypto.randomUUID(), category: draft.category || categoryChoices[0] }] });
    router.push("/onboarding/products");
  }

  const backHref = state.products.length ? "/onboarding/products" : "/onboarding/products";

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref={backHref} title="Add a product" />
      <div className="px-4 pt-4 pb-8 flex-1 flex flex-col">
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="product-name">
          What is your product?
        </label>
        <div style={{ height: 8 }} />
        <input id="product-name" className="field" placeholder="Heirloom tomatoes" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        <div style={{ height: 20 }} />

        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="product-category">
          What category is it?
        </label>
        <div style={{ height: 8 }} />
        <select id="product-category" className="field" value={draft.category} onChange={(e) => patch({ category: e.target.value as Category })}>
          <option value="">Choose one</option>
          {categoryChoices.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <div style={{ height: 20 }} />

        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          When is it available?
        </div>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {AVAILABILITY.map((a) => (
            <button key={a} className={draft.availability === a ? "active" : ""} onClick={() => patch({ availability: a })}>
              {a}
            </button>
          ))}
        </div>
        <div style={{ height: 20 }} />

        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          How much do you have?
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="product-qty">
              Quantity
            </label>
            <input id="product-qty" className="field" placeholder="20" value={draft.qty} onChange={(e) => patch({ qty: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="product-unit">
              Unit
            </label>
            <select id="product-unit" className="field" value={draft.unit} onChange={(e) => patch({ unit: e.target.value as Unit })}>
              <option value="">Choose one</option>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {(draft.availability === "Producing" || draft.availability === "Planning") && (
          <>
            <div style={{ height: 20 }} />
            <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="product-roughly-when">
              Roughly when
            </label>
            <div style={{ height: 8 }} />
            <input
              id="product-roughly-when"
              className="field"
              placeholder={draft.availability === "Planning" ? "next spring" : "about 3 weeks"}
              value={draft.roughlyWhen}
              onChange={(e) => patch({ roughlyWhen: e.target.value })}
            />
          </>
        )}

        <div style={{ height: 20 }} />
        <PhotoWell
          id="product-photo"
          preview={draft.photoPreview}
          label="Add a photo of the product"
          variant="row"
          onPick={(file) => patch({ photoFile: file, photoPreview: URL.createObjectURL(file) })}
          onRemove={() => patch({ photoFile: null, photoPreview: null })}
        />
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-10">
          <Button variant="primary" disabled={!draft.name} onClick={save}>
            Save product
          </Button>
        </div>
      </div>
    </main>
  );
}

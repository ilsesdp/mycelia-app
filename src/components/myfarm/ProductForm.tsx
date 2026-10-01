"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, UNITS, AVAILABILITY_DB, AVAILABILITY_DISPLAY, type ProductRow } from "@/lib/myFarm";
import type { Database } from "@/lib/types/database";

type Availability = "Ready now" | "Producing" | "Planning";

type Draft = {
  name: string;
  category: Database["public"]["Enums"]["category_t"] | "";
  availability: Availability;
  qty: string;
  unit: Database["public"]["Enums"]["unit_t"] | "";
  roughlyWhen: string;
  photoPreview: string | null;
};

function draftFromProduct(p: ProductRow): Draft {
  return {
    name: p.name,
    category: p.category ?? "",
    availability: AVAILABILITY_DISPLAY[p.availability],
    qty: p.qty ?? "",
    unit: p.unit ?? "",
    roughlyWhen: p.roughly_when ?? "",
    photoPreview: p.photo_url,
  };
}
const EMPTY_DRAFT: Draft = { name: "", category: "", availability: "Ready now", qty: "", unit: "", roughlyWhen: "", photoPreview: null };

async function uploadProductPhoto(supabase: ReturnType<typeof createClient>, farmId: string, productId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/products/${productId}.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Ports productFormShell() — shared by 4.4 (edit), 4.5 (add), with 4.12
// (delete) and 4.14 (discard changes) as confirm sheets over it.
export function ProductForm({ farmId, product }: { farmId: string; product: ProductRow | null }) {
  const supabase = createClient();
  const router = useRouter();
  const isEdit = !!product;
  const initial = product ? draftFromProduct(product) : EMPTY_DRAFT;
  const [draft, setDraft] = useState<Draft>(initial);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial) || !!photoFile;

  function handleBack() {
    if (isEdit && dirty) {
      setShowDiscard(true);
      return;
    }
    router.push(isEdit ? "/my-farm/products" : "/my-farm/products");
  }

  async function save() {
    if (!draft.name || saving) return;
    setSaving(true);
    const productId = product?.id ?? crypto.randomUUID();
    let photoUrl = draft.photoPreview;
    if (photoFile) {
      photoUrl = await uploadProductPhoto(supabase, farmId, productId, photoFile);
    }
    const row = {
      id: productId,
      farm_id: farmId,
      name: draft.name,
      category: draft.category || null,
      availability: AVAILABILITY_DB[draft.availability],
      qty: draft.qty || null,
      unit: draft.unit || null,
      roughly_when: draft.roughlyWhen || null,
      photo_url: photoUrl,
    };
    await supabase.from("products").upsert(row);
    setSaving(false);
    router.push(`/my-farm/products?saved=${encodeURIComponent(draft.name + " saved")}`);
  }

  async function doDelete() {
    if (!product || deleting) return;
    setDeleting(true);
    await supabase.from("products").delete().eq("id", product.id);
    router.push("/my-farm/products");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <div className="appbar">
        <a className="back" onClick={handleBack}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>&lsaquo;</span>My farm
        </a>
        <div className="titlebar">{isEdit ? "Edit a product" : "Add a product"}</div>
        <div style={{ width: 84 }} />
      </div>
      <div className="px-4" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What is your product?
        </div>
        <div style={{ height: 8 }} />
        <input className="field" placeholder="e.g. Heirloom tomatoes" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What category is it?
        </div>
        <div style={{ height: 8 }} />
        <select
          className="field"
          style={{ color: draft.category ? "var(--text-primary)" : "var(--text-tertiary)" }}
          value={draft.category}
          onChange={(e) => patch({ category: e.target.value as Draft["category"] })}
        >
          <option value="">Choose one</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          When is it available?
        </div>
        <div style={{ height: 8 }} />
        <div className="segmented">
          {(["Ready now", "Producing", "Planning"] as Availability[]).map((o) => (
            <button key={o} className={draft.availability === o ? "active" : ""} onClick={() => patch({ availability: o })}>
              {o}
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
            <div className="caption" style={{ marginBottom: 4 }}>
              Quantity
            </div>
            <input className="field" placeholder="0" value={draft.qty} onChange={(e) => patch({ qty: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Unit
            </div>
            <select
              className="field"
              style={{ color: draft.unit ? "var(--text-primary)" : "var(--text-tertiary)" }}
              value={draft.unit}
              onChange={(e) => patch({ unit: e.target.value as Draft["unit"] })}
            >
              <option value="">Choose</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(draft.availability === "Producing" || draft.availability === "Planning") && (
          <>
            <div style={{ height: 20 }} />
            <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
              Roughly when
            </div>
            <div style={{ height: 8 }} />
            <input
              className="field"
              placeholder={draft.availability === "Planning" ? "next spring" : "about 3 weeks"}
              value={draft.roughlyWhen}
              onChange={(e) => patch({ roughlyWhen: e.target.value })}
            />
          </>
        )}

        <div style={{ height: 20 }} />
        <PhotoWell
          preview={draft.photoPreview}
          label="Add a photo of the product"
          variant="row"
          onPick={(file) => {
            setPhotoFile(file);
            patch({ photoPreview: URL.createObjectURL(file) });
          }}
          onRemove={() => {
            setPhotoFile(null);
            patch({ photoPreview: null });
          }}
        />

        <div style={{ height: 28 }} />
        <button className="btn btn-primary" disabled={!draft.name || saving} onClick={save}>
          {saving ? "Saving…" : "Save product"}
        </button>
        {isEdit && (
          <>
            <div style={{ height: 24 }} />
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
              Delete product
            </button>
          </>
        )}
      </div>

      {showDelete && (
        <ConfirmSheet
          title={`Delete ${draft.name || "this product"}?`}
          body="It comes off your farm page straight away. Your other products stay exactly as they are."
          confirmLabel="Delete product"
          cancelLabel="Keep it"
          busy={deleting}
          onConfirm={doDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showDiscard && (
        <ConfirmSheet
          title="Discard your changes?"
          body="Your product stays exactly as it was. Nothing you typed here is saved."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          onConfirm={() => router.push("/my-farm/products")}
          onCancel={() => setShowDiscard(false)}
        />
      )}
    </main>
  );
}

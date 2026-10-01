"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { useOnboarding, type MarketDraft } from "@/lib/onboarding/context";
import { createClient } from "@/lib/supabase/client";

function emptyDraft(): MarketDraft {
  return { name: "", location: "", day: "", hours: "", photoFile: null, photoPreview: null };
}

// Ports SCREENS['1.17']. The prototype pushes onto an in-memory MARKETS
// array; this inserts a real row into public.markets (authenticated-insert
// RLS) so it has a real id to select, then adds it to this onboarding
// session's picked list.
export default function NewMarketPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const supabase = createClient();
  const [draft, setDraft] = useState<MarketDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<MarketDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const schedule_text = [draft.day, draft.hours].filter(Boolean).join(" ");
    const { data, error } = await supabase
      .from("markets")
      .insert({ name: draft.name, location: draft.location || null, schedule_text: schedule_text || null })
      .select("id")
      .single();
    setSaving(false);
    if (error || !data) {
      setError(error?.message ?? "Couldn't add that market.");
      return;
    }
    // The insert above already put this market in the real `markets` table,
    // so the picker's server-side fetch will list it on its own next
    // render — only the selection needs tracking here. (Keeping a second,
    // locally-rendered copy alongside that fetch was what caused the new
    // market to show up twice.)
    update({ selectedMarketIds: [...state.selectedMarketIds, data.id] });
    router.push("/onboarding/markets");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/markets" backLabel="Markets" title="Add a market" />
      <div className="px-6 pt-4 pb-8 flex-1 flex flex-col">
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What is the market called?
        </label>
        <div style={{ height: 8 }} />
        <input className="field" placeholder="Stephenson County Market" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        <div style={{ height: 20 }} />

        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          Where is it?
        </label>
        <div style={{ height: 8 }} />
        <input
          className="field"
          placeholder="Chicago Ave & Spring St, Freeport IL"
          value={draft.location}
          onChange={(e) => patch({ location: e.target.value })}
        />
        <div style={{ height: 20 }} />

        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          When is it open?
        </label>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Day
            </div>
            <input className="field" placeholder="Saturdays" value={draft.day} onChange={(e) => patch({ day: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Hours
            </div>
            <input className="field" placeholder="8am – 1pm" value={draft.hours} onChange={(e) => patch({ hours: e.target.value })} />
          </div>
        </div>
        <div style={{ height: 20 }} />
        <PhotoWell
          preview={draft.photoPreview}
          label="Add a photo of the market"
          variant="row"
          onPick={(file) => patch({ photoFile: file, photoPreview: URL.createObjectURL(file) })}
          onRemove={() => patch({ photoFile: null, photoPreview: null })}
        />
        {error && <p className="hint-error">{error}</p>}
        <div style={{ flex: 1 }} />
        <div className="pb-6 pt-10">
          <Button variant="primary" disabled={!draft.name || saving} onClick={save}>
            {saving ? "Adding…" : "Add market"}
          </Button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { ComboField } from "@/components/ui/ComboField";
import { useOnboarding, type MarketDraft } from "@/lib/onboarding/context";
import { createClient } from "@/lib/supabase/client";
import { DAY_OPTIONS, HOURS_OPTIONS, dayOfWeekFromLabel, parseHoursRange } from "@/lib/marketSchedule";

function emptyDraft(): MarketDraft {
  return { name: "", location: "", day: "", hours: "" };
}

// Same real geocoding as the farm's own address (see
// src/lib/googleGeocode.ts) — gives this market's page a real "X mi"
// instead of nothing.
async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const { result } = (await res.json()) as { result: { lat: number; lng: number } | null };
    return result;
  } catch {
    return null;
  }
}

type NewPhoto = { file: File; preview: string };

// Ports SCREENS['1.17']. The prototype pushes onto an in-memory MARKETS
// array; this inserts a real row into public.markets (authenticated-insert
// RLS) so it has a real id to select, then adds it to this onboarding
// session's picked list.
export default function NewMarketPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const supabase = createClient();
  const [draft, setDraft] = useState<MarketDraft>(emptyDraft());
  const [photo, setPhoto] = useState<NewPhoto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<MarketDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    const schedule_text = [draft.day, draft.hours].filter(Boolean).join(" ");
    const day_of_week = draft.day ? dayOfWeekFromLabel(draft.day) : null;
    const parsedHours = draft.hours ? parseHoursRange(draft.hours) : null;
    const coords = draft.location ? await geocode(draft.location) : null;
    const { data, error } = await supabase
      .from("markets")
      .insert({
        name: draft.name,
        location: draft.location || null,
        schedule_text: schedule_text || null,
        day_of_week,
        open_time: parsedHours?.open_time ?? null,
        close_time: parsedHours?.close_time ?? null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
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
    // market to show up twice.) Any photos picked here can't be uploaded
    // yet — there's no farm id until publishFarm() creates one — so it
    // rides along in marketPhotoFiles and gets uploaded then.
    update({
      selectedMarketIds: [...state.selectedMarketIds, data.id],
      marketPhotoFiles: { ...state.marketPhotoFiles, [data.id]: photo ? [photo.file] : [] },
    });
    router.push("/onboarding/markets");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/markets" backLabel="Markets" title="Add a market" />
      <div className="px-6 pt-4 pb-8 flex-1 flex flex-col">
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="market-name">
          What is the market called?
        </label>
        <div style={{ height: 8 }} />
        <input id="market-name" className="field" placeholder="Stephenson County Market" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
        <div style={{ height: 20 }} />

        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="market-location">
          Where is it?
        </label>
        <div style={{ height: 8 }} />
        <input
          id="market-location"
          className="field"
          placeholder="123 Main St, Freeport, IL 61032"
          value={draft.location}
          onChange={(e) => patch({ location: e.target.value })}
        />
        <div style={{ height: 20 }} />

        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          When is it open?
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="market-day">
              Day
            </label>
            <ComboField id="market-day" options={DAY_OPTIONS} placeholder="Saturdays" value={draft.day} onChange={(v) => patch({ day: v })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="market-hours">
              Hours
            </label>
            <ComboField id="market-hours" options={HOURS_OPTIONS} placeholder="9:00am - 1:30pm" value={draft.hours} onChange={(v) => patch({ hours: v })} />
          </div>
        </div>
        <div style={{ height: 20 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="market-photo">
          Photos
        </label>
        <div style={{ height: 8 }} />
        <PhotoWell
          id="market-photo"
          preview={photo?.preview ?? null}
          label="Add a photo of the market"
          onPick={(file) => setPhoto({ file, preview: URL.createObjectURL(file) })}
          onRemove={() => setPhoto(null)}
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

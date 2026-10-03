"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWellMulti } from "@/components/ui/PhotoWellMulti";
import { ComboField } from "@/components/ui/ComboField";
import { createClient } from "@/lib/supabase/client";
import { DAY_OPTIONS, HOURS_OPTIONS, dayOfWeekFromLabel, parseHoursRange } from "@/lib/marketSchedule";

type NewPhoto = { key: string; file: File; preview: string };

async function uploadMarketPhoto(supabase: ReturnType<typeof createClient>, farmId: string, marketId: string, index: number, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/markets/${marketId}/${index}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file);
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Same real geocoding onboarding/Edit profile use for a farm's address
// (see src/lib/googleGeocode.ts) — gives the market page's "2.1 mi" a real
// distance instead of nothing.
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

export function AddMarketForm({ farmId }: { farmId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [day, setDay] = useState("");
  const [hours, setHours] = useState("");
  const [photos, setPhotos] = useState<NewPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name || saving) return;
    setSaving(true);
    setError(null);
    const schedule_text = [day, hours].filter(Boolean).join(" ");
    const day_of_week = day ? dayOfWeekFromLabel(day) : null;
    const parsedHours = hours ? parseHoursRange(hours) : null;
    const coords = location ? await geocode(location) : null;
    const { data, error: insertError } = await supabase
      .from("markets")
      .insert({
        name,
        location: location || null,
        schedule_text: schedule_text || null,
        day_of_week,
        open_time: parsedHours?.open_time ?? null,
        close_time: parsedHours?.close_time ?? null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      })
      .select("id")
      .single();
    if (insertError || !data) {
      setSaving(false);
      setError(insertError?.message ?? "Couldn't add that market.");
      return;
    }
    const { error: linkError } = await supabase.from("farm_markets").insert({ farm_id: farmId, market_id: data.id });
    if (linkError) {
      setSaving(false);
      setError(linkError.message);
      return;
    }
    for (const [i, p] of photos.entries()) {
      const url = await uploadMarketPhoto(supabase, farmId, data.id, i, p.file);
      if (url) await supabase.from("market_photos").insert({ market_id: data.id, url, sort_order: i });
    }
    setSaving(false);
    router.push("/my-farm/markets");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/my-farm/markets" title="Add a market" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What is the market called?
        </div>
        <div style={{ height: 8 }} />
        <input className="field" placeholder="Stephenson County Market" value={name} onChange={(e) => setName(e.target.value)} />

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          Where is it?
        </div>
        <div style={{ height: 8 }} />
        <input className="field" placeholder="Chicago Ave & Spring St, Freeport IL" value={location} onChange={(e) => setLocation(e.target.value)} />

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          When is it open?
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Day
            </div>
            <ComboField options={DAY_OPTIONS} placeholder="Saturdays" value={day} onChange={setDay} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Hours
            </div>
            <ComboField options={HOURS_OPTIONS} placeholder="9:00am - 1:30pm" value={hours} onChange={setHours} />
          </div>
        </div>

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          Photos
        </div>
        <div style={{ height: 8 }} />
        <PhotoWellMulti
          photos={photos.map((p) => ({ key: p.key, url: p.preview }))}
          label="Add photos of the market"
          onAdd={(files) => setPhotos((ps) => [...ps, ...files.map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }))])}
          onRemove={(key) => setPhotos((ps) => ps.filter((p) => p.key !== key))}
        />

        {error && <p className="hint-error">{error}</p>}
        <div style={{ height: 28 }} />
        <button className="btn btn-primary" disabled={!name || saving} onClick={save}>
          {saving ? "Adding…" : "Add market"}
        </button>
      </div>
    </main>
  );
}

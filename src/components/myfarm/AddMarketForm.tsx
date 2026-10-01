"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { createClient } from "@/lib/supabase/client";

export function AddMarketForm({ farmId }: { farmId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [day, setDay] = useState("");
  const [hours, setHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name || saving) return;
    setSaving(true);
    setError(null);
    const schedule_text = [day, hours].filter(Boolean).join(" ");
    const { data, error: insertError } = await supabase
      .from("markets")
      .insert({ name, location: location || null, schedule_text: schedule_text || null })
      .select("id")
      .single();
    if (insertError || !data) {
      setSaving(false);
      setError(insertError?.message ?? "Couldn't add that market.");
      return;
    }
    const { error: linkError } = await supabase.from("farm_markets").insert({ farm_id: farmId, market_id: data.id });
    setSaving(false);
    if (linkError) {
      setError(linkError.message);
      return;
    }
    router.push("/my-farm/markets");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/my-farm/markets" title="Add a market" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: 24 }}>
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
            <input className="field" placeholder="Saturdays" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Hours
            </div>
            <input className="field" placeholder="8am – 1pm" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>

        {error && <p className="hint-error">{error}</p>}
        <div style={{ height: 28 }} />
        <button className="btn btn-primary" disabled={!name || saving} onClick={save}>
          {saving ? "Adding…" : "Add market"}
        </button>
      </div>
    </main>
  );
}

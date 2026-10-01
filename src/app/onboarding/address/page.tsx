"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";

// Ports SCREENS['1.4']. Real lookup via Google's Geocoding API (see
// src/lib/googleGeocode.ts and the /api/geocode route it's called through)
// — "found" now means the address actually resolved to a real lat/lng, not
// a match against a fixed demo list. Without GOOGLE_MAPS_API_KEY configured
// (see googleGeocode.ts's own comment), every search comes back "not
// found," which still leaves the grower able to continue and fill in
// everything themselves, same as a genuinely unmapped farm would.
export default function AddressPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState(state.farmAddress);

  async function search() {
    if (!(address && address.trim().length > 3)) return;
    setSearching(true);
    let found = false;
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { result } = (await res.json()) as {
        result: { lat: number; lng: number; formattedAddress: string } | null;
      };
      found = !!result;
      update({
        farmAddress: result?.formattedAddress || address,
        farmAddressVerified: found,
        farmLat: result?.lat ?? null,
        farmLng: result?.lng ?? null,
      });
    } catch {
      update({ farmAddress: address, farmAddressVerified: false, farmLat: null, farmLng: null });
    }
    setSearching(false);
    router.push("/onboarding/address-result");
  }

  if (searching) {
    return (
      <main className="min-h-screen flex flex-col">
        <AppBar backHref="/onboarding/path" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "3px solid var(--border-subtle)",
              borderTopColor: "var(--interactive-primary)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div className="body-m" style={{ color: "var(--text-secondary)" }}>
            Searching Google Maps…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/path" />
      <div className="px-6 pt-4">
        <StepHeader
          step={1}
          title="Where's your farm?"
          subtitle="We'll check Google Maps for your address. If it's not there, that's fine — you can add everything yourself."
        />
        <label className="label-caps">Farm address</label>
        <div style={{ height: 4 }} />
        <input
          className="field"
          placeholder="1420 Willow Creek Rd, Pecatonica, IL"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="off"
        />
        <div style={{ height: 16 }} />
        <Button variant="primary" disabled={!(address && address.trim().length > 3)} onClick={search}>
          Search
        </Button>
      </div>
    </main>
  );
}

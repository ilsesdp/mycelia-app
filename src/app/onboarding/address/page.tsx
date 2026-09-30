"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { useOnboarding } from "@/lib/onboarding/context";

// Ports SCREENS['1.4']. Still a demo lookup against a fixed address list,
// same as the tested prototype — there's no Google Places API key
// configured for this project yet (tracked in project_dev_handoff_audit.md
// as a pending integration), so this isn't a downgrade from what shipped
// before, just not yet upgraded to the real thing.
const DEMO_ADDRESSES = [
  "1420 Willow Creek Rd, Pecatonica, IL",
  "118 Willow Creek Rd, Pecatonica, IL",
  "2210 Maple Row Ln, Freeport, IL",
  "75 Birch Lane, Rockford, IL",
  "340 Hollow Creek Dr, Byron, IL",
  "812 Sunrise Orchard Rd, Winnebago, IL",
  "56 County Road 9, Stillman Valley, IL",
];

function findAddressMatch(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return null;
  return DEMO_ADDRESSES.find((a) => a.toLowerCase().includes(query)) || null;
}

export default function AddressPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [searching, setSearching] = useState(false);
  const [address, setAddress] = useState(state.farmAddress);

  function search() {
    if (!(address && address.trim().length > 3)) return;
    setSearching(true);
    setTimeout(() => {
      const match = findAddressMatch(address);
      update({
        farmAddress: match || address,
        farmAddressVerified: !!match,
      });
      setSearching(false);
      router.push("/onboarding/address-result");
    }, 900);
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

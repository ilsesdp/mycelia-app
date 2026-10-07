"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { useOnboarding } from "@/lib/onboarding/context";
import { capitalizeFirst } from "@/lib/text";

// Ports SCREENS['1.6'] — now the first screen of onboarding (Ilse's call,
// 2026-10-07): the address-lookup step (1.4/1.5) is gone, since confirming
// it against Google Maps meant a paid geocoding call this phase isn't
// taking on, so the address field moved here and growers fill in every
// field themselves rather than searching/confirming first.
export default function FarmDetailsPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  function pickCover(file: File) {
    update({ coverPhotoFile: file, coverPhotoPreview: URL.createObjectURL(file) });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/path" />
      <div className="px-4 pt-4 pb-8">
        <StepHeader step={1} title="Tell us about your farm" subtitle="Start with the basics. You can update these details anytime." />

        <label className="label-caps" htmlFor="farm-name">
          Farm name
        </label>
        <div style={{ height: 4 }} />
        <input
          id="farm-name"
          className="field"
          placeholder="Willow Creek Farm"
          value={state.farmName}
          onChange={(e) => update({ farmName: capitalizeFirst(e.target.value) })}
        />
        <div style={{ height: 16 }} />

        <label className="label-caps" htmlFor="farm-address">
          Address
        </label>
        <div style={{ height: 4 }} />
        <input
          id="farm-address"
          className="field"
          placeholder="1420 Willow Creek Rd, Pecatonica, IL"
          value={state.farmAddress}
          onChange={(e) => update({ farmAddress: e.target.value })}
        />
        <div style={{ height: 12 }} />

        <label className="label-caps" htmlFor="farm-directions">
          Directions
        </label>
        <div style={{ height: 4 }} />
        <textarea
          id="farm-directions"
          className="field"
          style={{ height: 60, resize: "none" }}
          placeholder="Anything that helps people find you"
          value={state.farmDirections}
          onChange={(e) => update({ farmDirections: capitalizeFirst(e.target.value) })}
        />
        <div style={{ height: 12 }} />

        <label className="label-caps" htmlFor="farm-about">
          About the farm
        </label>
        <div style={{ height: 12 }} />
        <textarea
          id="farm-about"
          className="field"
          style={{ height: 60, resize: "none" }}
          placeholder="Tell people a little about your farm"
          value={state.farmAbout}
          onChange={(e) => update({ farmAbout: capitalizeFirst(e.target.value) })}
        />
        <div style={{ height: 12 }} />

        <label className="label-caps" htmlFor="farm-cover-photo">
          Cover photo
        </label>
        <div style={{ height: 4 }} />
        <PhotoWell
          id="farm-cover-photo"
          preview={state.coverPhotoPreview}
          label="Add a cover photo"
          onPick={pickCover}
          onRemove={() => update({ coverPhotoFile: null, coverPhotoPreview: null })}
        />
        <div style={{ height: 40 }} />

        <Button variant="primary" disabled={!state.farmName} onClick={() => router.push("/onboarding/categories")}>
          Continue
        </Button>
      </div>
    </main>
  );
}

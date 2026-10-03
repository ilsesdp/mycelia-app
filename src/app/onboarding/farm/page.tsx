"use client";

import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { StepHeader } from "@/components/ui/StepHeader";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { useOnboarding } from "@/lib/onboarding/context";

// Ports SCREENS['1.6'] — last screen in onboarding sub-batch 2a. "Continue"
// goes to /onboarding/categories (1.7), which is 2b and doesn't exist yet;
// it 404s until that batch lands, same as clicking past the end of any
// work-in-progress flow.
export default function FarmDetailsPage() {
  const router = useRouter();
  const { state, update } = useOnboarding();

  function pickCover(file: File) {
    update({ coverPhotoFile: file, coverPhotoPreview: URL.createObjectURL(file) });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/onboarding/address-result" />
      <div className="px-6 pt-4 pb-8">
        <StepHeader step={2} title="Your farm" />

        <label className="label-caps" htmlFor="farm-name">
          Farm name
        </label>
        <div style={{ height: 4 }} />
        <input
          id="farm-name"
          className="field"
          placeholder="Willow Creek Farm"
          value={state.farmName}
          onChange={(e) => update({ farmName: e.target.value })}
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
          placeholder="Where to park, any other signal to let people know how to get there"
          value={state.farmDirections}
          onChange={(e) => update({ farmDirections: e.target.value })}
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
          placeholder="About your farm"
          value={state.farmAbout}
          onChange={(e) => update({ farmAbout: e.target.value })}
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

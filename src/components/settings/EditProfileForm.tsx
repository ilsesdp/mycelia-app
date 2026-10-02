"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { createClient } from "@/lib/supabase/client";

async function uploadCoverPhoto(supabase: ReturnType<typeof createClient>, farmId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/cover.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Re-resolves the farm's real lat/lng through the same Google Geocoding API
// route onboarding's address search uses (see src/lib/googleGeocode.ts) —
// so editing the address here keeps the map's real "2.1 mi" distance
// accurate instead of leaving it pointed at wherever the farm used to be.
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

export function EditProfileForm({
  farmId,
  initialName,
  initialAddress,
  initialAbout,
  initialContactName,
  initialCoverPhotoUrl,
}: {
  farmId: string;
  initialName: string;
  initialAddress: string;
  initialAbout: string;
  initialContactName: string;
  initialCoverPhotoUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);
  const [about, setAbout] = useState(initialAbout);
  const [contactName, setContactName] = useState(initialContactName);
  const [coverPreview, setCoverPreview] = useState(initialCoverPhotoUrl);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    let coverPhotoUrl = coverPreview;
    if (coverFile) {
      coverPhotoUrl = await uploadCoverPhoto(supabase, farmId, coverFile);
    }

    // Only re-geocode when the address text actually changed — no point
    // spending an API call to re-resolve coordinates that are already right.
    const addressChanged = address.trim() !== initialAddress.trim();
    const coords = addressChanged ? await geocode(address) : null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await Promise.all([
      supabase
        .from("farms")
        .update({
          name,
          address,
          about,
          cover_photo_url: coverPhotoUrl,
          ...(addressChanged ? { lat: coords?.lat ?? null, lng: coords?.lng ?? null } : {}),
        })
        .eq("id", farmId),
      user ? supabase.from("profiles").update({ contact_name: contactName }).eq("id", user.id) : Promise.resolve(),
    ]);

    setSaving(false);
    router.push("/settings?saved=Profile saved");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Edit profile" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24, display: "flex", flexDirection: "column" }}>
        <div className="label-caps">Farm name</div>
        <div style={{ height: 6 }} />
        <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
        <div style={{ height: 18 }} />

        <div className="label-caps">Address</div>
        <div style={{ height: 6 }} />
        <input className="field" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div style={{ height: 18 }} />

        <div className="label-caps">About the farm</div>
        <div style={{ height: 6 }} />
        <textarea
          className="field"
          placeholder="A sentence or two about your farm"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
        <div style={{ height: 18 }} />

        <div className="label-caps">Who to ask for</div>
        <div style={{ height: 6 }} />
        <input className="field" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <div style={{ height: 18 }} />

        <div className="label-caps">Cover photo</div>
        <div style={{ height: 6 }} />
        <PhotoWell
          preview={coverPreview}
          label="Add a cover photo"
          onPick={(file) => {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
          }}
          onRemove={() => {
            setCoverFile(null);
            setCoverPreview(null);
          }}
        />
        <div style={{ height: 20 }} />

        <button className="btn btn-primary" onClick={save} disabled={!name || saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

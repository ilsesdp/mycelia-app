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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await Promise.all([
      supabase.from("farms").update({ name, address, about, cover_photo_url: coverPhotoUrl }).eq("id", farmId),
      user ? supabase.from("profiles").update({ contact_name: contactName }).eq("id", user.id) : Promise.resolve(),
    ]);

    setSaving(false);
    router.push("/settings");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Edit profile" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, paddingBottom: 24, overflowY: "auto" }}>
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
        <div style={{ height: 24 }} />

        <button className="btn btn-primary" onClick={save} disabled={!name || saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

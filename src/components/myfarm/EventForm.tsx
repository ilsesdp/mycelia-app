"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWell } from "@/components/ui/PhotoWell";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/myFarm";

type Draft = { name: string; date: string; startsAt: string; endsAt: string; notes: string; photoPreview: string | null };

function draftFromEvent(ev: EventRow): Draft {
  return { name: ev.name, date: ev.event_date, startsAt: ev.starts_at ?? "", endsAt: ev.ends_at ?? "", notes: ev.notes ?? "", photoPreview: ev.photo_url };
}
const EMPTY: Draft = { name: "", date: "", startsAt: "", endsAt: "", notes: "", photoPreview: null };

async function uploadEventPhoto(supabase: ReturnType<typeof createClient>, farmId: string, eventId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/events/${eventId}.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Ports SCREENS['4.16'] (add/edit) + SCREENS['4.24'] (delete confirm, as a
// sheet over this form). The prototype's custom calendar-grid dropdown for
// "What day is it?" is a native date input here — same real date, a plainer
// control; worth a design pass if Ilse wants the inline calendar back.
export function EventForm({ farmId, event, backTo }: { farmId: string; event: EventRow | null; backTo: string }) {
  const supabase = createClient();
  const router = useRouter();
  const isEdit = !!event;
  const [draft, setDraft] = useState<Draft>(event ? draftFromEvent(event) : EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function patch(p: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  const backHref = `/my-farm/events${backTo === "manage" ? "/manage" : ""}`;

  const canSave = !!draft.name && !!draft.date;

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    const eventId = event?.id ?? crypto.randomUUID();
    let photoUrl = draft.photoPreview;
    if (photoFile) photoUrl = await uploadEventPhoto(supabase, farmId, eventId, photoFile);
    await supabase.from("events").upsert({
      id: eventId,
      farm_id: farmId,
      name: draft.name,
      event_date: draft.date,
      starts_at: draft.startsAt || null,
      ends_at: draft.endsAt || null,
      notes: draft.notes || null,
      photo_url: photoUrl,
    });
    setSaving(false);
    router.push(backHref);
  }

  async function doDelete() {
    if (!event || deleting) return;
    setDeleting(true);
    await supabase.from("events").delete().eq("id", event.id);
    router.push(backHref);
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref={backHref} backLabel="Events" title={isEdit ? "Edit an event" : "Add an event"} />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, overflowY: "auto", paddingBottom: 24 }}>
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What is the event?
        </div>
        <div style={{ height: 8 }} />
        <input className="field" placeholder="e.g. Apple Pressing Day" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What day is it?
        </div>
        <div style={{ height: 8 }} />
        <input className="field" type="date" value={draft.date} onChange={(e) => patch({ date: e.target.value })} />

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What time?
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Starts
            </div>
            <input className="field" placeholder="9am" value={draft.startsAt} onChange={(e) => patch({ startsAt: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="caption" style={{ marginBottom: 4 }}>
              Ends
            </div>
            <input className="field" placeholder="2pm" value={draft.endsAt} onChange={(e) => patch({ endsAt: e.target.value })} />
          </div>
        </div>

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          Anything people should know?
        </div>
        <div style={{ height: 8 }} />
        <textarea className="field" style={{ height: 60 }} placeholder="What to expect, what to bring, where to park" value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} />

        <div style={{ height: 20 }} />
        <PhotoWell
          preview={draft.photoPreview}
          label="Add a photo of the event"
          variant="row"
          onPick={(file) => {
            setPhotoFile(file);
            patch({ photoPreview: URL.createObjectURL(file) });
          }}
          onRemove={() => {
            setPhotoFile(null);
            patch({ photoPreview: null });
          }}
        />

        <div style={{ height: 28 }} />
        <button className="btn btn-primary" disabled={!canSave || saving} onClick={save}>
          {saving ? "Saving…" : "Save event"}
        </button>
        {isEdit && (
          <>
            <div style={{ height: 24 }} />
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
              Delete event
            </button>
          </>
        )}
      </div>

      {showDelete && (
        <ConfirmSheet
          title={`Delete ${draft.name || "this event"}?`}
          body="It comes off your events list straight away. This cannot be undone."
          confirmLabel="Delete event"
          cancelLabel="Keep it"
          busy={deleting}
          onConfirm={doDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </main>
  );
}

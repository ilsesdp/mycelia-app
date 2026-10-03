"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWellMulti } from "@/components/ui/PhotoWellMulti";
import { TimeField } from "@/components/ui/TimeField";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import type { EventRow } from "@/lib/myFarm";

type Draft = { name: string; date: string; startsAt: string; endsAt: string; notes: string };
type ExistingPhoto = { id: string; url: string };
type NewPhoto = { key: string; file: File; preview: string };

function draftFromEvent(ev: EventRow): Draft {
  return { name: ev.name, date: ev.event_date, startsAt: ev.starts_at ?? "", endsAt: ev.ends_at ?? "", notes: ev.notes ?? "" };
}
const EMPTY: Draft = { name: "", date: "", startsAt: "", endsAt: "", notes: "" };

async function uploadEventPhoto(supabase: ReturnType<typeof createClient>, farmId: string, eventId: string, index: number, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const key = `${farmId}/events/${eventId}/${index}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("farm-photos").upload(key, file);
  if (error) return null;
  return supabase.storage.from("farm-photos").getPublicUrl(key).data.publicUrl;
}

// Ports SCREENS['4.16'] (add/edit) + SCREENS['4.24'] (delete confirm, as a
// sheet over this form). The prototype's custom calendar-grid dropdown for
// "What day is it?" is a native date input here — same real date, a plainer
// control; worth a design pass if Ilse wants the inline calendar back.
//
// The hero on the event detail page (2.13) is a carousel, so this form
// manages a set of photos rather than one: `photos` is what's already saved
// (edit mode), newly-picked files are queued in memory and only uploaded
// (and only then written to event_photos) once Save is pressed, and a
// removed existing photo is deleted from both storage bookkeeping and
// event_photos at the same time.
export function EventForm({ farmId, event, photos, backTo }: { farmId: string; event: EventRow | null; photos: ExistingPhoto[]; backTo: string }) {
  const supabase = createClient();
  const router = useRouter();
  const isEdit = !!event;
  const [draft, setDraft] = useState<Draft>(event ? draftFromEvent(event) : EMPTY);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(photos);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
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

    await supabase.from("events").upsert({
      id: eventId,
      farm_id: farmId,
      name: draft.name,
      event_date: draft.date,
      starts_at: draft.startsAt || null,
      ends_at: draft.endsAt || null,
      notes: draft.notes || null,
    });

    if (removedPhotoIds.length) {
      await supabase.from("event_photos").delete().in("id", removedPhotoIds);
    }

    const baseOrder = existingPhotos.length;
    for (const [i, p] of newPhotos.entries()) {
      const url = await uploadEventPhoto(supabase, farmId, eventId, baseOrder + i, p.file);
      if (url) await supabase.from("event_photos").insert({ event_id: eventId, url, sort_order: baseOrder + i });
    }

    // The card thumbnail everywhere else (EventCard, the public Events tab,
    // the farm's Manage list) reads events.photo_url, a single column — not
    // the event_photos carousel this form actually writes to. Without this,
    // that column was never set, so a freshly uploaded photo never showed
    // up anywhere except the event's own detail-page carousel. Read back
    // whichever photo actually ended up first after the mutations above
    // (rather than trying to track it through adds/removes) and mirror it.
    const { data: firstPhoto } = await supabase.from("event_photos").select("url").eq("event_id", eventId).order("sort_order").limit(1).maybeSingle();
    await supabase.from("events").update({ photo_url: firstPhoto?.url ?? null }).eq("id", eventId);

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
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-name">
          What is the event?
        </label>
        <div style={{ height: 8 }} />
        <input id="event-name" className="field" placeholder="e.g. Apple Pressing Day" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />

        <div style={{ height: 20 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-notes">
          What are the details?
        </label>
        <div style={{ height: 8 }} />
        <textarea
          id="event-notes"
          className="field"
          style={{ height: 60 }}
          placeholder="e.g. We'll be pressing apples all day — bring your own jugs! Kids' activities start at 10am, food truck on site, parking in the north lot."
          value={draft.notes}
          onChange={(e) => patch({ notes: e.target.value })}
        />

        <div style={{ height: 20 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-date">
          What day is it?
        </label>
        <div style={{ height: 8 }} />
        <div style={{ position: "relative" }}>
          <input
            id="event-date"
            className="field"
            type="date"
            style={{ paddingRight: 40 }}
            value={draft.date}
            onChange={(e) => patch({ date: e.target.value })}
          />
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
              pointerEvents: "none",
              display: "flex",
            }}
          >
            <Icon name="calendar" size={18} />
          </span>
        </div>

        <div style={{ height: 20 }} />
        <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
          What time?
        </div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="event-starts-at">
              Starts
            </label>
            <TimeField id="event-starts-at" value={draft.startsAt} onChange={(v) => patch({ startsAt: v })} placeholder="8:00am" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="event-ends-at">
              Ends
            </label>
            <TimeField id="event-ends-at" value={draft.endsAt} onChange={(v) => patch({ endsAt: v })} placeholder="2:00pm" />
          </div>
        </div>

        <div style={{ height: 20 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-photos">
          Photos
        </label>
        <div style={{ height: 8 }} />
        <PhotoWellMulti
          id="event-photos"
          photos={[
            ...existingPhotos.map((p) => ({ key: p.id, url: p.url })),
            ...newPhotos.map((p) => ({ key: p.key, url: p.preview })),
          ]}
          label="Add photos of the event"
          onAdd={(files) =>
            setNewPhotos((ps) => [...ps, ...files.map((file) => ({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }))])
          }
          onRemove={(key) => {
            if (existingPhotos.some((p) => p.id === key)) {
              setExistingPhotos((ps) => ps.filter((p) => p.id !== key));
              setRemovedPhotoIds((ids) => [...ids, key]);
            } else {
              setNewPhotos((ps) => ps.filter((p) => p.key !== key));
            }
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

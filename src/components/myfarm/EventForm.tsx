"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { PhotoWellMulti } from "@/components/ui/PhotoWellMulti";
import { TimeField } from "@/components/ui/TimeField";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { ToggleRow } from "@/components/settings/ToggleRow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { fmtEventDateShort, type EventDateMode, type EventRow } from "@/lib/myFarm";
import { capitalizeFirst } from "@/lib/text";

type DateEntryDraft = { id: string; date: string; startsAt: string; endsAt: string };
type Draft = {
  name: string;
  notes: string;
  dateMode: EventDateMode;
  date: string;
  endDate: string;
  allDay: boolean;
  startsAt: string;
  endsAt: string;
  sameTimeForAllDates: boolean;
  datesList: DateEntryDraft[];
};
type ExistingPhoto = { id: string; url: string };
type NewPhoto = { key: string; file: File; preview: string };

function draftFromEvent(ev: EventRow): Draft {
  return {
    name: ev.name,
    notes: ev.notes ?? "",
    dateMode: ev.date_mode,
    date: ev.event_date,
    endDate: ev.end_date ?? "",
    allDay: ev.all_day,
    startsAt: ev.starts_at ?? "",
    endsAt: ev.ends_at ?? "",
    sameTimeForAllDates: ev.same_time_for_all_dates,
    datesList: (ev.datesList ?? [])
      .slice()
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .map((d) => ({ id: d.id, date: d.event_date, startsAt: d.starts_at ?? "", endsAt: d.ends_at ?? "" })),
  };
}
const EMPTY: Draft = {
  name: "",
  notes: "",
  dateMode: "single",
  date: "",
  endDate: "",
  allDay: false,
  startsAt: "",
  endsAt: "",
  sameTimeForAllDates: true,
  datesList: [],
};

const DATE_MODES: { key: EventDateMode; icon: IconName; label: string; caption: string }[] = [
  { key: "single", icon: "calendar", label: "One day", caption: "A single date with one start and end time." },
  { key: "range", icon: "calendar-range", label: "Date range", caption: "A continuous range of days (e.g. a 3-day event)." },
  { key: "selected", icon: "date-checklist", label: "Selected dates", caption: "Choose specific dates (e.g. every Saturday)." },
];

// A plain native date input with the same calendar-icon decoration used
// throughout this form — single date, range start/end, and each row of a
// "Selected dates" list all share this.
function DateInput({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative" }}>
      <input id={id} className="field" type="date" style={{ paddingRight: 40 }} value={value} onChange={(e) => onChange(e.target.value)} />
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
  );
}

function RadioRow({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <div onClick={onSelect} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer" }}>
      <span
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `1.5px solid ${selected ? "var(--interactive-primary)" : "var(--border-default)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--interactive-primary)" }} />}
      </span>
      <span className="body-m">{label}</span>
    </div>
  );
}

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

  function addDate() {
    setDraft((d) => ({ ...d, datesList: [...d.datesList, { id: crypto.randomUUID(), date: "", startsAt: "", endsAt: "" }] }));
  }
  function removeDate(id: string) {
    setDraft((d) => ({ ...d, datesList: d.datesList.filter((e) => e.id !== id) }));
  }
  function patchDate(id: string, p: Partial<DateEntryDraft>) {
    setDraft((d) => ({ ...d, datesList: d.datesList.map((e) => (e.id === id ? { ...e, ...p } : e)) }));
  }

  const backHref = `/my-farm/events${backTo === "manage" ? "/manage" : ""}`;

  const canSave =
    !!draft.name &&
    (draft.dateMode === "single"
      ? !!draft.date
      : draft.dateMode === "range"
        ? !!draft.date && !!draft.endDate
        : draft.datesList.some((d) => !!d.date));

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    const eventId = event?.id ?? crypto.randomUUID();

    // Resolve the per-mode fields into the flat shape `events` stores:
    // event_date/starts_at/ends_at always carry the *primary* (earliest)
    // date/time regardless of mode (see the comment on EventRow in
    // lib/myFarm.ts), end_date only means something for "range", and the
    // chosen dates for "selected" go to the event_dates child table below.
    let primaryDate = draft.date;
    let endDateForRange: string | null = null;
    let startsAt = draft.startsAt || null;
    let endsAt = draft.endsAt || null;
    let allDay = false;
    let sameTimeForAllDates = true;
    let selectedDateRows: { date: string; startsAt: string | null; endsAt: string | null }[] = [];

    if (draft.dateMode === "single") {
      allDay = draft.allDay;
      if (allDay) {
        startsAt = null;
        endsAt = null;
      }
    } else if (draft.dateMode === "range") {
      endDateForRange = draft.endDate || null;
    } else {
      const sorted = [...draft.datesList].filter((d) => d.date).sort((a, b) => a.date.localeCompare(b.date));
      primaryDate = sorted[0]?.date ?? "";
      sameTimeForAllDates = draft.sameTimeForAllDates;
      selectedDateRows = sorted.map((d) => ({
        date: d.date,
        startsAt: sameTimeForAllDates ? draft.startsAt || null : d.startsAt || null,
        endsAt: sameTimeForAllDates ? draft.endsAt || null : d.endsAt || null,
      }));
      startsAt = sameTimeForAllDates ? draft.startsAt || null : (selectedDateRows[0]?.startsAt ?? null);
      endsAt = sameTimeForAllDates ? draft.endsAt || null : (selectedDateRows[0]?.endsAt ?? null);
    }

    await supabase.from("events").upsert({
      id: eventId,
      farm_id: farmId,
      name: draft.name,
      event_date: primaryDate,
      starts_at: startsAt,
      ends_at: endsAt,
      notes: draft.notes || null,
      date_mode: draft.dateMode,
      end_date: endDateForRange,
      all_day: allDay,
      same_time_for_all_dates: sameTimeForAllDates,
    });

    // event_dates only ever holds rows for "selected" mode — delete and
    // reinsert rather than trying to diff against what's there, since
    // nothing else references these rows by id.
    await supabase.from("event_dates").delete().eq("event_id", eventId);
    if (selectedDateRows.length) {
      await supabase.from("event_dates").insert(
        selectedDateRows.map((d, i) => ({ event_id: eventId, event_date: d.date, starts_at: d.startsAt, ends_at: d.endsAt, sort_order: i }))
      );
    }

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
        <div className="label-caps">Event details</div>
        <div style={{ height: 12 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-name">
          Event name
        </label>
        <div style={{ height: 8 }} />
        <input
          id="event-name"
          className="field"
          placeholder="e.g. Apple Pressing Day"
          value={draft.name}
          onChange={(e) => patch({ name: capitalizeFirst(e.target.value) })}
        />

        <div style={{ height: 20 }} />
        <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-notes">
          Description
        </label>
        <div style={{ height: 8 }} />
        <textarea
          id="event-notes"
          className="field"
          style={{ height: 70 }}
          maxLength={500}
          placeholder="Share what to expect, what to bring, activities, parking info, etc."
          value={draft.notes}
          onChange={(e) => patch({ notes: capitalizeFirst(e.target.value) })}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <span className="caption" style={{ color: "var(--text-tertiary)" }}>
            {draft.notes.length}/500
          </span>
        </div>

        <div style={{ height: 24 }} />
        <div className="label-caps">When does it happen?</div>
        <div style={{ height: 10 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {DATE_MODES.map((m) => {
            const selected = draft.dateMode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => patch({ dateMode: m.key })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 6px",
                  borderRadius: 12,
                  border: `1.5px solid ${selected ? "var(--text-brand)" : "var(--border-default)"}`,
                  background: selected ? "var(--harvest-green-100)" : "var(--bg-raised)",
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", color: selected ? "var(--text-brand)" : "var(--text-secondary)" }}>
                  <Icon name={m.icon} size={20} />
                </span>
                <span className="body-s-strong" style={{ color: selected ? "var(--text-brand)" : "var(--text-secondary)" }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ height: 8 }} />
        <p className="caption" style={{ color: "var(--text-tertiary)" }}>
          {DATE_MODES.find((m) => m.key === draft.dateMode)?.caption}
        </p>

        <div style={{ height: 20 }} />
        {draft.dateMode === "single" && (
          <>
            <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-date">
              Date
            </label>
            <div style={{ height: 8 }} />
            <DateInput id="event-date" value={draft.date} onChange={(v) => patch({ date: v })} />
          </>
        )}
        {draft.dateMode === "range" && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-start-date">
                Start date
              </label>
              <div style={{ height: 8 }} />
              <DateInput id="event-start-date" value={draft.date} onChange={(v) => patch({ date: v })} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="body-s-strong" style={{ color: "var(--text-tertiary)" }} htmlFor="event-end-date">
                End date
              </label>
              <div style={{ height: 8 }} />
              <DateInput id="event-end-date" value={draft.endDate} onChange={(v) => patch({ endDate: v })} />
            </div>
          </div>
        )}
        {draft.dateMode === "selected" && (
          <>
            <div className="body-s-strong" style={{ color: "var(--text-tertiary)" }}>
              Dates
            </div>
            <div style={{ height: 8 }} />
            {draft.datesList.map((d) => (
              <div key={d.id} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <DateInput value={d.date} onChange={(v) => patchDate(d.id, { date: v })} />
                  </div>
                  <button
                    type="button"
                    aria-label="Remove date"
                    onClick={() => removeDate(d.id)}
                    style={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "none",
                      border: "none",
                      color: "var(--text-tertiary)",
                      cursor: "pointer",
                    }}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
                {!draft.sameTimeForAllDates && (
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <TimeField value={d.startsAt} onChange={(v) => patchDate(d.id, { startsAt: v })} placeholder="8:00am" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <TimeField value={d.endsAt} onChange={(v) => patchDate(d.id, { endsAt: v })} placeholder="2:00pm" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDate}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                width: "100%",
                padding: "10px 0",
                background: "none",
                border: "none",
                color: "var(--text-brand)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>
              <span className="body-s-strong">{draft.datesList.length ? "Add another date" : "Add a date"}</span>
            </button>
          </>
        )}

        <div style={{ height: 24 }} />
        <div className="label-caps">{draft.dateMode === "range" ? "Time (each day)" : "Time"}</div>
        <div style={{ height: 10 }} />
        {draft.dateMode === "selected" && (
          <>
            <RadioRow label="Use the same time for all dates" selected={draft.sameTimeForAllDates} onSelect={() => patch({ sameTimeForAllDates: true })} />
            <RadioRow label="Set different times for each date" selected={!draft.sameTimeForAllDates} onSelect={() => patch({ sameTimeForAllDates: false })} />
            <div style={{ height: 10 }} />
          </>
        )}
        {(draft.dateMode !== "single" || !draft.allDay) && (draft.dateMode !== "selected" || draft.sameTimeForAllDates) && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="event-starts-at">
                Start time
              </label>
              <TimeField id="event-starts-at" value={draft.startsAt} onChange={(v) => patch({ startsAt: v })} placeholder="9:00am" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="caption" style={{ marginBottom: 4, display: "block" }} htmlFor="event-ends-at">
                End time
              </label>
              <TimeField id="event-ends-at" value={draft.endsAt} onChange={(v) => patch({ endsAt: v })} placeholder="2:00pm" />
            </div>
          </div>
        )}

        {draft.dateMode === "range" && draft.date && draft.endDate && draft.startsAt && draft.endsAt && (
          <>
            <div style={{ height: 12 }} />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--harvest-green-100)" }}>
              <span style={{ color: "var(--text-brand)", flexShrink: 0, display: "flex", marginTop: 1 }}>
                <Icon name="check" size={16} />
              </span>
              <span className="body-s" style={{ color: "var(--text-primary)" }}>
                This event will run from {draft.startsAt} – {draft.endsAt} each day, from {fmtEventDateShort(draft.date)} to{" "}
                {fmtEventDateShort(draft.endDate)}.
              </span>
            </div>
          </>
        )}

        {draft.dateMode === "single" && (
          <>
            <div style={{ height: 12 }} />
            <ToggleRow
              title="All day"
              sub="Event lasts all day (no start or end time)."
              on={draft.allDay}
              onToggle={() => patch({ allDay: !draft.allDay })}
            />
          </>
        )}

        <div style={{ height: 24 }} />
        <div className="label-caps">Photos</div>
        <div style={{ height: 10 }} />
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

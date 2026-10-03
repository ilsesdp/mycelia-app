"use client";

import { ComboField } from "@/components/ui/ComboField";

function buildOptions(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    const mer = h < 12 ? "am" : "pm";
    const h12 = h % 12 || 12;
    out.push(`${h12}:00${mer}`);
  }
  return out;
}
const OPTIONS = buildOptions();

// A typable time field with a dropdown of every hour (am/pm), replacing
// the clock-icon-plus-free-text pattern on the hours screens (1.9 and
// 4.20). ComboField does the typable-dropdown work; this just supplies
// the time-of-day option list. The list is hourly, not every 15 minutes —
// still free text underneath, so an odd time like "8:30am" is still
// typeable, just not offered as a suggestion.
export function TimeField({
  value,
  onChange,
  placeholder = "9:00am",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return <ComboField id={id} value={value} onChange={onChange} options={OPTIONS} placeholder={placeholder} />;
}

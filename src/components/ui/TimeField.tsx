"use client";

import { ComboField } from "@/components/ui/ComboField";

function buildOptions(): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const mer = h < 12 ? "am" : "pm";
      const h12 = h % 12 || 12;
      out.push(`${h12}:${String(m).padStart(2, "0")}${mer}`);
    }
  }
  return out;
}
const OPTIONS = buildOptions();

// A typable time field with a dropdown of every 15-minute time (am/pm),
// replacing the clock-icon-plus-free-text pattern on the hours screens
// (1.9 and 4.20). ComboField does the typable-dropdown work; this just
// supplies the time-of-day option list.
export function TimeField({ value, onChange, placeholder = "9:00am" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <ComboField value={value} onChange={onChange} options={OPTIONS} placeholder={placeholder} />;
}

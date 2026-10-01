"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// A typable input with a dropdown of suggested options — type to filter the
// list, or pick straight from it, while still accepting free text the list
// doesn't cover. Fully controlled by `value`/`onChange` (no internal draft
// to keep in sync, so there's nothing for a mount/update effect to race).
// Underlies TimeField (times) and the onboarding market form's Day/Hours
// fields (day-of-week names, common open-hour ranges).
export function ComboField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [value, options]);

  function pick(o: string) {
    onChange(o);
    setOpen(false);
  }

  return (
    <div className="time-field-combo" ref={wrapRef}>
      <div className="time-field">
        <input
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
        />
        {value && (
          <span
            className="time-field-clear"
            onMouseDown={(e) => {
              e.preventDefault();
              onChange("");
            }}
          >
            &times;
          </span>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="time-field-menu">
          {filtered.map((o) => (
            <div key={o} className={`time-field-option ${o.toLowerCase() === value.trim().toLowerCase() ? "selected" : ""}`} onMouseDown={() => pick(o)}>
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

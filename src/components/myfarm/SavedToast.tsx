"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Ports the auto-clearing toast on 4.10 (Hours saved) and 4.11 (Manage
// products saved) — both render the underlying screen with a toast
// overlay for ~3s, then return to it without the toast. Here that's a
// `?saved=` query param this component watches and strips via replace,
// rather than a timed screen transition.
export function SavedToast({ param = "saved" }: { param?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const message = sp.get(param);
  // Derive visibility straight from the query param instead of mirroring it
  // into state in an effect (that setState-in-effect pattern is exactly
  // what triggers an avoidable cascading render); the clearing timer below
  // is the only thing that actually needs an effect.
  const visible = !!message;

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      next.delete(param);
      router.replace(next.toString() ? `?${next.toString()}` : window.location.pathname, { scroll: false });
    }, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, param]);

  if (!visible || !message) return null;
  return (
    <div className="toast show toast-info" style={{ position: "fixed" }}>
      {message}
    </div>
  );
}

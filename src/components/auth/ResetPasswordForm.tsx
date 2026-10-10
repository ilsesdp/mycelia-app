"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { Icon } from "@/components/ui/Icon";
import { PasswordField } from "@/components/ui/PasswordField";
import { createClient } from "@/lib/supabase/client";

// Same requirement-checklist row as SecurityForm's (5.10) — kept identical
// rather than shared, since the two screens may diverge later.
function Requirement({ met, children }: { met: boolean; children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          flexShrink: 0,
          display: "flex",
          color: met ? "var(--interactive-primary)" : "var(--text-tertiary)",
        }}
      >
        <Icon name="check" size={16} />
      </span>
      <span className="caption" style={{ color: met ? "var(--text-primary)" : "var(--text-tertiary)" }}>
        {children}
      </span>
    </div>
  );
}

// The screen the prototype never built: landing here means Supabase already
// verified a password-recovery email link and handed this browser a real
// session (see src/app/auth/confirm/route.ts) — there's no "current
// password" to check, so this reuses SCREENS['5.10']'s title, field labels,
// and requirement checklist verbatim, just without the Current-password
// field and the Delete-account section (those belong to the logged-in
// Settings screen, SecurityForm, not here).
//
// After saving, Ilse wants a fresh login rather than carrying the recovery
// session forward — so this signs out and sends the person to /login to
// re-enter the new password themselves.
export function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatched = next.length > 0 && confirm.length > 0 && next !== confirm;
  const hasMinLength = next.length >= 8;
  const hasMix = /[a-zA-Z]/.test(next) && /[0-9]/.test(next) && /[^a-zA-Z0-9]/.test(next);
  const valid = !!next && hasMinLength && next === confirm;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    if (updateError) {
      setSaving(false);
      setError("Couldn't update your password. Try again.");
      return;
    }

    // Don't carry the recovery session forward — Ilse wants a fresh,
    // deliberate login with the new password.
    await supabase.auth.signOut();
    setSaving(false);
    router.push("/login?saved=Password updated — log in with it");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar title="Password" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        <label className="label-caps" htmlFor="pw-new">
          New password
        </label>
        <div style={{ height: 6 }} />
        <PasswordField
          id="pw-new"
          placeholder="At least 8 characters"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Requirement met={hasMinLength}>Use at least 8 characters.</Requirement>
          <Requirement met={hasMix}>Include a mix of letters, numbers, and symbols.</Requirement>
        </div>

        <div style={{ height: 20 }} />
        <label className="label-caps" htmlFor="pw-confirm">
          Confirm new password
        </label>
        <div style={{ height: 6 }} />
        <PasswordField
          id="pw-confirm"
          placeholder="Enter your new password again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {mismatched && (
          <>
            <div style={{ height: 6 }} />
            <p className="caption" style={{ color: "var(--text-danger)" }}>
              New passwords don&apos;t match.
            </p>
          </>
        )}
        {error && (
          <>
            <div style={{ height: 6 }} />
            <p className="caption" style={{ color: "var(--text-danger)" }}>
              {error}
            </p>
          </>
        )}

        <div style={{ flex: 1, minHeight: 20 }} />
        <button className="btn btn-primary" disabled={!valid || saving} onClick={save}>
          {saving ? "Saving…" : "Save new password"}
        </button>
      </div>
    </main>
  );
}

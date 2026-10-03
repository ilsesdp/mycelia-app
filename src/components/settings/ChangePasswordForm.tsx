"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { PasswordField } from "@/components/ui/PasswordField";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['5.10'] / pwFormValid(). The Supabase client SDK has no
// "verify this is my current password" check on its own, so Save
// re-authenticates with signInWithPassword(email, current) first — that
// doubles as the "wrong current password" validation the prototype's
// mocked form never had to do for real — then calls
// auth.updateUser({password: new}).
export function ChangePasswordForm({ email }: { email: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatched = next.length > 0 && confirm.length > 0 && next !== confirm;
  const valid = !!current && !!next && next.length >= 8 && next === confirm;

  async function save() {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (authError) {
      setError("Current password is incorrect.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (updateError) {
      setError("Couldn't update your password. Try again.");
      return;
    }
    router.push("/settings/account?saved=Password updated");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings/account" title="Password" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24, display: "flex", flexDirection: "column" }}>
        <label className="label-caps" htmlFor="pw-current">
          Current password
        </label>
        <div style={{ height: 6 }} />
        <PasswordField
          id="pw-current"
          placeholder="At least 8 characters"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />

        <div style={{ height: 20 }} />
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

        <div style={{ height: 10 }} />
        <label className="label-caps" htmlFor="pw-confirm">
          Confirm new password
        </label>
        <div style={{ height: 6 }} />
        <PasswordField
          id="pw-confirm"
          placeholder="At least 8 characters"
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

        <div style={{ height: 20 }} />
        <button className="btn btn-primary" disabled={!valid || saving} onClick={save}>
          {saving ? "Saving…" : "Save new password"}
        </button>
      </div>
    </main>
  );
}

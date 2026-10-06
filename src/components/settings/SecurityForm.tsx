"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { PasswordField } from "@/components/ui/PasswordField";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['5.10'] / pwFormValid() plus SCREENS['5.11'] ("Delete my
// account") — both are account-safety actions, so they share this screen
// (the hub's "Security" row) rather than password living on Contact
// information the way the first pass of this port had it.
//
// The Supabase client SDK has no "verify this is my current password"
// check on its own, so Save re-authenticates with
// signInWithPassword(email, current) first — that doubles as the "wrong
// current password" validation the prototype's mocked form never had to do
// for real — then calls auth.updateUser({password: new}).
export function SecurityForm({ email }: { email: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    router.push("/settings?saved=Password updated");
  }

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Cascades to farm_hours, farm_categories, products, farm_markets,
      // events and message_threads/messages via ON DELETE CASCADE. This
      // removes everything the account owns, but the Supabase Auth login
      // itself isn't deleted — that needs service-role/admin access this
      // client-side app doesn't have.
      await supabase.from("farms").delete().eq("owner_id", user.id);
    }
    await supabase.auth.signOut();
    router.push("/welcome");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Security" />
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

        <div style={{ height: 32 }} />
        <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
        <div style={{ height: 20 }} />
        <div className="label-caps" style={{ color: "var(--text-danger)" }}>
          Danger zone
        </div>
        <div style={{ height: 8 }} />
        <p className="body-s">Deleting your account removes your farm, products, markets, events and messages for good. This can&apos;t be undone.</p>
        <div style={{ height: 12 }} />
        <button className="btn btn-ghost" style={{ color: "var(--text-danger)" }} onClick={() => setShowDelete(true)}>
          Delete my account
        </button>
      </div>

      {showDelete && (
        <ConfirmSheet
          title="Delete your account?"
          body="This removes your farm, products, markets, events and messages for good. This can't be undone."
          confirmLabel="Delete account"
          cancelLabel="Cancel"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </main>
  );
}

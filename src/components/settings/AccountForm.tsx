"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// Ports SCREENS['5.6']. The prototype's "Delete my account" opens a
// confirm sheet (5.11) rather than routing to a separate screen, so it's
// handled here inline rather than as its own route.
export function AccountForm({
  authEmail,
  initialEmail,
  initialPhone,
}: {
  authEmail: string;
  initialEmail: string;
  initialPhone: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const emailOk = isValidEmail(email);

  async function save() {
    if (!emailOk || saving) return;
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ contact_email: email.trim(), contact_phone: phone.trim() || null })
        .eq("id", user.id);
    }
    setSaving(false);
    router.push("/settings");
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
      <AppBar backHref="/settings" title="Account information" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, paddingBottom: 24, overflowY: "auto" }}>
        <p className="body-m">The email you sign in with is {authEmail}. This is how people reach you.</p>
        <div style={{ height: 20 }} />

        <div className="label-caps">Email</div>
        <div style={{ height: 6 }} />
        <input
          type="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        {!emailOk && email.length > 0 && (
          <p className="body-s" style={{ color: "var(--text-danger)", marginTop: 4 }}>
            Enter a valid email.
          </p>
        )}

        <div style={{ height: 18 }} />
        <div className="label-caps">Phone</div>
        <div style={{ height: 6 }} />
        <input
          type="tel"
          className="field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0123"
        />

        <div style={{ height: 24 }} />
        <button className="btn btn-primary" disabled={!emailOk || saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <div style={{ height: 10 }} />
        <button className="btn btn-secondary" onClick={() => router.push("/settings/password")}>
          Change password
        </button>

        <div style={{ height: 32 }} />
        <button
          className="body-m"
          style={{ color: "var(--text-danger)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          onClick={() => setShowDelete(true)}
        >
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

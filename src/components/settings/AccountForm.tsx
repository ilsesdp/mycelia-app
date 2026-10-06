"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBar } from "@/components/ui/AppBar";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

// Ports SCREENS['5.6'] — just the contact email/phone fields. Change
// password and Delete account moved out to SecurityForm (its own
// "Security" row on the hub, SCREENS['5.10']) rather than living on this
// screen, so this one stays scoped to "how people reach you."
export function AccountForm({
  initialEmail,
  initialPhone,
}: {
  initialEmail: string;
  initialPhone: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
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
    router.push("/settings?saved=Contact info saved");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Contact information" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24, flex: 1, display: "flex", flexDirection: "column" }}>
        <p className="body-m">Keep your contact details up to date. You can choose who can see them in Privacy &amp; visibility.</p>
        <div style={{ height: 20 }} />

        <label className="label-caps" htmlFor="account-email">
          Email
        </label>
        <div style={{ height: 6 }} />
        <input
          id="account-email"
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
        <label className="label-caps" htmlFor="account-phone">
          Phone
        </label>
        <div style={{ height: 6 }} />
        <input
          id="account-phone"
          type="tel"
          className="field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-0123"
        />

        <div style={{ flex: 1, minHeight: 20 }} />
        <button className="btn btn-primary" disabled={!emailOk || saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </main>
  );
}

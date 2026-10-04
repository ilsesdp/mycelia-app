"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['1.15'] — real supabase.auth.resetPasswordForEmail().
export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/check-email?email=${encodeURIComponent(email)}&reset=1`);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/login" />
      <div className="flex flex-col gap-4 px-4 pt-4">
        <div>
          <div className="title-l" style={{ color: "var(--text-primary)" }}>
            Reset your password
          </div>
          <p className="body-m">We&apos;ll email you a link. It works for one hour.</p>
        </div>
        <div>
          <label className="label-caps" htmlFor="forgot-email">
            Email
          </label>
          <div style={{ height: 4 }} />
          <input
            id="forgot-email"
            className="field"
            style={{ height: 48 }}
            placeholder="jane@willowcreek.farm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && (
          <div className="hint-error">
            <span>{error}</span>
          </div>
        )}
        <Button variant="primary" disabled={!email.includes("@") || submitting} onClick={handleSend}>
          {submitting ? "Sending…" : "Send the link"}
        </Button>
      </div>
    </main>
  );
}

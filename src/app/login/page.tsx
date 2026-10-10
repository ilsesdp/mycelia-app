"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { SavedToast } from "@/components/myfarm/SavedToast";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['1.14'] — real supabase.auth.signInWithPassword(). A user
// with no farm yet is sent to onboarding; a user who already has one lands
// on the map (2.1), same as the prototype's own post-login destination.
function LoginInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "confirm-failed" ? "That confirmation link didn't work — it may have expired. Try signing up again, or log in if you already confirmed." : null
  );
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!email && !!password;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }
    const { data: farm } = await supabase
      .from("farms")
      .select("id")
      .eq("owner_id", data.user.id)
      .maybeSingle();
    setSubmitting(false);
    router.push(farm ? "/map" : "/onboarding/path");
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/welcome" />
      <div className="flex-1 flex flex-col px-4 pt-4">
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          Log in
        </div>
        <div style={{ height: 8 }} />
        <p className="body-m" style={{ width: 227 }}>
          This takes about two minutes.
        </p>
        <div style={{ height: 20 }} />

        <label className="label-caps" htmlFor="login-email">
          Email
        </label>
        <div style={{ height: 4 }} />
        <input
          id="login-email"
          className="field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ height: 16 }} />

        <label className="label-caps" htmlFor="login-password">
          Password
        </label>
        <div style={{ height: 4 }} />
        <PasswordField
          id="login-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
        />

        {error && (
          <div className="hint-error" style={{ marginTop: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <div style={{ height: 40 }} />
        <Button variant="primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>
        <div style={{ height: 24 }} />
        <Link
          href="/forgot-password"
          style={{
            display: "block",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Forgot password
        </Link>
      </div>
      <SavedToast />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['1.3'] (signupScreen) — real Supabase signUp instead of
// trySignup()'s fake email-format-only check. "Choose your path" (1.2) and
// the address lookup (1.4/1.5) belong to onboarding/farm-creation, not
// auth, so this goes straight from Welcome to here per the regrouping.
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!name && !!email && password.length >= 8;

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setFormError(null);
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setSubmitting(false);
      setFormError(error.message);
      return;
    }

    // Trigger only sets id + contact_email on the new profiles row — the
    // name typed here still needs to land on the profile explicitly.
    if (data.user) {
      await supabase.from("profiles").update({ full_name: name }).eq("id", data.user.id);
    }

    setSubmitting(false);
    if (data.session) {
      router.push("/onboarding/path");
    } else {
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/welcome" title="Create account" />
      <div className="flex-1 flex flex-col px-6 pt-4">
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          Set up your account
        </div>
        <div style={{ height: 8 }} />
        <p className="body-m" style={{ width: 227 }}>
          This takes about two minutes.
        </p>
        <div style={{ height: 20 }} />

        <label className="label-caps">Your name</label>
        <div style={{ height: 4 }} />
        <input
          className="field"
          placeholder="Jane Miller"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ height: 16 }} />

        <label className="label-caps">Email</label>
        <div style={{ height: 4 }} />
        <input
          className={`field ${emailError ? "field-error" : ""}`}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(false);
          }}
        />
        {emailError && (
          <div className="hint-error">
            <span>Enter an email address like you@example.com</span>
          </div>
        )}
        <div style={{ height: 16 }} />

        <label className="label-caps">Password</label>
        <div style={{ height: 4 }} />
        <input
          className="field"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {formError && (
          <div className="hint-error" style={{ marginTop: 16 }}>
            <span>{formError}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>
      <div className="px-6 pb-6 flex flex-col gap-4">
        <Button variant="primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
        <Link href="/login">
          <Button variant="ghost">I already have an account</Button>
        </Link>
      </div>
    </main>
  );
}

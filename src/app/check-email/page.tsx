"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppBar } from "@/components/ui/AppBar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

// Ports SCREENS['1.16'] ("Link sent") — reused for both the signup
// confirmation email and the password-reset email, since both are "check
// your inbox" moments with a resend action. The prototype only had the
// reset-password version; this generalizes it with a `reset` query flag.
function CheckEmailInner() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const isReset = params.get("reset") === "1";
  const supabase = createClient();
  const [resent, setResent] = useState(false);

  async function resend() {
    if (isReset) {
      await supabase.auth.resetPasswordForEmail(email);
    } else {
      await supabase.auth.resend({ type: "signup", email });
    }
    setResent(true);
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppBar backHref="/login" />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--bg-brand-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-primary)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          Check your email
        </div>
        <p className="body-m">We sent a link to {email || "your email"}</p>
        <div className="w-full flex flex-col gap-4">
          <Link href="/login">
            <Button variant="primary">Back to log in</Button>
          </Link>
          <button
            onClick={resend}
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {resent ? "Sent again" : "Send it again"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailInner />
    </Suspense>
  );
}

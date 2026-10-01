"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { createClient } from "@/lib/supabase/client";

export function SettingsHub({ hasFarm }: { hasFarm: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [showLogOut, setShowLogOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function logOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/welcome");
  }

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar title="Settings" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        {hasFarm && (
          <>
            <div className="label-caps">Your farm</div>
            <div style={{ height: 8 }} />
            <SettingsRow icon="pencil" title="Edit profile" href="/settings/profile" />
            <SettingsRow icon="bell" title="Notifications" href="/settings/notifications" />
            <div style={{ height: 26 }} />
          </>
        )}
        <div className="label-caps">Account</div>
        <div style={{ height: 8 }} />
        <SettingsRow icon="user" title="Account information" href="/settings/account" />
        <SettingsRow icon="lock" title="Privacy and visibility" href="/settings/privacy" />
        <div style={{ height: 26 }} />
        <div className="label-caps">Support</div>
        <div style={{ height: 8 }} />
        <SettingsRow icon="help" title="Help" href="/settings/help" />
        <SettingsRow icon="msg" title="Contact support" href="/settings/support" />
        <div style={{ flex: 1, minHeight: 20 }} />
        <div style={{ paddingBottom: 24 }}>
          <button className="btn btn-ghost" onClick={() => setShowLogOut(true)}>
            Log out
          </button>
        </div>
      </div>

      {showLogOut && (
        <ConfirmSheet
          title="Log out of Mycelia?"
          body="Your farm stays on the map. You just need to log back in to change anything."
          confirmLabel="Log out"
          cancelLabel="Stay logged in"
          onConfirm={logOut}
          onCancel={() => setShowLogOut(false)}
          busy={signingOut}
        />
      )}
    </main>
  );
}

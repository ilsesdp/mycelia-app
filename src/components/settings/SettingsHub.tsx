"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBar } from "@/components/ui/AppBar";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { ConfirmSheet } from "@/components/settings/ConfirmSheet";
import { SavedToast } from "@/components/myfarm/SavedToast";
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
      <AppBar backHref="/my-farm" title="Settings" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        {hasFarm && (
          <>
            <div className="label-caps">Farm profile</div>
            <div style={{ height: 8 }} />
            <SettingsRow
              icon="pencil"
              title="Farm information"
              sub="Name, location, description, photos and links"
              href="/settings/profile"
              color="var(--text-brand)"
            />
            <div style={{ height: 26 }} />
            <div className="label-caps">Preferences</div>
            <div style={{ height: 8 }} />
            <SettingsRow icon="bell" title="Notifications" sub="How and when we notify you" href="/settings/notifications" color="var(--text-brand)" />
            <div style={{ height: 26 }} />
          </>
        )}
        <div className="label-caps">Account & privacy</div>
        <div style={{ height: 8 }} />
        <SettingsRow icon="user" title="Contact information" sub="Email and phone number" href="/settings/account" color="var(--text-brand)" />
        <SettingsRow
          icon="lock"
          title="Privacy & visibility"
          sub="Choose who can see your information"
          href="/settings/privacy"
          color="var(--text-brand)"
        />
        <SettingsRow icon="shield" title="Security" sub="Change your password" href="/settings/security" color="var(--text-brand)" />
        <div style={{ height: 26 }} />
        <div className="label-caps">Support</div>
        <div style={{ height: 8 }} />
        <SettingsRow
          icon="help"
          title="Help center"
          sub="Find answers to common questions"
          href="/settings/help"
          color="var(--text-brand)"
        />
        <SettingsRow icon="msg" title="Contact support" sub="Get help from our team" href="/settings/support" color="var(--text-brand)" />
        <div style={{ flex: 1, minHeight: 20 }} />
        <div style={{ paddingBottom: 24 }}>
          <button className="btn btn-ghost" style={{ color: "var(--text-danger)" }} onClick={() => setShowLogOut(true)}>
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
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
    </main>
  );
}

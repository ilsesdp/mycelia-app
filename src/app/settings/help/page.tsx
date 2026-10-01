import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/ui/AppBar";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { FAQ_ITEMS } from "@/lib/settings";

// Ports SCREENS['5.7'].
export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings" title="Help" />
      <div className="px-4" style={{ paddingTop: 16, flex: 1, paddingBottom: 24, overflowY: "auto" }}>
        <p className="body-m">Answers to the questions growers ask most.</p>
        <div style={{ height: 24 }} />

        <div className="label-caps">Common questions</div>
        <div style={{ height: 4 }} />
        {FAQ_ITEMS.map((item, i) => (
          <SettingsRow key={item.q} title={item.q} href={`/settings/help/${i}`} />
        ))}

        <div style={{ height: 28 }} />
        <div className="label-caps">Still stuck?</div>
        <div style={{ height: 4 }} />
        <SettingsRow title="Contact support" sub="We usually reply within two working days." href="/settings/support" />
      </div>
    </main>
  );
}

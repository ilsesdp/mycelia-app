import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/ui/AppBar";
import { FAQ_ITEMS } from "@/lib/settings";

// Ports SCREENS['5.12'] — the shared FAQ-answer screen 5.7's rows open,
// addressed by index in the route instead of the prototype's S.faqTopic.
export default async function HelpArticlePage({ params }: PageProps<"/settings/help/[topic]">) {
  const { topic } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const index = Number(topic);
  const item = FAQ_ITEMS[index];
  if (!item) notFound();

  return (
    <main className="flex flex-col min-h-screen">
      <AppBar backHref="/settings/help" title="Help" />
      <div className="px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
        <div className="title-m" style={{ color: "var(--text-primary)" }}>
          {item.q}
        </div>
        <div style={{ height: 16 }} />
        <p className="body-m">{item.a}</p>
        <div style={{ height: 28 }} />
        <div style={{ height: 1, background: "var(--border-subtle)" }} />
        <div style={{ height: 16 }} />
        <p className="body-s">Still need a hand?</p>
        <div style={{ height: 8 }} />
        <a href="/settings/support" className="btn btn-secondary" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
          Contact support
        </a>
      </div>
    </main>
  );
}

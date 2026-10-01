import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyThreads } from "@/lib/messages";
import { BottomNav } from "@/components/browse/BottomNav";
import { Icon } from "@/components/ui/Icon";

// Ports SCREENS['3.1'] (thread list) and ['3.2'] (no messages yet) as one
// route, same split as the other browse/filter screen pairs: with no
// threads it's 3.2, otherwise 3.1. Messages requires being logged in —
// there's no anonymous inbox to show — so this redirects to /welcome the
// same way BottomNav's Profile tab already does for a logged-out tap.
export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/welcome");

  const threads = await getMyThreads(supabase, user.id);

  return (
    <main className="flex flex-col min-h-screen" style={{ paddingBottom: 70 }}>
      <div className="flex-1" style={{ overflowY: "auto" }}>
        <div className="col px-4" style={{ paddingTop: 16, paddingBottom: 24 }}>
          <div className="display-xl" style={{ color: "var(--text-primary)" }}>
            Messages
          </div>

          {threads.length === 0 ? (
            <div className="flex flex-col items-center gap-3" style={{ paddingTop: 80 }}>
              <div className="flex flex-col items-center gap-3" style={{ padding: "24px 16px" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "1.5px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-primary)",
                  }}
                >
                  <Icon name="msg" size={24} />
                </div>
                <div className="title-m" style={{ color: "var(--text-primary)", textAlign: "center" }}>
                  No messages yet
                </div>
                <p className="body-m" style={{ textAlign: "center" }}>
                  When a grower or a visitor gets in touch, it lands here.
                </p>
              </div>
              <Link href="/map" className="btn btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                Find growers near you
              </Link>
            </div>
          ) : (
            <>
              <div style={{ height: 16 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                {threads.map((t, i) => (
                  <Link
                    key={t.id}
                    href={`/messages/${t.id}`}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "12px 0",
                      borderBottom: i < threads.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border-subtle)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div className="body-m-strong" style={{ flex: 1, minWidth: 0 }}>
                          {t.displayName}
                        </div>
                        <div className="caption" style={{ whiteSpace: "nowrap" }}>
                          {t.when}
                        </div>
                      </div>
                      <div className="body-s">{t.preview}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav active="Messages" loggedIn={true} />
    </main>
  );
}

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
      <div>
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
                      position: "relative",
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
                        background: "var(--harvest-green-100)",
                        border: "1px solid var(--border-subtle)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M14.0984 5.24978C11.9016 6.96541 11.0254 8.90436 9.8415 11.3137C8.86797 13.2952 7.2869 14.9 5.16387 15.6011C6.79947 15.0031 6.86483 12.1957 6.78747 10.6157C6.69563 8.7533 6.85895 6.78939 7.89535 5.18535C10.3192 1.4335 15.223 0.885034 19.1814 0C19.1995 1.98307 19.228 3.96591 19.1339 5.94659C18.9136 10.5728 16.5621 14.7392 12.6178 17.1012C9.24164 19.1112 5.1883 19.8172 1.32361 19.9356C0.791203 19.9519 0.471937 19.9555 0.182402 19.9807C0.12178 19.9885 0.0609845 19.995 7.07353e-06 20C0.0606365 19.9924 0.120847 19.9861 0.182402 19.9807C1.50037 19.8106 2.73613 18.997 3.96958 18.4784C6.8983 17.2808 9.17016 14.7206 10.4495 11.8443C11.7813 8.85075 12.7064 6.89255 15.0602 4.55366C14.701 4.77638 14.4286 4.98639 14.0984 5.24978Z"
                          fill="#385912"
                        />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div className="body-m-strong" style={{ flex: 1, minWidth: 0 }}>
                          {t.displayName}
                        </div>
                        <div className="caption" style={{ whiteSpace: "nowrap" }}>
                          {t.when}
                        </div>
                      </div>
                      <p className="body-s">{t.preview}</p>
                    </div>
                    {t.unread && (
                      <span
                        aria-label="Unread"
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: 0,
                          transform: "translateY(-50%)",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--text-brand)",
                        }}
                      />
                    )}
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

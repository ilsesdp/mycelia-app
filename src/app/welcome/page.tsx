import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Ports SCREENS['1.1'] — the welcome screen.
export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between px-4 py-10">
      <div />
      <div className="flex flex-col items-center text-center gap-1">
        <Image src="/logo.png" alt="Mycelia" width={93 * 2.02} height={93} priority />
        <div className="title-l" style={{ color: "var(--text-primary)" }}>
          Mycelia
        </div>
        <div style={{ height: 20 }} />
        <div className="title-m" style={{ color: "var(--text-brand)" }}>
          Find local farms.
          <br />
          Be found by them.
        </div>
        <div style={{ height: 10 }} />
        <div className="caption">Built by growers</div>
      </div>
      <div className="flex flex-col gap-3">
        <Link href="/signup">
          <Button variant="primary">Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
      </div>
    </main>
  );
}

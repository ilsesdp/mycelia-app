import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Clarity } from "@/components/analytics/Clarity";
import "./globals.css";

// Fraunces = display/heading font (Black weight is display-only, per
// farmers_design_tokens.md — never use it below ~30px). Inter = body font
// ("Inter/chip" and "Inter/overline" text styles both live in this family).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mycelia",
  description: "A map-first app connecting rural growers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Clarity />
        {children}
      </body>
    </html>
  );
}

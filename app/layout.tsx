import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Clash — when will two teams meet?",
  description:
    "Pick any two teams from the 2026 FIFA World Cup and find the earliest round they could face each other, from the group stage to the final.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

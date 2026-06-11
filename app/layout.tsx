import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demand-Led Booking Intelligence",
  description: "MVP for venue-side artist booking recommendations using demand-led scoring.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

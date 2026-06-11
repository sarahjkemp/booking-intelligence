import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Intelligence Score",
  description: "MVP for commercial booking viability scoring for independent music venues.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

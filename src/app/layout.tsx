import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Studio Oldebroek – Klantvolgsysteem",
  description: "Voeding- en InBody-monitoring voor klanten van PT Studio Oldebroek",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}

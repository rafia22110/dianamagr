import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata: Metadata = {
  title: "דיאנה רחמני - מטבח פרסי, תקווה ובריחה מטהרן",
  description: "כוכבת מאסטר שף, מחברת ספר 'הבריחה מטהרן', ומובילת המטבח הפרסי בישראל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-[#f9f7f4] text-[#333] min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

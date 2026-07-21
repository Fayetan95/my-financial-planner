import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My financial planning",
  description: "Run a no-login retirement projection with saved results and recommendations.",
  openGraph: {
    title: "My financial planning",
    description: "Run a no-login retirement projection with saved results and recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

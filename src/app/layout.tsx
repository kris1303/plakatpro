import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlakatPro - Kampagnenmanagement",
  description: "Professionelles Kampagnenmanagement für Plakatkampagnen",
  keywords: ["Plakat", "Kampagne", "Marketing", "Werbung", "Plakatierung"],
  authors: [{ name: "Werbeinsel - Kristian Cajic" }],
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#FFD800",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PlakatPro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

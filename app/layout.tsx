import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { PWARegister } from "@/components/pwa-register";
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import "temporal-polyfill/global";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plan'Event",
  description:
    "Application de coordination de groupe pour événements. Découvrez des événements, créez des groupes de discussion et organisez vos sorties en salle.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plan'Event",
  },
  icons: {
    icon: [
      { url: "/192.png", sizes: "192x192", type: "image/png" },
      { url: "/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWARegister />
          <div className="flex flex-col min-h-screen">
            <Header />
            {/* Navigation en haut sur desktop */}
            <div className="hidden md:block">
              <Navigation />
            </div>
            {/* Contenu principal avec padding bottom sur mobile pour la nav */}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            {/* Navigation en bas sur mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
              <Navigation />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bambatickets.com"),
  title: {
    default: "Bamba Tickets",
    template: "%s | Bamba Tickets",
  },
  description:
    "Discover unforgettable live experiences and manage events effortlessly. Secure your tickets instantly with M-Pesa.",
  keywords: [
    "events",
    "tickets",
    "kenya",
    "m-pesa",
    "bamba tickets",
    "live events",
  ],
  authors: [{ name: "Bamba Tickets" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Bamba Tickets",
    description: "Discover, book, and manage premium event tickets seamlessly.",
    siteName: "Bamba Tickets",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bamba Tickets",
    description: "Secure your event passes instantly.",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500/30 selection:text-orange-50`}
      >
        <SessionProvider>
          <NextTopLoader
            color="#f97316"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #f97316, 0 0 5px #f97316"
            zIndex={1600}
          />

          <main className="flex-1 flex flex-col">{children}</main>

          <Toaster
            position="top-right"
            richColors
            theme="dark"
            closeButton
            toastOptions={{
              className: "font-sans",
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}

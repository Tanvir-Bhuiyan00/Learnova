import type { Metadata } from "next";
import { Inter, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProviders from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import ChatbotMount from "@/components/modules/Chatbot/ChatbotMount";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://learnova-lms.duckdns.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Learnova — Master Skills Without Limits",
    template: "%s | Learnova",
  },
  description:
    "Transform your future with expert-led online courses. Simple, transparent learning designed for ambitious individuals.",
  applicationName: "Learnova",
  keywords: [
    "online courses",
    "learn online",
    "programming courses",
    "expert-led learning",
    "certificates",
    "Learnova",
  ],
  manifest: "/manifest.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
  appleWebApp: {
    capable: true,
    title: "Learnova",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Learnova",
    title: "Learnova — Master Skills Without Limits",
    description:
      "Expert-led online courses for ambitious people. Learn at your own pace, earn real certificates, and grow without limits.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@learnova",
    title: "Learnova — Master Skills Without Limits",
    description:
      "Expert-led online courses for ambitious people. Learn at your own pace, earn real certificates, and grow without limits.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    document.documentElement.classList.toggle("dark", stored === "dark");
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fastly.picsum.photos" />
        <link rel="preconnect" href="https://picsum.photos" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProviders>{children}</QueryProviders>
        <ChatbotMount />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

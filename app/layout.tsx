import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import PwaRegister from "./components/PwaRegister";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0052cc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "GamaNext Employee Matrix Portal",
  description: "Official Employee Portal for GamaNext Software Solutions - Timesheets, Leaves, WFH, Projects & Profile",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GamaNext",
  },
  icons: {
    icon: [
      { url: "/app-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/app-icon.jpeg", sizes: "192x192", type: "image/jpeg" },
    ],
    shortcut: "/app-icon.png",
    apple: [
      { url: "/app-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/app-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/app-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/app-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GamaNext" />
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col bg-slate-100 text-slate-900`}>
        <PwaRegister />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

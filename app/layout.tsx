import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GamaNext Employee Matrix Portal",
  description: "Official Employee Portal for GamaNext Software Solutions - Timesheets, Leaves, WFH, Projects & Profile",
  icons: {
    icon: "/gamanext-matrix-app-icon.jpeg",
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
      className={`${comfortaa.variable} h-full antialiased`}
    >
      <body className={`${comfortaa.className} min-h-full flex flex-col bg-slate-100 text-slate-900`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

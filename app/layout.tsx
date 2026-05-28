import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { SwipeNav } from "@/components/swipe-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TT Coach — 탁구 상대 유형별 파훼법",
  description: "상대 유형을 분류하고 파훼법을 쌓아가는 탁구 1:1 코치 노트",
  applicationName: "TT Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TT Coach",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-stone-100">
        <SwipeNav />
        <Nav />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-[11px] text-[#5a5a62] py-6 tracking-widest uppercase">
          TT COACH · MVP
        </footer>
      </body>
    </html>
  );
}

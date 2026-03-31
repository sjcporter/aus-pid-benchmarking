import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AnnotationPanel from "@/components/interactive/AnnotationPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Australian National PID Benchmarking Dashboard",
  description:
    "Interactive dashboard for the Australian National Persistent Identifier (PID) Benchmarking Toolkit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="h-full flex flex-col antialiased">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Breadcrumb />
            <div className="px-6 pb-8">{children}</div>
          </main>
        </div>
        <AnnotationPanel />
      </body>
    </html>
  );
}

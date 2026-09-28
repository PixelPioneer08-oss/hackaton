import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "DealBook — AI Sales Call Memory",
  description: "Brief yourself in 10 seconds before every call. DealBook remembers every interaction, objection, and competitor mention.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-dm-bg text-dm-text min-h-screen antialiased`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#151B26",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#E5E7EB",
            },
          }}
        />
      </body>
    </html>
  );
}

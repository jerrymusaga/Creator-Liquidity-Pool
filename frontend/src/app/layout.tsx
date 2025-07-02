import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "@/providers/Web3Providers"; 
import { initializeZoraSDK } from "@/config/zora";
import "./globals.css";

// Initialize Zora SDK on app start
if (typeof window !== 'undefined') {
  initializeZoraSDK();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", 
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vibe - Creator Coins",
  description: "Creator economies with automatic V4 rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>  {/* Wrap with Web3Provider */}
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1F2937",
                color: "#F3F4F6",
                border: "1px solid #8B5CF6",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { LayoutUIWrapper } from "@/components/LayoutUIWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "U-Micro | High-Yield Medical QBanks",
  description: "Topic-specific USMLE question banks tailored for Step 1 and Step 2 CK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased clinical-gradient min-h-screen flex flex-col`}>
        <Providers>
          <LayoutUIWrapper />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

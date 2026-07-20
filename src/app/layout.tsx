import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Providers } from "@/components/Providers";
import { LayoutUIWrapper } from "@/components/LayoutUIWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK"] });

export const metadata: Metadata = {
  title: "Micro Q Bank | Premium Question Banks",
  description: "Topic-specific question banks tailored for medical excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased min-h-screen flex flex-col`}>
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

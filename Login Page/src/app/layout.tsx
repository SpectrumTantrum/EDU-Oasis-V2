import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pixel"
});

export const metadata: Metadata = {
  title: "OASIS EDU",
  openGraph: {
    title: "OASIS EDU",
    images: ["https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body className={`${pixel.variable} ${pixel.className} antialiased bg-oasis-bg text-oasis-text`}>
        {children}
      </body>
    </html>
  );
}

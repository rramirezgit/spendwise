import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spendwise — fast personal expense tracking",
  description:
    "Log any expense in two taps. Mobile-first personal expense tracker with instant category classification, built with Next.js, Prisma and TanStack Query.",
};

export const viewport: Viewport = {
  themeColor: "#08080b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

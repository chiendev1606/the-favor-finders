import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Flavor Finders",
  description: "Group meal voting made easy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-orange-50 font-[family-name:var(--font-geist-sans)] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
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
    <html lang="en" className={`${roboto.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-orange-50 font-[family-name:var(--font-roboto)] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

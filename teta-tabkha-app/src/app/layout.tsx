import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a placeholder for now
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Amiri, Comic_Neue } from 'next/font/google'; // Importing specified fonts

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-amiri',
});

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-comic-neue',
});

export const metadata: Metadata = {
  title: "Teta Tab5a",
  description: "Your AI Sudanese grandma who scolds, loves, and feeds you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${amiri.variable} ${comicNeue.variable}`}>
      <body className={`font-comicNeue bg-brand-flour text-brand-spice`}>
        <Header />
        <main className="min-h-screen container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

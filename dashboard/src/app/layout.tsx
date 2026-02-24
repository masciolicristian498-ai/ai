import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyAI - Il tuo piano di studio intelligente",
  description: "Piattaforma AI per studenti universitari italiani. Piano di studio personalizzato con countdown, simulazioni d'esame e tracking progressi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="mesh-gradient" />
        {children}
      </body>
    </html>
  );
}

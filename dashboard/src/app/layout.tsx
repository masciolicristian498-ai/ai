import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

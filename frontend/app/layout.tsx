import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Karang Taruna - Home",
  description: "Platform digital resmi Karang Taruna",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id"> 
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      {/* Warna bg-surface (terang) akan otomatis diterapkan ke seluruh layar */}
      <body className="bg-surface text-on-surface min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
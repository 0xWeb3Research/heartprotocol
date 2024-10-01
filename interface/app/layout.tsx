import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heart Protocol",
  description: "Heart Protocol: Earn to find Love",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-plus-jakarta-sans">
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Fourth & Goal - AI Fantasy Football Assistant",
  description: "Your AI-powered ESPN fantasy football assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <Navigation />
        {children}
      </body>
    </html>
  );
}

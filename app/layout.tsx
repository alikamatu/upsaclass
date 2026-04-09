import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UPSA Classroom Allocation",
  description: "Web-based classroom allocation and rescheduling system",
};

import { AuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-right" expand={false} richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

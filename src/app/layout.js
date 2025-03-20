import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Multi-Vendor E-commerce",
  description: "A modern multi-vendor e-commerce platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster position="top-center" />
        </AuthProvider>

      </body>
    </html>
  );
}

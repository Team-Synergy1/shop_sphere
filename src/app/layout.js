"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// export const metadata = {
//   title: "Multi-Vendor E-commerce",
//   description: "A modern multi-vendor e-commerce platform",
// };

export default function RootLayout({ children }) {
	const queryClient = new QueryClient();

	return (
		<html lang="en">
			<head>
				<title>Multi-Vendor E-commerce</title>
				<meta
					name="description"
					content="A modern multi-vendor e-commerce platform"
				/>
			</head>
			<AuthProvider>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				
					<QueryClientProvider client={queryClient}>
						<Navbar />
       

						{children}
						<Footer />
						<Toaster position="top-center" richColors="true"/>
					</QueryClientProvider>
			
			</body>
			</AuthProvider>
		</html>
	);
}

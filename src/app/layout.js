"use client";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShoppingProvider } from "@/context/ShoppingContext";

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<SessionProvider>
					<QueryProvider>
						<ShoppingProvider>
							<Navbar />
							{children}
							<Footer />
							<Toaster />
						</ShoppingProvider>
					</QueryProvider>
				</SessionProvider>
			</body>
		</html>
	);
}

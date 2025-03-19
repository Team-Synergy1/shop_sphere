"use client";

import React, { useState } from "react";

import {
	Home,
	ShoppingBag,
	Users,
	BarChart2,
	Settings,
	Package,
	Tag,
	Heart,
	Bell,
	Store,
	User,
	CreditCard,
	HelpCircle,
	Truck,
	Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/ui/sidebar";

const navigationByRole = {
	admin: [
		{ name: "Dashboard", href: "/dashboard", icon: Home },
		{
			name: "Products",
			href: "/dashboard/products",
			icon: Package,
			submenu: [
				{ name: "All Products", href: "/dashboard/products" },
				{ name: "Add Product", href: "/dashboard/products/add" },
			],
		},
		{ name: "Categories", href: "/dashboard/categories", icon: Tag },
		{ name: "Orders", href: "/dashboard/orders", icon: ShoppingBag, badge: "" },
		{ name: "Customers", href: "/dashboard/customers", icon: Users },
		{ name: "Vendors", href: "/dashboard/vendors", icon: Store },
		{ name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
		{ name: "Settings", href: "/dashboard/settings", icon: Settings },
	],
	vendor: [
		{ name: "Dashboard", href: "/dashboard", icon: Home },
		{ name: "My Products", href: "/dashboard/products", icon: Package },
		{ name: "Add Product", href: "/addProduct", icon: Package },
		{ name: "Orders", href: "/dashboard/orders", icon: ShoppingBag, badge: "" },
		{ name: "Store Settings", href: "/dashboard/store", icon: Store },
		{ name: "Earnings", href: "/dashboard/earnings", icon: CreditCard },
		{ name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
	],
	user: [
		{ name: "My Account", href: "/dashboard", icon: User },
		{
			name: "My Orders",
			href: "/dashboard/orders",
			icon: ShoppingBag,
			badge: "",
		},
		{ name: "Track Orders", href: "/dashboard/track", icon: Truck },
		{ name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
		{ name: "Payment Methods", href: "/dashboard/payment", icon: CreditCard },
		{ name: "Addresses", href: "/dashboard/addresses", icon: Home },
		{ name: "Help Center", href: "/dashboard/help", icon: HelpCircle },
	],
};

const roleInfo = {
	admin: {
		title: "Admin Dashboard",
		name: "Admin User",
		email: "admin@shopmart.com",
		description: "Manage your store and monitor performance",
		avatar: "AD",
	},
	vendor: {
		title: "Vendor Dashboard",
		name: "Vendor Store",
		email: "vendor@shopmart.com",
		description: "Manage your products and view sales",
		avatar: "VS",
	},
	user: {
		title: "My Account",
		name: "John Smith",
		email: "john@example.com",
		description: "View your orders and manage preferences",
		avatar: "JS",
	},
};

export default function Dashboard({ children }) {
	const [userRole, setUserRole] = useState("admin");
	const currentRoleInfo = roleInfo[userRole] || roleInfo.user;

	return (
		<div className="grid lg:grid-cols-12 min-h-screen bg-background">
			{/* mobile */}
			<div className="lg:hidden fixed top-4 left-4 z-40">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="p-0 w-72">
						<Sidebar
							userRole={userRole}
							navigationByRole={navigationByRole}
							roleInfo={roleInfo}
						/>
					</SheetContent>
				</Sheet>
			</div>

			{/* role btn */}
			<div className="fixed top-4 right-4 z-50 flex gap-2">
				<Button
					size="sm"
					variant={userRole === "admin" ? "default" : "outline"}
					onClick={() => setUserRole("admin")}
				>
					Admin View
				</Button>
				<Button
					size="sm"
					variant={userRole === "vendor" ? "default" : "outline"}
					onClick={() => setUserRole("vendor")}
				>
					Vendor View
				</Button>
				<Button
					size="sm"
					variant={userRole === "user" ? "default" : "outline"}
					onClick={() => setUserRole("user")}
				>
					User View
				</Button>
			</div>

			{/* desktop*/}
			<div className="hidden lg:block lg:col-span-3 border-r bg-card">
				<Sidebar
					userRole={userRole}
					navigationByRole={navigationByRole}
					roleInfo={roleInfo}
				/>
			</div>

			{/* header */}
			<div className="col-span-12 lg:col-span-9 p-6 overflow-auto">
				<header className="mb-6 flex justify-between items-center">
					<h1 className="text-2xl font-bold">{currentRoleInfo.title}</h1>
					<div className="flex items-center gap-4">
						<Button variant="outline" size="icon">
							<Bell className="h-5 w-5" />
						</Button>
						<Separator orientation="vertical" className="h-6" />
						<Avatar>
							<AvatarImage
								src="/api/placeholder/40/40"
								alt={currentRoleInfo.name}
							/>
							<AvatarFallback>{currentRoleInfo.avatar}</AvatarFallback>
						</Avatar>
					</div>
				</header>

				<Separator className="mb-6" />

				{/* page show */}
				<main>{children}</main>
			</div>
		</div>
	);
}

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
	Bell,
	Home,
	LogOut,
	Menu,
	MessageSquare,
	Settings,
	User,
	ShoppingBag,
	Heart,
	MapPin,
	CreditCard,
	Star,
	Package,
	ShoppingCart,
	BarChart2,
	Users,
	Truck,
	Store,
	FileText,
	DollarSign,
	Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import Loader from "../loading";

export default function DashboardLayout({ children }) {
	const pathname = usePathname();
	const { data: session, status } = useSession();

	const userInfo = {
		name: session?.user?.name,
		email: session?.user?.email,
		image: session?.user?.image,
	};

	// Navigation items based on user role
	const navigationConfig = {
		user: {
			title: "My Account",
			items: [
				{
					href: "/dashboard/user",
					icon: <Home className="h-5 w-5" />,
					label: "Dashboard",
				},
				{
					href: "/dashboard/user/orders",
					icon: <ShoppingBag className="h-5 w-5" />,
					label: "My Orders",
				},
				{
					href: "/dashboard/user/wishlist",
					icon: <Heart className="h-5 w-5" />,
					label: "Wishlist",
				},
				{
					href: "/dashboard/user/addresses",
					icon: <MapPin className="h-5 w-5" />,
					label: "Addresses",
				},
				{
					href: "/dashboard/user/payment",
					icon: <CreditCard className="h-5 w-5" />,
					label: "Payment Methods",
				},
				{
					href: "/dashboard/user/reviews",
					icon: <Star className="h-5 w-5" />,
					label: "Reviews",
				},
				{
					href: "/dashboard/user/profile",
					icon: <User className="h-5 w-5" />,
					label: "Profile",
				},
			]
		},
		vendor: {
			title: "Vendor Dashboard",
			items: [
				{
					href: "/dashboard/vendor",
					icon: <Home className="h-5 w-5" />,
					label: "Dashboard",
				},
				{
					href: "/dashboard/vendor/allProduct",
					icon: <Package className="h-5 w-5" />,
					label: "Products",
				},
				{
					href: "/dashboard/vendor/orders",
					icon: <ShoppingCart className="h-5 w-5" />,
					label: "Orders",
				},
				{
					href: "/dashboard/vendor/analytics",
					icon: <BarChart2 className="h-5 w-5" />,
					label: "Analytics",
				},
				{
					href: "/dashboard/vendor/customers",
					icon: <Users className="h-5 w-5" />,
					label: "Customers",
				},
				{
					href: "/dashboard/vendor/shipping",
					icon: <Truck className="h-5 w-5" />,
					label: "Shipping",
				},
				{
					href: "/dashboard/vendor/payments",
					icon: <CreditCard className="h-5 w-5" />,
					label: "Payments",
				},
				{
					href: "/dashboard/vendor/settings",
					icon: <Settings className="h-5 w-5" />,
					label: "Store Settings",
				},
			]
		},
		admin: {
			title: "Admin Dashboard",
			items: [
				{
					href: "/dashboard/admin",
					icon: <Home className="h-5 w-5" />,
					label: "Dashboard",
				},
				{
					href: "/dashboard/admin/users",
					icon: <Users className="h-5 w-5" />,
					label: "Users",
				},
				{
					href: "/dashboard/admin/vendors",
					icon: <Store className="h-5 w-5" />,
					label: "Vendors",
				},
				{
					href: "/dashboard/admin/products",
					icon: <ShoppingBag className="h-5 w-5" />,
					label: "Products",
				},
				{
					href: "/dashboard/admin/orders",
					icon: <ShoppingCart className="h-5 w-5" />,
					label: "Orders",
				},
				{
					href: "/dashboard/admin/categories",
					icon: <Layers className="h-5 w-5" />,
					label: "Categories",
				},
				{
					href: "/dashboard/admin/financials",
					icon: <DollarSign className="h-5 w-5" />,
					label: "Financials",
				},
				{
					href: "/dashboard/admin/reports",
					icon: <FileText className="h-5 w-5" />,
					label: "Reports",
				},
				{
					href: "/dashboard/admin/settings",
					icon: <Settings className="h-5 w-5" />,
					label: "Settings",
				},
			]
		}
	};

	// Determine current user role and get navigation items
	const role = session?.user?.role || "user";
	const { title, items: navItems } = navigationConfig[role];

	if (status === "loading") {
		return (
			<Loader></Loader>
		);
	}

	return (
		<div className="flex min-h-screen bg-background">
			{/* Fixed Desktop Sidebar */}
			<aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 shadow-md bg-background z-40 border-r">
				<div className="h-16 flex items-center px-6 border-b">
					<Link href="/" className="flex items-center space-x-2">
						<ShoppingBag className="h-6 w-6 text-primary" />
						<span className="text-xl font-bold text-primary">ShopSphere</span>
					</Link>
				</div>

				{/* Scrollable Navigation */}
				<nav className="flex-1 overflow-y-auto py-4 px-3">
					<div className="space-y-1">
						{navItems?.map((item, i) => (
							<Link
								key={i}
								href={item?.href}
								className={cn(
									"flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all",
									pathname === item?.href
										? "bg-primary/10 text-primary font-medium"
										: "text-muted-foreground hover:bg-muted-foreground/10"
								)}
							>
								{item?.icon}
								{item?.label}
							</Link>
						))}
					</div>
				</nav>
			</aside>

			{/* Tablet Sidebar - Collapsed icons only */}
			<aside className="hidden md:flex lg:hidden flex-col fixed left-0 top-0 bottom-0 w-16 shadow-md bg-background z-40 border-r">
				<div className="h-16 flex items-center justify-center border-b">
					<Link href="/" className="flex items-center justify-center">
						<ShoppingBag className="h-6 w-6 text-primary" />
					</Link>
				</div>

				{/* Scrollable Navigation - Icons Only */}
				<nav className="flex-1 overflow-y-auto py-4 px-2">
					<div className="space-y-1">
						{navItems?.map((item, i) => (
							<Link
								key={i}
								href={item?.href}
								className={cn(
									"flex items-center justify-center p-3 rounded-lg transition-all",
									pathname === item?.href
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-muted-foreground/10"
								)}
								title={item.label}
							>
								{item?.icon}
							</Link>
						))}
					</div>
				</nav>
			</aside>

			{/* Main Content Area - Adjusted for fixed sidebar on different screens */}
			<div className="flex-1 flex flex-col h-screen md:ml-16 lg:ml-64">
				 {/* Fixed Top Header */}
				<header className="fixed top-0 right-0 md:right-0 left-0 md:left-16 lg:left-64 z-30 h-16 bg-background border-b shadow-sm flex items-center justify-between px-4 md:px-6">
					{/* Mobile Menu Button and Logo */}
					<div className="flex items-center md:hidden">
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" size="icon" className="mr-2 cursor-pointer">
									<Menu className="h-6 w-6" />
									<span className="sr-only">Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="p-0 w-64">
								<SheetHeader className="h-16 border-b">
									<SheetTitle className="flex items-center">
										<ShoppingBag className="h-6 w-6 text-primary mr-2" />
										<span className="text-xl font-bold text-primary">ShopSphere</span>
									</SheetTitle>
								</SheetHeader>

								{/* Scrollable Mobile Navigation */}
								<div className="overflow-y-auto h-full">
									<nav className="px-3">
										{navItems?.map((item, i) => (
											<SheetClose key={i} asChild>
												<Link
													href={item?.href}
													className={cn(
														"flex items-center gap-3 px-4 py-3 text-sm rounded-lg mb-1 transition-all",
														pathname === item?.href
															? "bg-primary/10 text-primary font-medium"
															: "text-muted-foreground hover:bg-muted-foreground/10"
													)}
												>
													{item?.icon}
													{item?.label}
												</Link>
											</SheetClose>
										))}
									</nav>
								</div>
							</SheetContent>
						</Sheet>

						<Link href="/" className="md:hidden flex items-center">
							<ShoppingBag className="h-6 w-6 text-primary mr-2" />
							<span className="font-bold text-primary">ShopSphere</span>
						</Link>
					</div>

					{/* Page Title (Desktop & Tablet) */}
					<h1 className="text-lg font-semibold hidden md:block">{title}</h1>

					{/* Placeholder for mobile logo alignment */}
					<div className="md:hidden"></div>

					{/* Right Side Actions */}
					<div className="flex items-center gap-2 md:gap-3">
						<Button
							variant="ghost"
							size="icon"
							className="relative h-9 w-9 rounded-full cursor-pointer"
						>
							<Bell className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
						</Button>

						<Button
							variant="ghost"
							size="icon"
							className="relative h-9 w-9 rounded-full cursor-pointer"
						>
							<MessageSquare className="h-5 w-5" />
							<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
						</Button>

						<UserNav userInfo={userInfo} />
					</div>
				</header>

				{/* Main Content - With proper spacing and scrolling */}
				<main className="flex-1 overflow-y-auto pt-16">
					<div className="p-4 md:p-6">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}

function UserNav({ userInfo }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer p-0">
					<Avatar className="h-9 w-9">
						<AvatarImage src={userInfo?.image || ""} alt={userInfo?.name} />
						<AvatarFallback className="bg-primary/10 text-primary">
							{userInfo?.name?.charAt(0)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium">{userInfo?.name}</p>
						<p className="text-xs text-muted-foreground">{userInfo?.email}</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<User className="mr-2 h-4 w-4" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => signOut({ callbackUrl: "/" })}
					className="cursor-pointer text-primary focus:text-primary"
				>
					<LogOut className="text-primary mr-2 h-4 w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
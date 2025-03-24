"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";

const NavItem = ({ href, icon, label, active }) => (
	<Link
		href={href}
		className={cn(
			"flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
			active ? "bg-muted font-medium text-primary" : "text-muted-foreground"
		)}
	>
		{icon}
		{label}
	</Link>
);

export default function DashboardLayout({ children }) {
	const router = useRouter();
	const pathname = router.pathname;
	const { data: session, status } = useSession();

	const userInfo = {
		name: session?.user?.name,
		email: session?.user?.email,
		image: session?.user?.image,
	};
	let navItems = [
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
	];
	let title = "My Account";

	useEffect(() => {
		if (status === "loading") return;

		if (!session) {
			router.push("/login");
		} else if (session.user.role === "admin") {
			router.push("/dashboard/admin");
		} else if (session.user.role === "vendor") {
			router.push("/dashboard/vendor");
		} else if (session.user.role === "user") {
			router.push("/dashboard/user");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (session?.user?.role === "vendor") {
		navItems = [
			{
				href: "/dashboard/vendor",
				icon: <Home className="h-5 w-5" />,
				label: "Dashboard",
			},
			{
				href: "/dashboard/vendor/products",
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
		];
		title = "Vendor Dashboard";
	}
	if (session?.user?.role === "admin") {
		navItems = [
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
				icon: <ShoppingBag className="h-5 w-5" />,
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
		];
		title = "Admin Dashboard";
	}

	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:hidden">
				<Link href="/" className="flex items-center gap-2 font-semibold">
					<span>ShopSphere</span>
				</Link>
				<div className="flex items-center gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="h-9 w-9 cursor-pointer"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="pr-0 w-64">
							<SheetHeader className="sticky top-0 border-b z-50">
								<Link href="/">
									<SheetTitle className="text-2xl text-orange-500">
										ShopSphere
									</SheetTitle>
									
								</Link>
							</SheetHeader>

							<nav className="flex flex-col gap-4 px-2 py-4">
								{navItems?.map((item, i) => (
									<NavItem
										key={i}
										href={item?.href}
										icon={item?.icon}
										label={item?.label}
										active={pathname === item?.href}
									/>
								))}
							</nav>
						</SheetContent>
					</Sheet>
					<UserNav userInfo={userInfo} />
				</div>
			</header>

			<div className="flex flex-1">
				<aside className="hidden w-64 flex-col border-r bg-background md:flex">
					<div className="flex p-4 items-center">
						<Link href="/" className=" font-semibold">
							<h3 className="text-xl ">ShopSphere</h3>
							
						</Link>
					</div>
					<nav className="flex flex-col gap-2 p-4">
						{navItems?.map((item, i) => (
							<NavItem
								key={i}
								href={item?.href}
								icon={item?.icon}
								label={item?.label}
								active={pathname === item?.href}
							/>
						))}
					</nav>
				</aside>

				<main className="flex flex-1 flex-col">
					<header className="hidden h-16 items-center justify-between border-b bg-background px-6 md:flex">
						<h1 className="text-lg font-semibold">{title}</h1>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="icon"
								className="relative h-9 w-9"
							>
								<Bell className="h-5 w-5" />
								<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
							</Button>
							<Button variant="outline" size="icon" className="h-9 w-9">
								<MessageSquare className="h-5 w-5" />
							</Button>
							<UserNav userInfo={userInfo} />
						</div>
					</header>
					<div className="flex-1 p-4 md:p-6">{children}</div>
				</main>
			</div>
		</div>
	);
}

function UserNav({ userInfo }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="relative h-9 w-9 rounded-full cursor-pointer"
				>
					<Avatar className="h-9 w-9">
						<AvatarImage src={userInfo?.image || ""} alt={userInfo?.name} />
						<AvatarFallback>{userInfo?.name?.charAt(0)}</AvatarFallback>
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
					className="cursor-pointer"
				>
					<LogOut className="mr-2 h-4 w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

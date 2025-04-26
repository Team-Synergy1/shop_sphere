"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
	Search,
	ShoppingCart,
	Heart,
	User,
	Bell,
	ChevronDown,
	Menu,
	Package,
	LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "../ui/separator";

import { usePathname } from "next/navigation";

const categories = [
	{ name: "Products", url: "/products" },
	{ name: "Electronics", url: "/category/electronics" },
	{ name: "Fashion", url: "/category/fashion" },
	{ name: "Home", url: "/category/home" },
	{ name: "Beauty", url: "/category/beauty" },
	{ name: "Baby & Toys", url: "/category/baby-toys" },
	{ name: "Groceries", url: "/category/groceries" },
	{ name: "Sports & Outdoors", url: "/category/sports" },
	{ name: "Automotive", url: "/category/automotive" },
];

// Optimize the useCartCount hook
const useCartCount = () => {
	const { data: session } = useSession();
	const [cartItemCount, setCartItemCount] = useState(0);
	const lastFetchTime = useRef(0);

	const fetchCartItems = useCallback(
		async (force = false) => {
			if (!session?.user) return;

			const now = Date.now();
			if (!force && now - lastFetchTime.current < 2000) return;

			try {
				lastFetchTime.current = now;
				const response = await fetch("/api/addCart");
				const data = await response.json();
				setCartItemCount(data?.cart?.length || 0);
			} catch (error) {
				console.error("Failed to fetch cart items:", error);
				setCartItemCount(0);
			}
		},
		[session]
	);

	useEffect(() => {
		if (session?.user) {
			fetchCartItems(true);
		}

		// Less frequent polling - every 30 seconds
		const intervalId = setInterval(() => fetchCartItems(), 30000);

		// Use RAF for smoother updates
		let frameId;
		const handleStorageChange = (event) => {
			if (event.key === "shopSphereCart") {
				cancelAnimationFrame(frameId);
				frameId = requestAnimationFrame(() => {
					try {
						if (event.newValue) {
							const newCart = JSON.parse(event.newValue);
							setCartItemCount(newCart?.cart?.length || 0);
						} else {
							setCartItemCount(0);
						}
					} catch (e) {
						console.error("Error parsing cart data:", e);
					}
				});
			}
		};

		const handleCartUpdate = (event) => {
			if (event.detail && event.detail.cartItems) {
				cancelAnimationFrame(frameId);
				frameId = requestAnimationFrame(() => {
					setCartItemCount(event.detail.cartItems.length || 0);
				});
			} else {
				fetchCartItems();
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
			window.addEventListener("cartUpdated", handleCartUpdate);
		}

		return () => {
			clearInterval(intervalId);
			cancelAnimationFrame(frameId);
			if (typeof window !== "undefined") {
				window.removeEventListener("storage", handleStorageChange);
				window.removeEventListener("cartUpdated", handleCartUpdate);
			}
		};
	}, [session, fetchCartItems]);

	return { cartItemCount, refreshCart: () => fetchCartItems(true) };
};

// Optimize the useWishlistCount hook
const useWishlistCount = () => {
	const { data: session } = useSession();
	const [wishlistItemCount, setWishlistItemCount] = useState(0);
	const lastFetchTime = useRef(0);

	const fetchWishlistItems = useCallback(
		async (force = false) => {
			if (!session?.user) return;

			const now = Date.now();
			if (!force && now - lastFetchTime.current < 2000) return;

			try {
				lastFetchTime.current = now;
				const response = await fetch("/api/user/wishlist");
				const data = await response.json();
				setWishlistItemCount(data?.wishlist?.length || 0);
			} catch (error) {
				console.error("Failed to fetch wishlist items:", error);
				setWishlistItemCount(0);
			}
		},
		[session]
	);

	useEffect(() => {
		if (session?.user) {
			fetchWishlistItems(true);
		}

		// Less frequent polling - every 30 seconds
		const intervalId = setInterval(() => fetchWishlistItems(), 30000);

		// Use RAF for smoother updates
		let frameId;
		const handleWishlistUpdate = (event) => {
			if (event.detail && event.detail.wishlistItems) {
				cancelAnimationFrame(frameId);
				frameId = requestAnimationFrame(() => {
					setWishlistItemCount(event.detail.wishlistItems.length || 0);
				});
			} else {
				fetchWishlistItems();
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("wishlistUpdated", handleWishlistUpdate);
		}

		return () => {
			clearInterval(intervalId);
			cancelAnimationFrame(frameId);
			if (typeof window !== "undefined") {
				window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
			}
		};
	}, [session, fetchWishlistItems]);

	return { wishlistItemCount, refreshWishlist: () => fetchWishlistItems(true) };
};

export default function Navbar() {
	const { data: session } = useSession();
	const { cartItemCount, refreshCart } = useCartCount();
	const { wishlistItemCount, refreshWishlist } = useWishlistCount();
	const pathName = usePathname();

	const handleLogout = () => {
		signOut({ callbackUrl: "/" });
	};

	if (!pathName.includes("dashboard")) {
		return (
			<header className="sticky top-0 z-50 bg-white shadow-sm">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between gap-4">
						{/* Mobile menu trigger */}
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="ghost" className="md:hidden cursor-pointer">
									<Menu size={24} />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64">
								<SheetHeader className="sticky top-0 border-b z-50">
									<SheetTitle className="text-2xl text-orange-500">
										ShopSphere
									</SheetTitle>
									<SheetDescription>
										A Multi-vendor E-commerce Site
									</SheetDescription>
								</SheetHeader>
								<div className="px-4 overflow-y-auto">
									<h3 className="text-sm font-medium mb-3 uppercase">
										Categories
									</h3>
									<div className="space-y-2">
										{categories.map((category) => (
											<Link
												key={category.name}
												href={category.url}
												className="block py-2 px-4 hover:bg-orange-50 hover:text-orange-500 rounded-md"
											>
												{category.name}
											</Link>
										))}
									</div>
									<Separator className="my-2" />
									<h3 className="text-sm font-medium my-3 uppercase">
										HELP & SETTINGS
									</h3>
									<div className="space-y-2">
										<Link
											href="/help-center"
											className="block py-2 px-4 hover:bg-orange-50 hover:text-orange-500 rounded-md"
										>
											Help Center
										</Link>
										<Link
											href="/sell"
											className="block py-2 px-4 hover:bg-orange-50 hover:text-orange-500 rounded-md"
										>
											Sell on ShopSphere
										</Link>
										<Link
											href="/contact"
											className="block py-2 px-4 hover:bg-orange-50 hover:text-orange-500 rounded-md"
										>
											Contact Us
										</Link>
									</div>
								</div>
								<SheetFooter className="sticky bottom-0 border-t z-50">
									<SheetClose asChild>
										{session ? (
											<Button
												variant="destructive"
												className={"cursor-pointer"}
												onClick={handleLogout}
											>
												<LogOut className="h-4 w-4" />
												Logout
											</Button>
										) : (
											<Button
												asChild
												className="bg-orange-500 hover:bg-orange-600"
											>
												<Link href="/login">Login</Link>
											</Button>
										)}
									</SheetClose>
								</SheetFooter>
							</SheetContent>
						</Sheet>

						{/* Logo */}
						<Link href="/" className="flex-shrink-0">
							<div className="font-bold text-2xl text-orange-500">
								ShopSphere
							</div>
						</Link>

						{/* Search bar */}
						<div className="flex-1 hidden md:flex">
							<div className="relative w-full max-w-3xl mx-auto">
								<Input type="text" placeholder="Search in ShopeSphere" />
								<Button className="absolute right-0 top-0 bottom-0 bg-orange-500 hover:bg-orange-600 rounded-l-none">
									<Search size={18} />
								</Button>
							</div>
						</div>

						{/* Navigation icons */}
						<div className="flex items-center gap-1 md:gap-3">
							{/* Cart */}
							<Link
								href="/cart"
								className="flex flex-col items-center p-1 text-gray-700 hover:text-orange-500"
								onClick={() => refreshCart()} // Refresh cart count when navigating to cart
							>
								<div className="relative">
									<ShoppingCart size={24} />
									{cartItemCount > 0 && (
										<span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
											{cartItemCount > 99 ? "99+" : cartItemCount}
										</span>
									)}
								</div>
								<span className="text-xs hidden md:inline-block">Cart</span>
							</Link>

							{/* Wishlist */}
							<Link
								href="/dashboard/user/wishlist"
								className="flex flex-col items-center p-1 text-gray-700 hover:text-orange-500"
								onClick={() => refreshWishlist()} // Refresh wishlist count when navigating to wishlist
							>
								<div className="relative">
									<Heart size={24} />
									{wishlistItemCount > 0 && (
										<span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
											{wishlistItemCount > 99 ? "99+" : wishlistItemCount}
										</span>
									)}
								</div>
								<span className="text-xs hidden md:inline-block">Wishlist</span>
							</Link>

							{/* Notifications */}
							{session && (
								<div
									
									className="flex flex-col items-center p-1 text-gray-700 hover:text-orange-500  sm:flex"
								>
									<div className="relative">
										<Bell size={24} />
										<span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
										
										</span>
									</div>
									<span className="text-xs hidden md:inline-block">
										Notifications
									</span>
								</div>
							)}

							{/* User dropdown */}
							{session ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="flex flex-col items-center p-1 h-auto"
										>
											<User size={24} />
											<span className="text-xs items-center hidden md:flex">
												{session && session.user.name}{" "}
												<ChevronDown size={12} className="ml-1" />
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuLabel>
											Welcome, {session.user.name}
										</DropdownMenuLabel>
										<DropdownMenuSeparator />

										<DropdownMenuItem>
											<Link href="dashboard/user/profile" className="w-full">
												My Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Link href="dashboard/user/orders" className="w-full">
												My Orders
											</Link>
										</DropdownMenuItem>
										{/* <DropdownMenuItem>
											<Link href="dashboard/user/returns" className="w-full">
												My Returns
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Link href="dashboard/user/cancellations" className="w-full">
												My Cancellations
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Link href="dashboard/user/reviews" className="w-full">
												My Reviews
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Link href="dashboard/user/vouchers" className="w-full">
												My Vouchers
											</Link>
										</DropdownMenuItem> */}
										{session.user.role === "user" && (
											<DropdownMenuItem asChild className={"cursor-pointer"}>
												<Link href="/dashboard/user">Dashboard</Link>
											</DropdownMenuItem>
										)}
										{session.user.role === "vendor" && (
											<DropdownMenuItem asChild className={"cursor-pointer"}>
												<Link
													href="/dashboard/vendor"
													className="flex items-center gap-2"
												>
													<Package className="h-4 w-4" />
													<span>Seller Center</span>
												</Link>
											</DropdownMenuItem>
										)}
										{session.user.role === "admin" && (
											<DropdownMenuItem asChild className={"cursor-pointer"}>
												<Link
													href="/dashboard/admin"
													className="flex items-center gap-2"
												>
													<Package className="h-4 w-4" />
													<span>Admin Panel</span>
												</Link>
											</DropdownMenuItem>
										)}
										<DropdownMenuSeparator />
										<Button
											variant="destructive"
											size={"sm"}
											className={"w-full cursor-pointer"}
											onClick={handleLogout}
										>
											<LogOut className="h-4 w-4" />
											Logout
										</Button>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Button asChild className="bg-orange-500 hover:bg-orange-600">
									<Link href="/login">Login</Link>
								</Button>
							)}
						</div>
					</div>

					{/* Mobile search */}
					<div className="mt-3 md:hidden">
						<div className="relative w-full">
							<Input type="text" placeholder="Search in ShopSphere" />
							<Button
								className="absolute right-0 top-0 bottom-0 bg-orange-500 hover:bg-orange-600 rounded-l-none py-1"
								size="sm"
							>
								<Search size={16} />
							</Button>
						</div>
					</div>
				</div>

				{/* Categories navbar */}
				<div className="border-t border-gray-200 hidden md:block">
					<div className="container mx-auto px-4">
						<div className="flex items-center gap-6 overflow-x-auto py-2 text-sm">
							{categories.map((category) => (
								<Link
									key={category.name}
									href={category.url}
									className="whitespace-nowrap hover:text-orange-500"
								>
									{category.name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</header>
		);
	}
	return null;
}

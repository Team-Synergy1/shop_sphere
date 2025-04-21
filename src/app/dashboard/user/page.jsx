"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Heart, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

const useWishlistCount = () => {
	const { data: session } = useSession();
	const [wishlistItemCount, setWishlistItemCount] = useState(0);

	const fetchWishlistItems = async () => {
		try {
			if (session?.user) {
				const response = await fetch("/api/user/wishlist");
				const data = await response.json();

				setWishlistItemCount(data?.wishlist?.length || 0);
			}
		} catch (error) {
			console.error("Failed to fetch wishlist items:", error);
			setWishlistItemCount(0);
		}
	};

	useEffect(() => {
		fetchWishlistItems();

		const intervalId = setInterval(fetchWishlistItems, 5000);

		const handleWishlistUpdate = (event) => {
			if (event.detail && event.detail.wishlistItems) {
				setWishlistItemCount(event.detail.wishlistItems.length || 0);
			} else {
				fetchWishlistItems();
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("wishlistUpdated", handleWishlistUpdate);
		}

		return () => {
			clearInterval(intervalId);
			if (typeof window !== "undefined") {
				window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
			}
		};
	}, [session]);

	return { wishlistItemCount, refreshWishlist: fetchWishlistItems };
};

export default function UserDashboard() {
	const { data: session, status } = useSession();
	const [orders, setOrders] = useState([]);
	const [addressCount, setAddressCount] = useState(0);
	const [rewardPoints, setRewardPoints] = useState(0);
	const [loading, setLoading] = useState(true);
	const { wishlistItemCount, refreshWishlist } = useWishlistCount();
	const [wishlistItems, setWishlistItems] = useState([]);

	useEffect(() => {
		if (status !== "authenticated") return;
		setLoading(true);
		async function fetchData() {
			try {
				const ordersRes = await axios.get("/api/user/orders");
				setOrders(ordersRes.data.orders || []);

				const addressRes = await axios.get("/api/user/addresses");
				setAddressCount(addressRes.data.addresses?.length || 0);

				const pointsRes = await axios.get("/api/user/rewards");
				setRewardPoints(pointsRes.data.points || 0);

				const wishlistRes = await axios.get("/api/user/wishlist");
				if (wishlistRes.data) {
					console.log("Fetched wishlist item:", wishlistRes.data);
					setWishlistItems(wishlistRes.data);
				}
			} catch (e) {
				console.error("Error fetching dashboard data:", e);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [status]);

	if (loading) return <div>Loading...</div>;

	return (
		<div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
						<ShoppingBag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orders.length}</div>
						<p className="text-xs text-muted-foreground">
							+2 orders this month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Wishlist Items
						</CardTitle>
						<Heart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{wishlistItemCount}</div>
						<p className="text-xs text-muted-foreground">
							{wishlistItemCount} items on your wishlist
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">
							Saved Addresses
						</CardTitle>
						<MapPin className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{addressCount}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Reward Points</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{rewardPoints}</div>
						<Progress value={rewardPoints / 10} className="mt-2" />
						<p className="mt-1 text-xs text-muted-foreground">
							{1000 - rewardPoints} more points for Gold tier
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="orders" className="mt-6">
				<TabsList>
					<TabsTrigger value="orders">Recent Orders</TabsTrigger>
					<TabsTrigger value="wishlist">Wishlist</TabsTrigger>
					<TabsTrigger value="reviews">Reviews</TabsTrigger>
				</TabsList>
				<TabsContent value="orders" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>
								Track and manage your recent purchases
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{orders?.map((order) => (
									<div
										key={order?.id}
										className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div>
											<p className="font-medium">Order #{order?.id}</p>
											<p className="text-sm text-muted-foreground">
												{order?.date} • {order?.items} items
											</p>
										</div>
										<div className="flex items-center gap-3">
											<div
												className={`rounded-full px-3 py-1 text-xs ${
													order?.status === "Delivered"
														? "bg-green-100 text-green-700"
														: "bg-yellow-100 text-yellow-700"
												}`}
											>
												{order?.status}
											</div>
											<p className="text-sm font-medium">
												${order?.amount.toFixed(2)}
											</p>
											<Button variant="outline" size="sm" asChild>
												<Link href={`/dashboard/user/orders/${order?.id}`}>
													View
												</Link>
											</Button>
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 flex justify-end">
								<Button variant="outline" size="sm" asChild>
									<Link href="/dashboard/user/orders">View All Orders</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="wishlist" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Wishlist Items</CardTitle>
							<CardDescription>Products you've saved for later</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3">
								{wishlistItems.slice(0, 3).map((item) => (
									<div key={item._id} className="rounded-lg border">
										<div className="relative aspect-square overflow-hidden rounded-t-lg bg-slate-100">
											{item.images && item.images[0] ? (
												<img
													src={item.images[0]}
													alt={item.name}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
													No Image
												</div>
											)}
										</div>
										<div className="p-3">
											<h3 className="font-medium text-sm">{item.name}</h3>
											<p className="text-sm text-muted-foreground mt-1">
												${item.price?.toFixed(2)}
											</p>
											<div className="mt-3 flex gap-2">
												<Button
													size="sm"
													className="flex-1 text-xs py-1"
													asChild
												>
													<Link href={`/productDetails/${item._id}`}>
														View Product
													</Link>
												</Button>
												<Button size="sm" variant="outline" className="px-2">
													<Heart
														className="h-4 w-4"
														fill="#ec4899"
														stroke="#ec4899"
													/>
												</Button>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 flex justify-end">
								<Button variant="outline" size="sm" asChild>
									<Link href="/dashboard/user/wishlist">
										View All Wishlist Items
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="reviews" className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>Your Reviews</CardTitle>
							<CardDescription>
								Products you've reviewed recently
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array.from({ length: 2 }).map((_, i) => (
									<div key={i} className="rounded-lg border p-4">
										<div className="flex items-start gap-4">
											<div className="h-16 w-16 flex-shrink-0 rounded bg-slate-100"></div>
											<div className="flex-1">
												<h4 className="font-medium">Wireless Earbuds</h4>
												<div className="mt-1 flex text-yellow-500">
													{Array.from({ length: 5 }).map((_, i) => (
														<Star key={i} className="h-4 w-4 fill-current" />
													))}
												</div>
												<p className="mt-2 text-sm">
													Great product! Sound quality is amazing and battery
													life is impressive.
												</p>
												<p className="mt-1 text-xs text-muted-foreground">
													Reviewed on March 10, 5
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
							<div className="mt-4 flex justify-end">
								<Button variant="outline" size="sm" asChild>
									<Link href="/dashboard/user/reviews">View All Reviews</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

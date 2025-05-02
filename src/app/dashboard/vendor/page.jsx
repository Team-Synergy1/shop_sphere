"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
	BarChart2,
	Package,
	Settings,
	ShoppingCart,
	Users,
	MessageSquare,
} from "lucide-react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Loader from "@/app/loading";

export default function VendorDashboard() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [dashboardData, setDashboardData] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				const response = await fetch("/api/vendor/dashboard");
				const data = await response.json();
console.log("dash", data);
				if (!response.ok) {
					throw new Error(data.error || "Failed to fetch dashboard data");
				}

				setDashboardData(data);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		if (session?.user) {
			fetchDashboardData();
		}
	}, [session]);

	if (loading) return <Loader />;
	if (error)
		return (
			<div className="p-4">
				<Card className="border-red-200 bg-red-50">
					<CardHeader>
						<CardTitle className="text-red-700">
							Error Loading Dashboard
						</CardTitle>
						<CardDescription className="text-red-600">{error}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => window.location.reload()}
							variant="outline"
							className="text-red-700 border-red-300"
						>
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	if (!dashboardData) return null;

	const {
		stats,
		recentOrders,
		lowStockProducts,
		monthlySales,
		topProducts,
		orderFulfillment,
	} = dashboardData;

	return (
		<div className="flex flex-col gap-6 p-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
								৳{stats.totalRevenue.toFixed(2)}
						</div>
						<p className="text-xs text-muted-foreground">
							{stats.revenueChange >= 0 ? "+" : ""}
							{stats.revenueChange}% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalOrders}</div>
						<p className="text-xs text-muted-foreground">
							{stats.orderChange >= 0 ? "+" : ""}
							{stats.orderChange}% from last month
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Products</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalProducts}</div>
						<p className="text-xs text-muted-foreground">
							{stats.activeProducts} active listings
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Fulfillment Rate
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orderFulfillment.rate}%</div>
						<Progress value={orderFulfillment.rate} className="mt-2" />
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<ResponsiveContainer width="100%" height={350}>
							<AreaChart data={monthlySales}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip />
								<Area
									type="monotone"
									dataKey="sales"
									fill="#8884d8"
									stroke="#8884d8"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Recent Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-8">
							{recentOrders.map((order) => (
								<div key={order.id} className="flex items-center">
									<div className="space-y-1">
										<p className="text-sm font-medium leading-none">
											{order.customerName}
										</p>
										<p className="text-sm text-muted-foreground">
												৳{order.amount.toFixed(2)} · {order.status}
										</p>
									</div>
									<div className="ml-auto font-medium">
										{new Date(order.date).toLocaleDateString()}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Top Products</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-8">
							{topProducts.map((product) => (
								<div key={product.id} className="flex items-center">
									<div className="space-y-1">
										<p className="text-sm font-medium leading-none">
											{product.name}
										</p>
										<p className="text-sm text-muted-foreground">
											{product.sold} sold · ৳{product.revenue.toFixed(2)}
										</p>
									</div>
									<div className="ml-auto font-medium">
										{product.inStock} in stock
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Button className="w-full justify-start" size="sm" asChild>
								<Link href="/dashboard/vendor/product/add">
									<Package className="mr-2 h-4 w-4" />
									Add New Product
								</Link>
							</Button>
							<Button
								className="w-full justify-start"
								size="sm"
								variant="outline"
								asChild
							>
								<Link href="/dashboard/vendor/orders?status=pending">
									<ShoppingCart className="mr-2 h-4 w-4" />
									View Pending Orders
								</Link>
							</Button>
							<Button
								className="w-full justify-start"
								size="sm"
								variant="outline"
								asChild
							>
								<Link href="/dashboard/vendor/products?stock=low">
									<Package className="mr-2 h-4 w-4" />
									Check Low Stock Items ({lowStockProducts.length})
								</Link>
							</Button>
							<Button
								className="w-full justify-start"
								size="sm"
								variant="outline"
								asChild
							>
								<Link href="/dashboard/vendor/analytics">
									<BarChart2 className="mr-2 h-4 w-4" />
									View Analytics
								</Link>
							</Button>
							<Button
								className="w-full justify-start"
								size="sm"
								variant="outline"
								asChild
							>
								<Link href="/dashboard/vendor/messages">
									<MessageSquare className="mr-2 h-4 w-4" />
									Customer Messages
								</Link>
							</Button>
							<Button
								className="w-full justify-start"
								size="sm"
								variant="outline"
								asChild
							>
								<Link href="/dashboard/vendor/settings">
									<Settings className="mr-2 h-4 w-4" />
									Update Store Settings
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

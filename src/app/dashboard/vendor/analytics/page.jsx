"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function VendorAnalyticsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState("7d");
	const [analytics, setAnalytics] = useState(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchAnalytics();
	}, [status, session, router, timeRange]);

	const fetchAnalytics = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/vendor/analytics?timeRange=${timeRange}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch analytics");
			}

			// Store the entire analytics object
			setAnalytics(data.analytics);
			console.log("Analytics data:", data.analytics);
		} catch (error) {
			console.error("Error fetching analytics:", error);
			toast.error(error.message || "Failed to load analytics");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <Loader />;

	// Create a default empty structure if analytics is null
	if (!analytics) {
		return <div>No analytics data available</div>;
	}

	// Format revenue data for chart display if available
	const revenueChartData =
		analytics.revenue?.data?.map((item) => ({
			date: item.date.substring(0, 10), // Just get the date part
			amount: Number(item.amount),
		})) || [];

	// Format order data for chart display if available
	const orderChartData =
		analytics.orders?.data?.map((item) => ({
			date: item.date.substring(0, 10), // Just get the date part
			count: Number(item.count),
		})) || [];

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h1 className="text-2xl font-bold mb-4 md:mb-0">Analytics Dashboard</h1>
				<Select value={timeRange} onValueChange={setTimeRange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select time range" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="7d">Last 7 Days</SelectItem>
						<SelectItem value="30d">Last 30 Days</SelectItem>
						<SelectItem value="90d">Last 90 Days</SelectItem>
						<SelectItem value="1y">Last Year</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							৳{Number(analytics.revenue?.total || 0).toFixed(2)}
						</div>
						<p
							className={`text-xs ${
								Number(analytics.revenue?.change || 0) >= 0
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{Number(analytics.revenue?.change || 0) >= 0 ? "+" : ""}
							{Number(analytics.revenue?.change || 0).toFixed(1)}% from previous
							period
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.orders?.total || 0}
						</div>
						<p
							className={`text-xs ${
								Number(analytics.orders?.change || 0) >= 0
									? "text-green-600"
									: "text-red-600"
							}`}
						>
							{Number(analytics.orders?.change || 0) >= 0 ? "+" : ""}
							{Number(analytics.orders?.change || 0).toFixed(1)}% from previous
							period
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Products</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.products?.total || 0}
						</div>
						<p className="text-xs text-muted-foreground">Active products</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Customers</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{analytics.customers?.total || 0}
						</div>
						<p className="text-xs text-green-600">
							+{analytics.customers?.new || 0} new customers
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 mb-6">
				<Card>
					<CardHeader>
						<CardTitle>Revenue Over Time</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={revenueChartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="amount" fill="#f97316" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Orders Over Time</CardTitle>
					</CardHeader>
					<CardContent className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={orderChartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="count" fill="#22c55e" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Top Selling Products</CardTitle>
					<CardDescription>
						Your best performing products for this period
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						{(analytics.products?.topSelling || []).map((product) => (
							<div
								key={product.id || product._id}
								className="py-4 flex items-center justify-between"
							>
								<div className="flex items-center gap-4">
									<img
										src={
											product.image ||
											(product.product?.images && product.product.images[0]) ||
											"/placeholder-product.jpg"
										}
										alt={product.name}
										className="w-12 h-12 object-cover rounded"
									/>
									<div>
										<p className="font-medium">{product.name}</p>
										<p className="text-sm text-muted-foreground">
											{product.sold || product.unitsSold || 0} units sold
										</p>
									</div>
								</div>
								<p className="font-medium">
									৳{Number(product.revenue || 0).toFixed(2)}
								</p>
							</div>
						))}

						{(!analytics.products?.topSelling ||
							analytics.products.topSelling.length === 0) && (
							<div className="py-4 text-center text-muted-foreground">
								No sales data available for this period
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

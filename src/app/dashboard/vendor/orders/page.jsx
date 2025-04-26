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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function VendorOrdersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchOrders();
	}, [status, session, router]);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/vendor/orders");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch orders");
			}

			setOrders(data.orders);
		} catch (error) {
			console.error("Error fetching orders:", error);
			toast.error(error.message || "Failed to load orders");
		} finally {
			setLoading(false);
		}
	};

	const updateOrderStatus = async (orderId, newStatus) => {
		try {
			const response = await fetch(`/api/vendor/orders/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: newStatus }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update order status");
			}

			// Update the order in the local state
			setOrders(
				orders.map((order) =>
					order._id === orderId ? { ...order, status: newStatus } : order
				)
			);

			toast.success("Order status updated successfully");
		} catch (error) {
			console.error("Error updating order status:", error);
			toast.error(error.message || "Failed to update order status");
		}
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "shipped":
				return "bg-blue-100 text-blue-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const filteredOrders = orders.filter((order) => {
		const matchesFilter =
			filter === "all" || order.status.toLowerCase() === filter;
		const matchesSearch =
			order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
			order.customerEmail?.toLowerCase().includes(search.toLowerCase());
		return matchesFilter && matchesSearch;
	});
	console.log(filteredOrders);

	if (loading) return <Loader />;

	return (
		<div className="container mx-auto p-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<h1 className="text-2xl font-bold mb-4 md:mb-0">Orders Management</h1>
				<div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
					<Input
						placeholder="Search orders..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="max-w-[300px]"
					/>
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Orders</SelectItem>
							<SelectItem value="processing">Processing</SelectItem>
							<SelectItem value="shipped">Shipped</SelectItem>
							<SelectItem value="delivered">Delivered</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{filteredOrders.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center h-[200px]">
						<p className="text-muted-foreground">No orders found</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{filteredOrders.map((order) => (
						<Card key={order._id}>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<div>
									<CardTitle>Order #{order.orderNumber}</CardTitle>
									<CardDescription>
										{formatDate(order.createdAt)}
									</CardDescription>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
										order.status
									)}`}
								>
									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
								</span>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Customer</p>
											<p className="font-medium">{order.customerName}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Items</p>
											<p className="font-medium">{order.items.length}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Total Amount
											</p>
											<p className="font-medium">
												${order.totalAmount.toFixed(2)}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Payment Status
											</p>
											<p className="font-medium">{order.paymentStatus}</p>
										</div>
									</div>

									<div className="flex justify-between items-center pt-4">
										<div className="space-x-2">
											{order.status !== "delivered" &&
												order.status !== "cancelled" && (
													<Select
														defaultValue={order.status}
														onValueChange={(value) =>
															updateOrderStatus(order._id, value)
														}
													>
														<SelectTrigger className="w-[180px]">
															<SelectValue placeholder="Update status" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="processing">
																Processing
															</SelectItem>
															<SelectItem value="shipped">Shipped</SelectItem>
															<SelectItem value="delivered">
																Delivered
															</SelectItem>
															<SelectItem value="cancelled">
																Cancelled
															</SelectItem>
														</SelectContent>
													</Select>
												)}
										</div>
										<Button
											variant="outline"
											onClick={() =>
												router.push(`/dashboard/vendor/orders/${order._id}`)
											}
										>
											View Details
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

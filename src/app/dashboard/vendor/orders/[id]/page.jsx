"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function VendorOrderDetailsPage() {
	const { id } = useParams();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchOrderDetails();
	}, [status, session, router, id]);

	const fetchOrderDetails = async () => {
		try {
			const response = await fetch(`/api/vendor/orders/${id}`);
			const data = await response.json();
			console.log("d", data);

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch order details");
			}

			setOrder(data.order);
		} catch (error) {
			console.error("Error fetching order details:", error);
			toast.error(error.message || "Failed to load order details");
			router.push("/dashboard/vendor/orders");
		} finally {
			setLoading(false);
		}
	};

	const updateOrderStatus = async (newStatus) => {
		try {
			const response = await fetch(`/api/vendor/orders/${id}`, {
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

			setOrder({ ...order, status: newStatus });
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

	if (loading) return <Loader />;
	if (!order) return null;

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Order Details</h1>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/vendor/orders")}
				>
					Back to Orders
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Order Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Order Number</p>
								<p className="font-medium">#{order.orderNumber}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Order Date</p>
								<p className="font-medium">{formatDate(order.createdAt)}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Status</p>
								<div className="flex items-center gap-4 mt-1">
									<span
										className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
											order.status
										)}`}
									>
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</span>
									{order.status !== "delivered" &&
										order.status !== "cancelled" && (
											<Select
												defaultValue={order.status}
												onValueChange={updateOrderStatus}
											>
												<SelectTrigger className="w-[180px]">
													<SelectValue placeholder="Update status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="processing">Processing</SelectItem>
													<SelectItem value="shipped">Shipped</SelectItem>
													<SelectItem value="delivered">Delivered</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
												</SelectContent>
											</Select>
										)}
								</div>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Payment Status</p>
								<p className="font-medium">{order.paymentStatus}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Payment Method</p>
								<p className="font-medium">{order.paymentMethod}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Customer Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">Name</p>
								<p className="font-medium">{order.customerName}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Email</p>
								<p className="font-medium">{order.customerEmail}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Shipping Address
								</p>
								<div className="font-medium">
									<p>{order.shippingAddress.street}</p>
									<p>
										{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
										{order.shippingAddress.postalCode}
									</p>
									<p>{order.shippingAddress.country}</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Order Items</CardTitle>
					<CardDescription>Items included in this order</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="divide-y">
						{order.items.map((item) => (
							<div
								key={item._id}
								className="py-4 flex items-center justify-between"
							>
								<div className="flex items-center gap-4">
									<img
										src={item.product.images?.[0]}
										alt={item.product.name}
										className="w-16 h-16 object-cover rounded"
									/>
									<div>
										<p className="font-medium">{item.product.name}</p>
										<p className="text-sm text-muted-foreground">
											Quantity: {item.quantity}
										</p>
									</div>
								</div>
								<p className="font-medium">
									${(item.price * item.quantity).toFixed(2)}
								</p>
							</div>
						))}
					</div>
					<div className="mt-6 border-t pt-4">
						<div className="flex justify-between items-center">
							<p className="font-medium">Total Amount</p>
							<p className="text-xl font-bold">
								${order.totalAmount.toFixed(2)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

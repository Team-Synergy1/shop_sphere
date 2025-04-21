"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function OrderDetailsPage() {
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

		const fetchOrderDetails = async () => {
			try {
				const response = await fetch(`/api/orders/${id}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to fetch order details");
				}

				setOrder(data.order);
			} catch (error) {
				console.error("Error fetching order details:", error);
				toast.error(error.message || "Error loading order details");
				router.push("/dashboard/user/orders");
			} finally {
				setLoading(false);
			}
		};

		if (status === "authenticated") {
			fetchOrderDetails();
		}
	}, [id, status, router]);

	const formatDate = (dateString) => {
		const options = {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
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

	if (loading) return <Loader />;

	if (!order) return null;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Order Details</h1>
				<Button
					variant="outline"
					onClick={() => router.push("/dashboard/user/orders")}
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
						<dl className="space-y-4">
							<div>
								<dt className="text-sm font-medium text-gray-500">
									Order Number
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									#{order.orderNumber}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">
									Date Placed
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									{formatDate(order.createdAt)}
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">Status</dt>
								<dd className="mt-1">
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
											order.status
										)}`}
									>
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</span>
								</dd>
							</div>
							<div>
								<dt className="text-sm font-medium text-gray-500">
									Total Amount
								</dt>
								<dd className="mt-1 text-sm text-gray-900">
									BDT.{order.totalAmount.toFixed(2)}
								</dd>
							</div>
						</dl>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Shipping Address</CardTitle>
					</CardHeader>
					<CardContent>
						<address className="not-italic">
							<p className="text-sm text-gray-900">
								{order.shippingAddress.street}
							</p>
							<p className="text-sm text-gray-900">
								{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
								{order.shippingAddress.postalCode}
							</p>
							<p className="text-sm text-gray-900">
								{order.shippingAddress.country}
							</p>
						</address>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Order Items</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="divide-y divide-gray-200">
							{order.items.map((item, index) => (
								<div key={index} className="py-4 flex items-center">
									<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
										{item.product?.images && item.product.images[0] ? (
											<img
												src={item.product.images[0]}
												alt={item.name}
												className="h-full w-full object-cover object-center"
											/>
										) : (
											<div className="h-full w-full bg-gray-100 flex items-center justify-center">
												<span className="text-gray-400">No image</span>
											</div>
										)}
									</div>
									<div className="ml-6 flex-1">
										<h4 className="text-sm font-medium text-gray-900">
											{item.name}
										</h4>
										<p className="mt-1 text-sm text-gray-500">
											Quantity: {item.quantity}
										</p>
										<p className="mt-1 text-sm text-gray-900">
											BDT.{item.price.toFixed(2)}
										</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// app/account/orders/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedOrder, setSelectedOrder] = useState(null);

	useEffect(() => {
		// Redirect if not authenticated
		if (status === "unauthenticated") {
			router.push("/login?redirect=/account/orders");
			return;
		}

		if (status === "authenticated") {
			fetchOrders();
		}
	}, [status, router]);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/orders/get");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch orders");
			}

			setOrders(data.orders);
		} catch (err) {
			console.error("Error fetching orders:", err);
			setError(err.message || "Something went wrong loading your orders");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "long", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "shipped":
				return "bg-orange-100 text-orange-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-12 w-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
					<svg
						className="mx-auto h-12 w-12 text-red-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						></path>
					</svg>
					<h3 className="mt-4 text-lg font-medium text-red-800">
						Error Loading Orders
					</h3>
					<p className="mt-2 text-red-700">{error}</p>
					<button
						onClick={fetchOrders}
						className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	const OrderDetailsModal = ({ order, onClose }) => {
		if (!order) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
					<div className="flex justify-between items-center border-b px-6 py-4">
						<h3 className="text-lg font-medium">
							Order Details: {order.orderNumber}
						</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-500"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</button>
					</div>

					<div className="p-6">
						<div className="mb-6">
							<div className="flex justify-between mb-2">
								<span className="text-gray-500">Date Placed:</span>
								<span className="font-medium">
									{formatDate(order.createdAt)}
								</span>
							</div>
							<div className="flex justify-between mb-2">
								<span className="text-gray-500">Status:</span>
								<span
									className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${getStatusColor(
										order.status
									)}`}
								>
									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-500">Total Amount:</span>
								<span className="font-medium">
									${order.totalAmount.toFixed(2)}
								</span>
							</div>
						</div>

						<div className="mb-6">
							<h4 className="font-medium text-gray-900 mb-3">
								Shipping Address
							</h4>
							<div className="bg-gray-50 rounded p-3">
								<p>{order.shippingAddress.street}</p>
								<p>
									{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
									{order.shippingAddress.postalCode}
								</p>
								<p>{order.shippingAddress.country}</p>
							</div>
						</div>

						<div>
							<h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
							<div className="border rounded-lg overflow-hidden">
								{order.items.map((item, index) => (
									<div
										key={index}
										className="flex items-center p-4 border-b last:border-b-0"
									>
										<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100">
											{item.product &&
											item.product.images &&
											item.product.images[0] ? (
												<Image
													src={item.product.images[0]}
													alt={item.name}
													width={64}
													height={64}
													className="h-full w-full object-cover object-center"
												/>
											) : (
												<div className="h-full w-full flex items-center justify-center bg-gray-100">
													<svg
														className="h-8 w-8 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
														></path>
													</svg>
												</div>
											)}
										</div>
										<div className="ml-4 flex-1">
											<h5 className="text-sm font-medium text-gray-900">
												{item.name}
											</h5>
											<p className="mt-1 text-sm text-gray-500">
												Qty: {item.quantity}
											</p>
										</div>
										<div className="text-sm font-medium text-gray-900">
											${item.price.toFixed(2)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="bg-gray-50 px-6 py-4 flex justify-end">
						<button
							onClick={onClose}
							className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-6">My Orders</h1>

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="h-12 w-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
				</div>
			) : orders.length === 0 ? (
				<div className="bg-white shadow rounded-lg p-6 text-center">
					<svg
						className="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
						></path>
					</svg>
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						No orders found
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						You haven't placed any orders yet.
					</p>
					<div className="mt-6">
						<Link
							href="/products"
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
						>
							Start Shopping
						</Link>
					</div>
				</div>
			) : (
				<div className="bg-white shadow overflow-hidden sm:rounded-md">
					<ul className="divide-y divide-gray-200">
						{orders.map((order) => (
							<li key={order._id}>
								<div className="px-4 py-5 sm:px-6">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-lg font-medium text-gray-900">
												Order #{order.orderNumber}
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												Placed on {formatDate(order.createdAt)}
											</p>
										</div>
										<div className="flex items-center">
											<span
												className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
													order.status
												)}`}
											>
												{order.status.charAt(0).toUpperCase() +
													order.status.slice(1)}
											</span>
										</div>
									</div>

									<div className="mt-4 border-t border-gray-200 pt-4">
										<div className="flex justify-between text-sm">
											<span className="text-gray-500">
												{order.items.length}{" "}
												{order.items.length === 1 ? "item" : "items"}
											</span>
											<span className="font-medium">
												${order.totalAmount.toFixed(2)}
											</span>
										</div>

										<div className="mt-4 flex justify-end">
											<button
												onClick={() => setSelectedOrder(order)}
												className="text-sm font-medium text-orange-600 hover:text-orange-500"
											>
												View Details
											</button>
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{selectedOrder && (
				<OrderDetailsModal
					order={selectedOrder}
					onClose={() => setSelectedOrder(null)}
				/>
			)}
		</div>
	);
}

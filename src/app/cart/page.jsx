"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "../loading";
import useProduct from "@/hooks/useProduct";
import PurchaseButton from "@/components/PurchaseButton";
import { useCartStore } from "@/store/useCartStore";
import CouponApplier from "@/components/share/CouponApplier";

export default function CartPage() {
	const [cartItems, setCartItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [appliedCoupon, setAppliedCoupon] = useState(null);
	const { data: session, status } = useSession();
	const router = useRouter();
	const [products] = useProduct();
	const fetchCartCount = useCartStore((state) => state.fetchCartCount);

	//  subtotal based on price * quantity
	const subtotal = cartItems.reduce((total, item) => {
		return total + item.price * (item.quantity || 1);
	}, 0);

	//  total items count
	const totalItemsCount = cartItems.reduce((count, item) => {
		return count + (item.quantity || 1);
	}, 0);

	// Calculate discount amount if a coupon is applied
	const discountAmount = appliedCoupon
		? appliedCoupon.calculatedDiscount || 0
		: 0;

	// Calculate final total after discount
	const finalTotal = subtotal - discountAmount;

	useEffect(() => {
		async function fetchCart() {
			if (status === "loading") return;

			if (!session) {
				router.push("/login?callbackUrl=/cart");
				return;
			}

			try {
				setIsLoading(true);
				const response = await fetch("/api/addCart");

				if (!response.ok) {
					throw new Error("Failed to fetch cart");
				}

				const data = await response.json();
				console.log("Cart data:", data.cart);
				setCartItems(data.cart || []);
			} catch (err) {
				console.error("Error fetching cart:", err);
				setError("Failed to load cart items. Please try again.");
			} finally {
				setIsLoading(false);
			}
		}

		fetchCart();
	}, [session, status, router]);

	const updateItemQuantity = async (productId, newQuantity) => {
		try {
			if (newQuantity < 1) {
				return removeFromCart(productId);
			}

			const response = await fetch("/api/updateCart", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productId, quantity: newQuantity }),
			});

			if (!response.ok) {
				throw new Error("Failed to update item quantity");
			}

			setCartItems(
				cartItems.map((item) =>
					item._id === productId ? { ...item, quantity: newQuantity } : item
				)
			);

			toast.success("Cart updated successfully");

			// Clear applied coupon when cart changes
			if (appliedCoupon) {
				setAppliedCoupon(null);
				toast.info("Coupon removed due to cart changes");
			}
		} catch (err) {
			console.error("Error updating quantity:", err);
			toast.error("Failed to update cart. Please try again.");
		}
	};

	const removeFromCart = async (productId) => {
		try {
			const response = await fetch("/api/removeCart", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productId }),
			});

			if (!response.ok) {
				throw new Error("Failed to remove item");
			}

			toast.success("Product removed successfully");
			setCartItems(cartItems.filter((item) => item._id !== productId));

			// Update cart count in Zustand store
			fetchCartCount();

			// Clear applied coupon when cart changes
			if (appliedCoupon) {
				setAppliedCoupon(null);
				toast.info("Coupon removed due to cart changes");
			}
		} catch (err) {
			console.error("Error removing item:", err);
			toast.error("Failed to remove item. Please try again.");
		}
	};

	const handleApplyCoupon = (couponData) => {
		setAppliedCoupon(couponData);
	};

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null);
	};

	const handleCheckout = async () => {
		if (status !== "authenticated") {
			const returnUrl = encodeURIComponent(window.location.pathname);
			router.push(`/login?callbackUrl=${returnUrl}`);
			return;
		}

		try {
			setIsLoading(true);

			// Store coupon information in session storage if one is applied
			if (appliedCoupon) {
				sessionStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
			} else {
				sessionStorage.removeItem("appliedCoupon");
			}

			const addressResponse = await fetch("/api/user/address/check");
			const addressData = await addressResponse.json();

			if (
				addressData.success &&
				addressData.addresses &&
				addressData.addresses.some((addr) => addr.isDefault)
			) {
				router.push("/checkout/payment");
			} else {
				router.push("/checkout/address");
			}
		} catch (error) {
			console.error("Error during purchase:", error);
			toast.error(
				error.message || "Failed to process your request. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="text-center">
					<Loader />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex justify-center items-center">
				<div className="bg-red-50 p-4 rounded-md">
					<p className="text-red-500">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen py-10 px-4">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-2xl font-bold mb-8">Your Cart (0 items)</h1>
					<div className="bg-white p-6 rounded-lg shadow text-center">
						<p className="text-gray-500 mb-4">Your cart is empty</p>
						<Link
							href="/products"
							className="inline-block bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
						>
							Continue Shopping
						</Link>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen py-10 px-4">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-2xl font-bold mb-8">
					{session.user.name} ({totalItemsCount} items order)
				</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow overflow-hidden">
							{cartItems.map((item) => (
								<div
									key={item._id}
									className="border-b last:border-b-0 p-4 flex gap-4"
								>
									<div className="w-24 h-24 relative flex-shrink-0">
										{item.images && item.images[0] && (
											<img
												src={item.images[0]}
												alt={item.name}
												className="w-full h-full object-contain"
											/>
										)}
									</div>

									<div className="flex-grow">
										<h3 className="font-medium">{item.name}</h3>
										{item.colors && item.colors.length > 0 && (
											<p className="text-sm text-gray-500">
												Color: {item.colors[0]}
											</p>
										)}
										<div className="mt-2 flex justify-between items-center">
											<div className="flex items-center">
												<p className="font-semibold mr-4">
													BDT{item.price.toFixed(2)}
												</p>

												{/* Quantity controls */}
												<div className="flex items-center border rounded ">
													<button
														onClick={() =>
															updateItemQuantity(
																item._id,
																(item.quantity || 1) - 1
															)
														}
														className="px-2 py-1 text-gray-600 hover:bg-gray-100"
														aria-label="Decrease quantity"
													>
														-
													</button>
													<span className="px-3 py-1">
														{item.quantity || 1}
													</span>
													<button
														onClick={() =>
															updateItemQuantity(
																item._id,
																(item.quantity || 1) + 1
															)
														}
														className="px-2 py-1 text-gray-600 hover:bg-gray-100"
														aria-label="Increase quantity"
													>
														+
													</button>
												</div>
											</div>

											<button
												onClick={() => removeFromCart(item._id)}
												className="text-red-500 hover:text-red-700 text-sm ml-2 md:ml-0"
												aria-label="Remove item"
											>
												Remove
											</button>
										</div>

										{/* Item subtotal */}
										<div className="mt-2 text-right">
											<p className="text-sm text-gray-500">
												Subtotal: BDT
												{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<div className="bg-white p-6 rounded-lg shadow sticky top-8">
							<h2 className="text-lg font-bold mb-4">Order Summary</h2>

							<div className="space-y-3 mb-4">
								<div className="flex justify-between">
									<span>Items ({totalItemsCount})</span>
									<span>BDT{subtotal.toFixed(2)}</span>
								</div>

								{/* Coupon Applier Component */}
								<div className="py-3 border-t border-b">
									<CouponApplier
										cartSubtotal={subtotal}
										onApplyCoupon={handleApplyCoupon}
										onRemoveCoupon={handleRemoveCoupon}
										appliedCoupon={appliedCoupon}
									/>
								</div>

								{/* Discount amount if coupon applied */}
								{appliedCoupon && (
									<div className="flex justify-between text-green-600">
										<span>Discount</span>
										<span>-BDT{discountAmount.toFixed(2)}</span>
									</div>
								)}

								<div className="flex justify-between text-gray-500">
									<span>Shipping</span>
									<span>Calculated at checkout</span>
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="flex justify-between font-bold mb-6">
									<span>Total</span>
									<span>BDT{finalTotal.toFixed(2)}</span>
								</div>

								<div className="space-y-4 flex flex-col">
									<button
										onClick={handleCheckout}
										className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium"
										disabled={isLoading}
									>
										{isLoading ? "Processing..." : "Proceed to Checkout"}
									</button>

									<Link
										href="/products"
										className="block text-center text-orange-500 hover:underline"
									>
										Continue Shopping
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

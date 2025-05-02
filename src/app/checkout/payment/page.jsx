"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Make sure to replace with your actual Stripe publishable key in the env file
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentPage() {
	const router = useRouter();

	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [loading, setLoading] = useState(false);
	const [couponCode, setCouponCode] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState(null);
	const [applyingCoupon, setApplyingCoupon] = useState(false);
	const [orderSummary, setOrderSummary] = useState({
		subtotal: 0,
		discount: 0,
		total: 0,
		items: [],
	});

	// Fetch cart data on component mount
	useEffect(() => {
		const fetchCartData = async () => {
			try {
				const response = await fetch("/api/addCart");
				if (!response.ok) throw new Error("Failed to fetch cart");

				const data = await response.json();
				const subtotal = data.cart.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				);

				setOrderSummary({
					subtotal,
					discount: 0,
					total: subtotal,
					items: data.cart,
				});
			} catch (error) {
				console.error("Error fetching cart:", error);
				toast.error("Failed to load cart details");
			}
		};

		fetchCartData();
	}, []);

	const applyCoupon = async () => {
		if (!couponCode.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		setApplyingCoupon(true);
		try {
			const response = await fetch("/api/coupons/validate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: couponCode,
					subtotal: orderSummary.subtotal,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Invalid coupon code");
			}

			// Calculate new total with discount
			const discountAmount =
				data.discountType === "percentage"
					? (orderSummary.subtotal * data.discountValue) / 100
					: data.discountValue;

			const newTotal = Math.max(orderSummary.subtotal - discountAmount, 0);

			setOrderSummary({
				...orderSummary,
				discount: discountAmount,
				total: newTotal,
			});

			setAppliedCoupon(data);
			toast.success("Coupon applied successfully!");
		} catch (error) {
			toast.error(error.message || "Failed to apply coupon");
			setAppliedCoupon(null);
		} finally {
			setApplyingCoupon(false);
		}
	};

	const removeCoupon = () => {
		setAppliedCoupon(null);
		setCouponCode("");
		setOrderSummary({
			...orderSummary,
			discount: 0,
			total: orderSummary.subtotal,
		});
		toast.info("Coupon removed");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (paymentMethod === "cod") {
				// Process cash on delivery order
				const response = await fetch("/api/orders/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						paymentMethod: "cod",
						couponCode: appliedCoupon?.code || null,
						isCashOnDelivery: true,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to create order");
				}

				const orderData = await response.json();

				toast.success(`Your order #${orderData.orderNumber} has been placed!`);

				router.push(`/checkout/success?orderId=${orderData.id}`);
			} else if (paymentMethod === "card") {
				// Create Stripe checkout session
				const response = await fetch("/api/checkout/stripe", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						couponCode: appliedCoupon?.code || null,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to create checkout session");
				}

				const session = await response.json();

				// Redirect to Stripe Checkout
				const stripe = await stripePromise;
				const { error } = await stripe.redirectToCheckout({
					sessionId: session.id,
				});

				if (error) {
					throw new Error(error.message);
				}
			}
		} catch (error) {
			toast.error(error.message || "Payment processing failed");
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<div className="container max-w-xl mx-auto py-10 px-4">
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
						<CardDescription>Review your order details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							{orderSummary.items.map((item) => (
								<div key={item._id} className="flex justify-between text-sm">
									<span>
										{item.quantity}x {item.name}
									</span>
									<span>{formatCurrency(item.price * item.quantity)}</span>
								</div>
							))}
						</div>

						<div className="border-t pt-4">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>{formatCurrency(orderSummary.subtotal)}</span>
							</div>

							{orderSummary.discount > 0 && (
								<div className="flex justify-between text-green-600">
									<span>Discount</span>
									<span>-{formatCurrency(orderSummary.discount)}</span>
								</div>
							)}

							<div className="flex justify-between font-bold mt-2">
								<span>Total</span>
								<span>{formatCurrency(orderSummary.total)}</span>
							</div>
						</div>

						{/* Coupon section */}
						<div className="mt-4 pt-4 border-t">
							<Label className="mb-2 block">Have a coupon?</Label>
							{!appliedCoupon ? (
								<div className="flex gap-2">
									<Input
										placeholder="Enter coupon code"
										value={couponCode}
										onChange={(e) => setCouponCode(e.target.value)}
										disabled={applyingCoupon}
									/>
									<Button
										type="button"
										onClick={applyCoupon}
										disabled={applyingCoupon}
										className="whitespace-nowrap"
									>
										{applyingCoupon ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Applying...
											</>
										) : (
											"Apply"
										)}
									</Button>
								</div>
							) : (
								<div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
									<div>
										<p className="font-medium text-green-700">
											{appliedCoupon.code}
										</p>
										<p className="text-xs text-green-600">
											{appliedCoupon.discountType === "percentage"
												? `${appliedCoupon.discountValue}% off`
												: `${formatCurrency(appliedCoupon.discountValue)} off`}
										</p>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={removeCoupon}
										className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
									>
										Remove
									</Button>
								</div>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Payment Method</CardTitle>
						<CardDescription>Choose how you want to pay</CardDescription>
					</CardHeader>
					<form onSubmit={handleSubmit}>
						<CardContent>
							<RadioGroup
								value={paymentMethod}
								onValueChange={setPaymentMethod}
								className="space-y-4"
							>
								<div className="flex items-center space-x-2 border p-4 rounded-md">
									<RadioGroupItem value="cod" id="cod" />
									<Label htmlFor="cod" className="flex-1 cursor-pointer">
										<div className="font-medium">Cash on Delivery</div>
										<div className="text-sm text-gray-500">
											Pay when your order arrives
										</div>
									</Label>
								</div>
								<div className="flex items-center space-x-2 border p-4 rounded-md">
									<RadioGroupItem value="card" id="card" />
									<Label htmlFor="card" className="flex-1 cursor-pointer">
										<div className="font-medium">Credit/Debit Card</div>
										<div className="text-sm text-gray-500">
											Secure payment via Stripe
										</div>
									</Label>
								</div>
							</RadioGroup>
						</CardContent>
						<CardFooter className="mt-5">
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Processing...
									</>
								) : paymentMethod === "cod" ? (
									"Complete Order"
								) : (
									"Proceed to Payment"
								)}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}

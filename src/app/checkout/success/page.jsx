"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShoppingBag } from "lucide-react";
import { useStripe, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// Custom Loader Component
function PaymentLoader() {
	return (
		<div className="flex flex-col items-center justify-center">
			<div className="relative">
				<div className="h-16 w-16 rounded-full border-4 border-t-orange-500 border-r-orange-500 border-b-gray-200 border-l-gray-200 animate-spin"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
					<ShoppingBag className="h-6 w-6 text-orange-500" />
				</div>
			</div>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState("loading");
	const [error, setError] = useState("");
	const [orderNumber, setOrderNumber] = useState("");

	return (
		<Elements stripe={stripePromise}>
			<CheckoutSuccess
				router={router}
				searchParams={searchParams}
				status={status}
				setStatus={setStatus}
				error={error}
				setError={setError}
				orderNumber={orderNumber}
				setOrderNumber={setOrderNumber}
			/>
		</Elements>
	);
}

function CheckoutSuccess({
	router,
	searchParams,
	status,
	setStatus,
	error,
	setError,
	orderNumber,
	setOrderNumber,
}) {
	const stripe = useStripe();

	useEffect(() => {
		if (stripe) {
			processOrder();
		}
	}, [stripe]);

	async function processOrder() {
		if (!stripe) return;

		try {
			setStatus("loading");
			const sessionId = searchParams.get("session_id");

			if (!sessionId) {
				setError("No payment session found. Please try your purchase again.");
				setStatus("failed");
				setTimeout(() => {
					router.push("/cart");
				}, 3000);
				return;
			}

			// Verify the checkout session status with Stripe
			const response = await fetch(
				`/api/checkout/stripe/verify?session_id=${sessionId}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to verify payment");
			}

			// Create order
			const orderResponse = await fetch("/api/orders/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					paymentMethod: "card",
					sessionId,
				}),
			});

			const orderData = await orderResponse.json();

			if (!orderResponse.ok) {
				// Check if it's a stock-related error
				if (orderData.productId) {
					throw new Error(`${orderData.error} Please update your cart.`);
				}
				throw new Error(orderData.error || "Failed to process order");
			}

			setOrderNumber(orderData.orderNumber);
			setStatus("success");
			toast.success("Order placed successfully!");

			// Redirect to orders page after a short delay
			setTimeout(() => {
				router.push("/dashboard/user/orders");
			}, 3000);
		} catch (err) {
			console.error("Error processing order:", err);
			setError(err.message || "An error occurred while processing your order");
			setStatus("failed");
			toast.error(err.message || "Failed to process order");
			setTimeout(() => {
				router.push("/cart");
			}, 3000);
		}
	}

	if (status === "loading") {
		return (
			<div className="container max-w-md mx-auto py-10">
				<div className="text-center">
					<PaymentLoader />
					<h2 className="text-2xl font-bold mt-6 mb-4">
						Processing Your Order
					</h2>
					<p className="text-gray-600">
						Please wait while we confirm your payment...
					</p>
				</div>
			</div>
		);
	}

	if (status === "failed") {
		return (
			<div className="container max-w-md mx-auto py-10">
				<div className="text-center">
					<XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold mb-4 text-red-600">
						Payment Failed
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<p className="text-sm text-gray-500">
						Redirecting you to your cart...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-md mx-auto py-10">
			<div className="text-center">
				<CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
				<h2 className="text-2xl font-bold mb-4 text-green-600">
					Order Successful!
				</h2>
				{orderNumber && (
					<p className="text-lg mb-4">
						Order Number: <span className="font-bold">#{orderNumber}</span>
					</p>
				)}
				<p className="text-gray-600 mb-4">
					Thank you for your purchase! Your order has been confirmed.
				</p>
				<p className="text-sm text-gray-500 mb-8">
					Redirecting to your orders...
				</p>
			</div>
		</div>
	);
}

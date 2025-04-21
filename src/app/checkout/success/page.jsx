"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useStripe, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

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
				throw new Error(orderData.error || "Failed to process order");
			}

			setOrderNumber(orderData.orderNumber);
			setStatus("success");

			// Clear cart after successful order
			await fetch("/api/removeCart", { method: "POST" });

			// Redirect to orders page after a short delay
			setTimeout(() => {
				router.push("/dashboard/user/orders");
			}, 5000);
		} catch (err) {
			console.error("Error processing order:", err);
			setError(err.message || "An error occurred while processing your order");
			setStatus("failed");

			// Redirect to cart page after error
			setTimeout(() => {
				router.push("/cart");
			}, 3000);
		}
	}

	// Show appropriate UI based on status
	if (status === "loading") {
		return (
			<div className="container max-w-md mx-auto py-10">
				<h2 className="text-2xl font-bold mb-4">Processing Your Order</h2>
				<p className="mt-4 text-lg font-medium">
					Please wait while we confirm your payment...
				</p>
			</div>
		);
	}

	if (status === "failed") {
		return (
			<div className="container max-w-md mx-auto py-10">
				<h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
				<p className="mt-4 text-lg text-red-500">{error}</p>
				<p className="mt-2">Redirecting you back to your cart...</p>
			</div>
		);
	}

	return (
		<div className="container max-w-md mx-auto py-10">
			<h2 className="text-2xl font-bold mb-4 text-green-600">
				Order Successful!
			</h2>
			{orderNumber && (
				<p className="mt-4 text-lg">
					Order Number: <span className="font-bold">{orderNumber}</span>
				</p>
			)}
			<p className="mt-4">
				Thank you for your purchase! You will be redirected to your orders page
				shortly.
			</p>
		</div>
	);
}

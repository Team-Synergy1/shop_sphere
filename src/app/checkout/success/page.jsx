// app/checkout/success/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [status, setStatus] = useState("processing");
	const [error, setError] = useState("");

	useEffect(() => {
		async function processOrder() {
			try {
				// Get the session_id from the URL
				const sessionId = searchParams.get("session_id");

				if (!sessionId) {
					setError("No session ID found");
					return;
				}

				setStatus("verifying");

				// Send the session ID to your backend API
				const response = await fetch("/api/orders/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ sessionId }),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to process order");
				}

				setStatus("success");

				// Redirect to order confirmation page after a short delay
				setTimeout(() => {
					router.push("/dashboard/user/orders");
				}, 3000);
			} catch (err) {
				console.error("Error processing order:", err);
				setStatus("failed");
				setError(err.message || "Something went wrong processing your order");
			}
		}

		processOrder();
	}, [searchParams, router]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
			<div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
				{status === "processing" || status === "verifying" ? (
					<>
						<div className="mb-6">
							<div className="mx-auto h-12 w-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
						</div>
						<h1 className="text-2xl font-bold text-gray-800 mb-3">
							Processing Your Order
						</h1>
						<p className="text-gray-600">
							Please wait while we confirm your payment...
						</p>
					</>
				) : status === "success" ? (
					<>
						<div className="mb-6">
							<svg
								className="mx-auto h-12 w-12 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-800 mb-3">
							Order Confirmed!
						</h1>
						<p className="text-gray-600 mb-6">
							Thank you for your purchase. Your order has been successfully
							processed.
						</p>
						<p className="text-sm text-gray-500">
							Redirecting to your orders...
						</p>
					</>
				) : (
					<>
						<div className="mb-6">
							<svg
								className="mx-auto h-12 w-12 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-800 mb-3">
							Something Went Wrong
						</h1>
						<p className="text-gray-600 mb-4">
							{error ||
								"We encountered an issue processing your order. Please contact support."}
						</p>
						<button
							onClick={() => router.push("/")}
							className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
						>
							Return to Homepage
						</button>
					</>
				)}
			</div>
		</div>
	);
}

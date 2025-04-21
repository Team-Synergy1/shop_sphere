"use client";

import { useState } from "react";
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
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";

// Make sure to replace with your actual Stripe publishable key in the env file
const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentPage() {
	const router = useRouter();

	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [loading, setLoading] = useState(false);

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
					body: JSON.stringify({ paymentMethod: "cod" }),
				});

				if (!response.ok) {
					throw new Error("Failed to create order");
				}

				const orderData = await response.json();

				toast.success(`Your order #${orderData.orderNumber} has been placed!`);

				router.push(`/order/confirmation/${orderData.id}`);
			} else if (paymentMethod === "card") {
				// Create Stripe checkout session
				const response = await fetch("/api/checkout/stripe", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
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
			toast.error("Payment processing failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container max-w-md mx-auto py-10">
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
					<CardFooter className={"mt-5"}>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading
								? "Processing..."
								: paymentMethod === "cod"
								? "Complete Order"
								: "Proceed to Payment"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

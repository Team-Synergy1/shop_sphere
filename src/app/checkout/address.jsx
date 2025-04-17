"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AddressPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [cartData, setCartData] = useState({ items: [], total: 0 });

	const [formData, setFormData] = useState({
		street: "",
		city: "",
		state: "",
		postalCode: "",
		country: "",
	});

	useEffect(() => {
		// Fetch cart data
		const fetchCart = async () => {
			try {
				const response = await fetch("/api/addCart");
				if (!response.ok) throw new Error("Failed to fetch cart");
				const data = await response.json();

				const total = data.cart.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				);
				setCartData({ items: data.cart, total });
			} catch (error) {
				console.error("Error fetching cart:", error);
				toast.error("Failed to load cart details");
			}
		};

		fetchCart();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const validatePostalCode = (code) => {
		// Add your country-specific postal code validation
		return /^\d{4,6}$/.test(code);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate postal code
		if (!validatePostalCode(formData.postalCode)) {
			toast.error("Please enter a valid postal code");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/user/address", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error("Failed to save address");
			}

			toast.success("Address saved successfully!");

			// Redirect to payment page
			router.push("/checkout/payment");
		} catch (error) {
			toast.error(error.message || "Failed to save address");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-10 px-4">
			<div className="max-w-3xl mx-auto">
				<Link
					href="/cart"
					className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
				>
					<ChevronLeft className="w-4 h-4 mr-1" />
					Back to Cart
				</Link>

				<div className="grid gap-8 ">
					<Card>
						<CardHeader>
							<CardTitle>Delivery Address</CardTitle>
							<CardDescription>
								Please enter your shipping address
							</CardDescription>
						</CardHeader>
						<form onSubmit={handleSubmit}>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="street">Street Address</Label>
									<Input
										id="street"
										name="street"
										required
										value={formData.street}
										onChange={handleChange}
										placeholder="Enter your street address"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										name="city"
										required
										value={formData.city}
										onChange={handleChange}
										placeholder="Enter your city"
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="state">State/Province</Label>
										<Input
											id="state"
											name="state"
											required
											value={formData.state}
											onChange={handleChange}
											placeholder="Enter state"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="postalCode">Postal Code</Label>
										<Input
											id="postalCode"
											name="postalCode"
											required
											value={formData.postalCode}
											onChange={handleChange}
											placeholder="Enter postal code"
											pattern="\d{4,6}"
											title="Postal code must be 4-6 digits"
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="country">Country</Label>
									<Input
										id="country"
										name="country"
										required
										value={formData.country}
										onChange={handleChange}
										placeholder="Enter your country"
									/>
								</div>
							</CardContent>

							<div className="mt-6">
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? "Saving..." : "Continue to Payment"}
								</Button>
							</div>
						</form>
					</Card>

					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{cartData.items.map((item) => (
								<div key={item._id} className="flex justify-between text-sm">
									<span>
										{item.name} × {item.quantity}
									</span>
									<span>BDT.{(item.price * item.quantity).toFixed(2)}</span>
								</div>
							))}
							<div className="border-t pt-4 mt-4">
								<div className="flex justify-between font-semibold">
									<span>Total</span>
									<span>BDT.{cartData.total.toFixed(2)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

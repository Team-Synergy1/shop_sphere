"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { toast } from "sonner";

export default function AddressPage() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		street: "",
		city: "",
		state: "",
		postalCode: "",
		country: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
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
			toast.error("Failed to save address");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container max-w-xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle>Add Delivery Address</CardTitle>
					<CardDescription>Please enter your shipping address</CardDescription>
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
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="state">State/Province</Label>
								<Input
									id="state"
									name="state"
									required
									value={formData.state}
									onChange={handleChange}
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
							/>
						</div>
					</CardContent>
					<CardFooter className="mt-5">
						<Button type="submit" className="w-full py-2 " disabled={loading}>
							{loading ? "Saving..." : "Save & Continue to Payment"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}

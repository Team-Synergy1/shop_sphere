"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function StoreSettingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [storeSettings, setStoreSettings] = useState({
		storeName: "",
		description: "",
		logo: "",
		banner: "",
		address: "",
		city: "",
		state: "",
		postalCode: "",
		country: "",
		phone: "",
		email: "",
		website: "",
		facebook: "",
		instagram: "",
		twitter: "",
		minOrderAmount: "",
		taxRate: "",
		autoAcceptOrders: true,
		notifyNewOrders: true,
		notifyLowStock: true,
		lowStockThreshold: "5",
		allowReviews: true,
		requireApproval: true,
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session?.user?.role !== "vendor") {
			router.push("/unauthorized");
			return;
		}

		fetchStoreSettings();
	}, [status, session, router]);

	const fetchStoreSettings = async () => {
		try {
			const response = await fetch("/api/vendor/settings");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch store settings");
			}

			setStoreSettings(data.settings);
		} catch (error) {
			console.error("Error fetching store settings:", error);
			toast.error(error.message || "Failed to load store settings");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("/api/vendor/settings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(storeSettings),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update store settings");
			}

			toast.success("Store settings updated successfully");
		} catch (error) {
			console.error("Error updating store settings:", error);
			toast.error(error.message || "Failed to update store settings");
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Store Settings</h1>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>
							General information about your store
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="storeName">Store Name</Label>
								<Input
									id="storeName"
									value={storeSettings.storeName}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											storeName: e.target.value,
										})
									}
									placeholder="Your Store Name"
									required
								/>
							</div>
							<div>
								<Label htmlFor="email">Store Email</Label>
								<Input
									id="email"
									type="email"
									value={storeSettings.email}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											email: e.target.value,
										})
									}
									placeholder="store@example.com"
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="description">Store Description</Label>
							<Textarea
								id="description"
								value={storeSettings.description}
								onChange={(e) =>
									setStoreSettings({
										...storeSettings,
										description: e.target.value,
									})
								}
								placeholder="Describe your store..."
								rows={4}
							/>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="logo">Store Logo URL</Label>
								<Input
									id="logo"
									type="url"
									value={storeSettings.logo}
									onChange={(e) =>
										setStoreSettings({ ...storeSettings, logo: e.target.value })
									}
									placeholder="https://..."
								/>
							</div>
							<div>
								<Label htmlFor="banner">Store Banner URL</Label>
								<Input
									id="banner"
									type="url"
									value={storeSettings.banner}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											banner: e.target.value,
										})
									}
									placeholder="https://..."
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Contact Information</CardTitle>
						<CardDescription>How customers can reach you</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									value={storeSettings.phone}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											phone: e.target.value,
										})
									}
									placeholder="+1234567890"
								/>
							</div>
							<div>
								<Label htmlFor="website">Website</Label>
								<Input
									id="website"
									type="url"
									value={storeSettings.website}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											website: e.target.value,
										})
									}
									placeholder="https://..."
								/>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="address">Address</Label>
								<Input
									id="address"
									value={storeSettings.address}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											address: e.target.value,
										})
									}
									placeholder="Street Address"
								/>
							</div>
							<div>
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={storeSettings.city}
									onChange={(e) =>
										setStoreSettings({ ...storeSettings, city: e.target.value })
									}
									placeholder="City"
								/>
							</div>
						</div>
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="state">State/Province</Label>
								<Input
									id="state"
									value={storeSettings.state}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											state: e.target.value,
										})
									}
									placeholder="State"
								/>
							</div>
							<div>
								<Label htmlFor="postalCode">Postal Code</Label>
								<Input
									id="postalCode"
									value={storeSettings.postalCode}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											postalCode: e.target.value,
										})
									}
									placeholder="Postal Code"
								/>
							</div>
							<div>
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									value={storeSettings.country}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											country: e.target.value,
										})
									}
									placeholder="Country"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Social Media</CardTitle>
						<CardDescription>
							Connect with your customers on social platforms
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="facebook">Facebook</Label>
								<Input
									id="facebook"
									value={storeSettings.facebook}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											facebook: e.target.value,
										})
									}
									placeholder="Facebook URL"
								/>
							</div>
							<div>
								<Label htmlFor="instagram">Instagram</Label>
								<Input
									id="instagram"
									value={storeSettings.instagram}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											instagram: e.target.value,
										})
									}
									placeholder="Instagram URL"
								/>
							</div>
							<div>
								<Label htmlFor="twitter">Twitter</Label>
								<Input
									id="twitter"
									value={storeSettings.twitter}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											twitter: e.target.value,
										})
									}
									placeholder="Twitter URL"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Store Preferences</CardTitle>
						<CardDescription>
							Configure your store's operational settings
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-6">
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="minOrderAmount">Minimum Order Amount (৳)</Label>
								<Input
									id="minOrderAmount"
									type="number"
									value={storeSettings.minOrderAmount}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											minOrderAmount: e.target.value,
										})
									}
									placeholder="0.00"
								/>
							</div>
							<div>
								<Label htmlFor="taxRate">Tax Rate (%)</Label>
								<Input
									id="taxRate"
									type="number"
									value={storeSettings.taxRate}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											taxRate: e.target.value,
										})
									}
									placeholder="0.00"
								/>
							</div>
						</div>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
								<Input
									id="lowStockThreshold"
									type="number"
									value={storeSettings.lowStockThreshold}
									onChange={(e) =>
										setStoreSettings({
											...storeSettings,
											lowStockThreshold: e.target.value,
										})
									}
									placeholder="5"
								/>
							</div>
						</div>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>Auto-Accept Orders</Label>
									<p className="text-sm text-muted-foreground">
										Automatically accept new orders without manual approval
									</p>
								</div>
								<Switch
									checked={storeSettings.autoAcceptOrders}
									onCheckedChange={(checked) =>
										setStoreSettings({
											...storeSettings,
											autoAcceptOrders: checked,
										})
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>New Order Notifications</Label>
									<p className="text-sm text-muted-foreground">
										Receive notifications for new orders
									</p>
								</div>
								<Switch
									checked={storeSettings.notifyNewOrders}
									onCheckedChange={(checked) =>
										setStoreSettings({
											...storeSettings,
											notifyNewOrders: checked,
										})
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Low Stock Notifications</Label>
									<p className="text-sm text-muted-foreground">
										Receive notifications when products are running low
									</p>
								</div>
								<Switch
									checked={storeSettings.notifyLowStock}
									onCheckedChange={(checked) =>
										setStoreSettings({
											...storeSettings,
											notifyLowStock: checked,
										})
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Allow Customer Reviews</Label>
									<p className="text-sm text-muted-foreground">
										Let customers leave reviews on your products
									</p>
								</div>
								<Switch
									checked={storeSettings.allowReviews}
									onCheckedChange={(checked) =>
										setStoreSettings({
											...storeSettings,
											allowReviews: checked,
										})
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div>
									<Label>Review Approval</Label>
									<p className="text-sm text-muted-foreground">
										Require approval before reviews are published
									</p>
								</div>
								<Switch
									checked={storeSettings.requireApproval}
									onCheckedChange={(checked) =>
										setStoreSettings({
											...storeSettings,
											requireApproval: checked,
										})
									}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end">
					<Button type="submit" size="lg">
						Save Settings
					</Button>
				</div>
			</form>
		</div>
	);
}

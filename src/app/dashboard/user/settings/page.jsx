"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	Loader2,
	BellRing,
	Shield,
	Globe,
	CreditCard,
	Trash2,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import Loader from "@/app/loading";

const defaultSettings = {
	notifications: {
		orderUpdates: true,
		promotions: true,
		newsletter: false,
		priceAlerts: false,
		stockAlerts: false,
	},
	privacy: {
		shareOrderHistory: false,
		shareWishlist: true,
		showProfileActivity: true,
		marketingPreferences: false,
	},
	preferences: {
		language: "en",
		currency: "USD",
		theme: "light",
	},
};

const currencies = [
	{ value: "USD", label: "US Dollar ($)" },
	{ value: "EUR", label: "Euro (€)" },
	{ value: "GBP", label: "British Pound (£)" },
	{ value: "BDT", label: "Bangladeshi Taka (৳)" },
];

const languages = [
	{ value: "en", label: "English" },
	{ value: "es", label: "Español" },
	{ value: "fr", label: "Français" },
	{ value: "bn", label: "বাংলা" },
];

const themes = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
];

export default function SettingsPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [settings, setSettings] = useState(defaultSettings);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			const response = await fetch("/api/user/settings");
			const data = await response.json();

			if (!response.ok) throw new Error(data.error);

			setSettings({
				notifications: {
					...defaultSettings.notifications,
					...(data.settings?.notifications || {}),
				},
				privacy: {
					...defaultSettings.privacy,
					...(data.settings?.privacy || {}),
				},
				preferences: {
					...defaultSettings.preferences,
					...(data.settings?.preferences || {}),
				},
			});
		} catch (error) {
			toast.error(error.message || "Failed to load settings");
			setSettings(defaultSettings);
		} finally {
			setLoading(false);
		}
	};

	const updateSetting = async (category, setting, value) => {
		try {
			setSettings((prev) => ({
				...prev,
				[category]: {
					...prev[category],
					[setting]: value,
				},
			}));

			const response = await fetch("/api/user/settings", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ category, setting, value }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error);
			}

			toast.success("Setting updated successfully");
		} catch (error) {
			setSettings((prev) => ({
				...prev,
				[category]: {
					...prev[category],
					[setting]: !value,
				},
			}));
			toast.error(error.message || "Failed to update setting");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader />
			</div>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<div className="space-y-0.5">
				<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
				<p className="text-muted-foreground">
					Manage your account settings and preferences.
				</p>
			</div>

			<Separator className="my-6" />

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center space-x-2">
							<BellRing className="h-5 w-5 text-primary" />
							<CardTitle>Notifications</CardTitle>
						</div>
						<CardDescription>
							Choose what updates you want to receive
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label htmlFor="orderUpdates" className="text-sm font-medium">
									Order Updates
								</Label>
								<p className="text-sm text-muted-foreground">
									Get notified about your order status
								</p>
							</div>
							<Switch
								id="orderUpdates"
								checked={
									settings.notifications?.orderUpdates ??
									defaultSettings.notifications.orderUpdates
								}
								onCheckedChange={(checked) =>
									updateSetting("notifications", "orderUpdates", checked)
								}
							/>
						</div>

						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label htmlFor="promotions" className="text-sm font-medium">
									Promotional Emails
								</Label>
								<p className="text-sm text-muted-foreground">
									Receive updates about sales and special offers
								</p>
							</div>
							<Switch
								id="promotions"
								checked={
									settings.notifications?.promotions ??
									defaultSettings.notifications.promotions
								}
								onCheckedChange={(checked) =>
									updateSetting("notifications", "promotions", checked)
								}
							/>
						</div>

						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label htmlFor="priceAlerts" className="text-sm font-medium">
									Price Alerts
								</Label>
								<p className="text-sm text-muted-foreground">
									Get notified when items in your wishlist go on sale
								</p>
							</div>
							<Switch
								id="priceAlerts"
								checked={
									settings.notifications?.priceAlerts ??
									defaultSettings.notifications.priceAlerts
								}
								onCheckedChange={(checked) =>
									updateSetting("notifications", "priceAlerts", checked)
								}
							/>
						</div>

						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label htmlFor="stockAlerts" className="text-sm font-medium">
									Stock Alerts
								</Label>
								<p className="text-sm text-muted-foreground">
									Get notified when out-of-stock items become available
								</p>
							</div>
							<Switch
								id="stockAlerts"
								checked={
									settings.notifications?.stockAlerts ??
									defaultSettings.notifications.stockAlerts
								}
								onCheckedChange={(checked) =>
									updateSetting("notifications", "stockAlerts", checked)
								}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center space-x-2">
							<Shield className="h-5 w-5 text-primary" />
							<CardTitle>Privacy</CardTitle>
						</div>
						<CardDescription>Manage your privacy preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label
									htmlFor="shareOrderHistory"
									className="text-sm font-medium"
								>
									Share Order History
								</Label>
								<p className="text-sm text-muted-foreground">
									Allow sharing of your order history for recommendations
								</p>
							</div>
							<Switch
								id="shareOrderHistory"
								checked={
									settings.privacy?.shareOrderHistory ??
									defaultSettings.privacy.shareOrderHistory
								}
								onCheckedChange={(checked) =>
									updateSetting("privacy", "shareOrderHistory", checked)
								}
							/>
						</div>

						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label htmlFor="shareWishlist" className="text-sm font-medium">
									Public Wishlist
								</Label>
								<p className="text-sm text-muted-foreground">
									Make your wishlist visible to others
								</p>
							</div>
							<Switch
								id="shareWishlist"
								checked={
									settings.privacy?.shareWishlist ??
									defaultSettings.privacy.shareWishlist
								}
								onCheckedChange={(checked) =>
									updateSetting("privacy", "shareWishlist", checked)
								}
							/>
						</div>

						<div className="flex items-start justify-between space-x-4">
							<div className="flex-1 space-y-1">
								<Label
									htmlFor="showProfileActivity"
									className="text-sm font-medium"
								>
									Profile Activity
								</Label>
								<p className="text-sm text-muted-foreground">
									Show your reviews and ratings publicly
								</p>
							</div>
							<Switch
								id="showProfileActivity"
								checked={
									settings.privacy?.showProfileActivity ??
									defaultSettings.privacy.showProfileActivity
								}
								onCheckedChange={(checked) =>
									updateSetting("privacy", "showProfileActivity", checked)
								}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center space-x-2">
							<Globe className="h-5 w-5 text-primary" />
							<CardTitle>Preferences</CardTitle>
						</div>
						<CardDescription>
							Customize your shopping experience
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="language">Language</Label>
							<Select
								value={settings.preferences?.language}
								onValueChange={(value) =>
									updateSetting("preferences", "language", value)
								}
							>
								<SelectTrigger id="language">
									<SelectValue placeholder="Select Language" />
								</SelectTrigger>
								<SelectContent>
									{languages.map((language) => (
										<SelectItem key={language.value} value={language.value}>
											{language.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="currency">Currency</Label>
							<Select
								value={settings.preferences?.currency}
								onValueChange={(value) =>
									updateSetting("preferences", "currency", value)
								}
							>
								<SelectTrigger id="currency">
									<SelectValue placeholder="Select Currency" />
								</SelectTrigger>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem key={currency.value} value={currency.value}>
											{currency.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="theme">Theme</Label>
							<Select
								value={settings.preferences?.theme}
								onValueChange={(value) =>
									updateSetting("preferences", "theme", value)
								}
							>
								<SelectTrigger id="theme">
									<SelectValue placeholder="Select Theme" />
								</SelectTrigger>
								<SelectContent>
									{themes.map((theme) => (
										<SelectItem key={theme.value} value={theme.value}>
											{theme.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5 text-primary" />
							<CardTitle>Account</CardTitle>
						</div>
						<CardDescription>Manage your account settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push("/dashboard/user/profile")}
						>
							Edit Profile
						</Button>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => router.push("/dashboard/user/payment")}
						>
							Payment Methods
						</Button>
					</CardContent>
					<CardFooter>
						<AlertDialog
							open={deleteDialogOpen}
							onOpenChange={setDeleteDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" className="w-full">
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Account
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete
										your account and remove your data from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										onClick={async () => {
											try {
												const response = await fetch(
													"/api/user/account/delete",
													{
														method: "DELETE",
													}
												);
												if (!response.ok)
													throw new Error("Failed to delete account");
												router.push("/");
												toast.success("Account deleted successfully");
											} catch (error) {
												toast.error("Failed to delete account");
											}
										}}
									>
										Delete Account
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

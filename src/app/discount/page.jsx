"use client";

import { useEffect, useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Copy,
	Check,
	Zap,
	Clock,
	CalendarDays,
	ShoppingBag,
	Percent,
	DollarSign,
	Tag,
	AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function DiscountsPage() {
	const [coupons, setCoupons] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [copiedCode, setCopiedCode] = useState(null);

	// Fetch all available coupons
	const fetchCoupons = useCallback(async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/coupons");
			setCoupons(response.data);
			setError(null);
		} catch (error) {
			console.error("Error fetching coupons:", error);
			setError(error.response?.data?.error || "Failed to load coupons");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	// Handle copying coupon code to clipboard
	const handleCopyCode = useCallback(async (code) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopiedCode(code);
			toast.success("Coupon code copied to clipboard!");
			setTimeout(() => setCopiedCode(null), 2000);
		} catch (err) {
			toast.error("Failed to copy code");
		}
	}, []);

	// Format date in a readable way
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	// Calculate time left until expiration
	const calculateTimeLeft = (endDate) => {
		const difference = new Date(endDate) - new Date();
		if (difference <= 0) return "Expired";

		const days = Math.floor(difference / (1000 * 60 * 60 * 24));
		if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;

		const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
		return `${hours} hour${hours > 1 ? "s" : ""} left`;
	};

	// Organize coupons by type
	const percentageCoupons = coupons.filter(
		(coupon) => coupon.discountType === "percentage"
	);
	const fixedCoupons = coupons.filter(
		(coupon) => coupon.discountType === "fixed"
	);

	// Find coupons that are expiring soon (in the next 3 days)
	const now = new Date();
	const threeDaysFromNow = new Date(now);
	threeDaysFromNow.setDate(now.getDate() + 3);

	const expiringSoon = coupons.filter((coupon) => {
		const endDate = new Date(coupon.endDate);
		return endDate <= threeDaysFromNow && endDate > now;
	});

	// Find coupons with no minimum purchase requirement
	const noMinPurchase = coupons.filter((coupon) => coupon.minPurchase === 0);

	// Skeleton loading state
	if (loading) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-6">Discount Coupons</h1>
				<Tabs defaultValue="all">
					<TabsList className="mb-6">
						<TabsTrigger value="all">All Coupons</TabsTrigger>
						<TabsTrigger value="percentage">Percentage Off</TabsTrigger>
						<TabsTrigger value="fixed">Fixed Amount</TabsTrigger>
						<TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
					</TabsList>
					<TabsContent value="all" className="mt-0">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3, 4, 5, 6].map((i) => (
								<Card key={i} className="border-dashed border-2">
									<CardHeader className="pb-2">
										<Skeleton className="h-6 w-32 mb-2" />
										<Skeleton className="h-4 w-64" />
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<Skeleton className="h-16 w-full rounded-md" />
											<div className="flex justify-between">
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-4 w-24" />
											</div>
											<Skeleton className="h-10 w-full" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-6">Discount Coupons</h1>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Empty state
	if (coupons.length === 0) {
		return (
			<div className="container mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold mb-6">Discount Coupons</h1>
				<Alert>
					<AlertTitle>No coupons available</AlertTitle>
					<AlertDescription>
						There are currently no active discount coupons. Check back later for
						new promotions.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Render coupon card
	const renderCouponCard = (coupon) => (
		<Card
			key={coupon.id}
			className="border-dashed border-2 hover:border-orange-400 transition-colors"
		>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="flex items-center">
							{coupon.discountType === "percentage" ? (
								<Percent className="h-4 w-4 mr-1 text-green-600" />
							) : (
								<DollarSign className="h-4 w-4 mr-1 text-blue-600" />
							)}
							{coupon.discountType === "percentage"
								? `${coupon.discountValue}% OFF`
								: `৳${coupon.discountValue} OFF`}
						</CardTitle>
						<CardDescription className="mt-1">
							{coupon.description}
						</CardDescription>
					</div>
					<Badge
						variant={
							new Date(coupon.endDate) <= threeDaysFromNow
								? "destructive"
								: "outline"
						}
						className="ml-2 flex items-center"
					>
						<Clock className="h-3 w-3 mr-1" />
						{calculateTimeLeft(coupon.endDate)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="bg-gray-50 p-3 rounded-md">
						<div className="flex flex-col space-y-2">
							{coupon.minPurchase > 0 && (
								<div className="flex items-center text-sm">
									<ShoppingBag className="h-4 w-4 mr-2 text-gray-500" />
									<span>Min. purchase: ৳{coupon.minPurchase.toFixed(2)}</span>
								</div>
							)}
							{coupon.maxDiscount && (
								<div className="flex items-center text-sm">
									<Tag className="h-4 w-4 mr-2 text-gray-500" />
									<span>Max. discount: ৳{coupon.maxDiscount.toFixed(2)}</span>
								</div>
							)}
							<div className="flex items-center text-sm">
								<CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
								<span>Valid until: {formatDate(coupon.endDate)}</span>
							</div>
						</div>
					</div>

					{coupon.usageLimit && (
						<div>
							<div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
								<div
									className="bg-orange-500 h-1.5 rounded-full transition-all duration-300 ease-out"
									style={{ width: `${coupon.progress}%` }}
								/>
							</div>
							<div className="flex justify-between items-center text-xs text-gray-500">
								<span>{coupon.progress}% claimed</span>
								<span>
									{coupon.usageLimit - coupon.currentUsage} of{" "}
									{coupon.usageLimit} left
								</span>
							</div>
						</div>
					)}

					<div className="flex items-center">
						<div className="flex-1 bg-orange-50 border border-orange-100 rounded-l-md p-2 font-mono font-medium text-center text-orange-800">
							{coupon.code}
						</div>
						<Button
							variant="default"
							size="sm"
							className="rounded-l-none h-[40px]"
							onClick={() => handleCopyCode(coupon.code)}
						>
							{copiedCode === coupon.code ? (
								<>
									<Check className="h-4 w-4 mr-1" /> Copied
								</>
							) : (
								<>
									<Copy className="h-4 w-4 mr-1" /> Copy
								</>
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex items-center mb-6">
				<Zap className="h-8 w-8 mr-2 text-orange-500" />
				<h1 className="text-3xl font-bold">Discount Coupons</h1>
			</div>

			<Tabs defaultValue="all" className="mb-10">
				<TabsList className="mb-6">
					<TabsTrigger value="all">All Coupons</TabsTrigger>
					<TabsTrigger value="percentage">Percentage Off</TabsTrigger>
					<TabsTrigger value="fixed">Fixed Amount</TabsTrigger>
					<TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
					<TabsTrigger value="noMinimum">No Minimum</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{coupons.map(renderCouponCard)}
					</div>
				</TabsContent>

				<TabsContent value="percentage" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{percentageCoupons.map(renderCouponCard)}
					</div>
					{percentageCoupons.length === 0 && (
						<Alert>
							<AlertDescription>
								No percentage discount coupons available at the moment.
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				<TabsContent value="fixed" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{fixedCoupons.map(renderCouponCard)}
					</div>
					{fixedCoupons.length === 0 && (
						<Alert>
							<AlertDescription>
								No fixed amount discount coupons available at the moment.
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				<TabsContent value="expiring" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{expiringSoon.map(renderCouponCard)}
					</div>
					{expiringSoon.length === 0 && (
						<Alert>
							<AlertDescription>
								No coupons are expiring in the next 3 days.
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>

				<TabsContent value="noMinimum" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{noMinPurchase.map(renderCouponCard)}
					</div>
					{noMinPurchase.length === 0 && (
						<Alert>
							<AlertDescription>
								All current coupons have minimum purchase requirements.
							</AlertDescription>
						</Alert>
					)}
				</TabsContent>
			</Tabs>

			<div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
				<h2 className="text-xl font-semibold mb-4 flex items-center">
					<AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
					How to use coupon codes
				</h2>
				<ol className="list-decimal pl-5 space-y-2">
					<li>Browse and find a coupon you want to use</li>
					<li>
						Click the <strong>Copy</strong> button to copy the code
					</li>
					<li>
						Add products to your cart that meet the minimum purchase requirement
						(if any)
					</li>
					<li>
						During checkout, paste the coupon code in the designated field
					</li>
					<li>The discount will be applied to your order automatically</li>
				</ol>
				<p className="mt-4 text-sm text-gray-600">
					Note: Some coupons have usage limits or expiration dates. The discount
					will only apply if all conditions are met.
				</p>
			</div>
		</div>
	);
}

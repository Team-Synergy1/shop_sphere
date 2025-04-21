"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { Zap, Copy, Check, Clock } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Discount() {
	const [flashDeals, setFlashDeals] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [copiedCode, setCopiedCode] = useState(null);
	const [timeLeft, setTimeLeft] = useState({
		hours: "00",
		minutes: "00",
		seconds: "00",
	});


	const fetchDeals = useCallback(async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/deals");
			setFlashDeals(response.data);
			setError(null);
		} catch (error) {
			console.error("Error fetching deals:", error);
			setError(error.response?.data?.error || "Failed to load flash deals");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDeals();
	}, [fetchDeals]);

	
	const latestEndTime = useMemo(() => {
		if (flashDeals.length === 0) return null;
		return flashDeals.reduce((latest, current) => {
			const currentEnd = new Date(current.endTime);
			const latestEnd = new Date(latest.endTime);
			return currentEnd > latestEnd ? current : latest;
		}).endTime;
	}, [flashDeals]);

	useEffect(() => {
		if (!latestEndTime) return;

		const calculateTimeLeft = () => {
			const difference = new Date(latestEndTime) - new Date();

			if (difference > 0) {
				const hours = Math.floor(difference / (1000 * 60 * 60));
				const minutes = Math.floor((difference / 1000 / 60) % 60);
				const seconds = Math.floor((difference / 1000) % 60);

				setTimeLeft({
					hours: hours.toString().padStart(2, "0"),
					minutes: minutes.toString().padStart(2, "0"),
					seconds: seconds.toString().padStart(2, "0"),
				});
			}
		};

		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);
		return () => clearInterval(timer);
	}, [latestEndTime]);

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

	const formatTimeLeft = useCallback((endTime) => {
		const difference = new Date(endTime) - new Date();
		if (difference <= 0) return "Expired";

		const hours = Math.floor(difference / (1000 * 60 * 60));
		if (hours > 24) {
			const days = Math.floor(hours / 24);
			return `${days}d left`;
		}
		return `${hours}h left`;
	}, []);

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="container mx-auto py-8">
				<div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-4 mb-8">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center">
							<Skeleton className="h-6 w-6 mr-2" />
							<Skeleton className="h-8 w-32" />
						</div>
						<div className="flex items-center space-x-1">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-8 w-8 rounded" />
							))}
						</div>
					</div>
					<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-2">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="min-w-52 bg-white">
								<CardContent className="p-4">
									<div className="space-y-3">
										<Skeleton className="h-6 w-24" />
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-2 w-full" />
										<Skeleton className="h-8 w-full" />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-4 mb-8 text-white">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center">
						<Zap className="h-6 w-6 mr-2" />
						<h2 className="text-lg font-bold">Flash Coupons</h2>
					</div>
					<div className="flex items-center space-x-1">
						<div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">
							{timeLeft.hours}
						</div>
						<span>:</span>
						<div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">
							{timeLeft.minutes}
						</div>
						<span>:</span>
						<div className="bg-white text-pink-600 font-bold w-8 h-8 rounded flex items-center justify-center text-sm">
							{timeLeft.seconds}
						</div>
					</div>
				</div>

				<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-2">
					{flashDeals.map((deal) => (
						<Card
							key={deal._id}
							className="min-w-52 bg-white text-gray-800 shadow-md group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
						>
							<CardContent className="p-4">
								<div className="flex justify-between items-start mb-2">
									<div>
										<h3 className="text-lg font-bold text-pink-600 group-hover:text-pink-700 transition-colors">
											{deal.discount}
										</h3>
										<p className="text-xs text-gray-500">{deal.limit}</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-gray-500 hover:text-pink-600 transition-colors"
										onClick={() => handleCopyCode(deal.code)}
									>
										{copiedCode === deal.code ? (
											<Check className="h-4 w-4" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>

								<div className="mt-4">
									<div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
										<div
											className="bg-pink-600 h-1.5 rounded-full transition-all duration-300 ease-out"
											style={{ width: `${deal.progress}%` }}
										/>
									</div>
									<div className="flex justify-between items-center text-xs text-gray-400">
										<span>{deal.progress}% claimed</span>
										<span className="flex items-center">
											<Clock className="h-3 w-3 mr-1" />
											{formatTimeLeft(deal.endTime)}
										</span>
									</div>
								</div>

								<div className="mt-3 text-xs font-medium text-center py-1.5 bg-pink-50 text-pink-600 rounded border border-pink-100 select-all cursor-pointer hover:bg-pink-100 transition-colors">
									{deal.code}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Loader from "@/app/loading";

export default function VendorReviews() {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [responses, setResponses] = useState({});

	useEffect(() => {
		fetchReviews();
	}, []);

	const fetchReviews = async () => {
		try {
			const res = await fetch("/api/vendor/reviews");
			const data = await res.json();

			if (data.success) {
				setReviews(data.reviews);
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: data.error || "Failed to fetch reviews",
				});
			}
		} catch (error) {
			toast("Failed to fetch reviews");
		} finally {
			setLoading(false);
		}
	};

	const handleResponseChange = (reviewId, value) => {
		setResponses((prev) => ({
			...prev,
			[reviewId]: value,
		}));
	};

	const handleSubmitResponse = async (review) => {
		try {
			const response = responses[review.orderId];
			if (!response?.trim()) {
				toast("Please enter a response");
				return;
			}

			const res = await fetch("/api/vendor/reviews", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					orderId: review.orderId,
					productId: review.productId,
					response: response,
				}),
			});

			const data = await res.json();

			if (data.success) {
				toast.success("Response added successfully");
				// Clear response and refresh reviews
				setResponses((prev) => ({
					...prev,
					[review.orderId]: "",
				}));
				fetchReviews();
			} else {
				toast.error("Failed to add response");
			}
		} catch (error) {
			toast.error("Failed to add response");
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-96"><Loader></Loader></div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold mb-2">Product Reviews</h1>
				<p className="text-muted-foreground">
					Manage and respond to customer reviews of your products
				</p>
			</div>

			<div className="grid gap-6">
				{reviews.length === 0 ? (
					<Card>
						<CardContent className="flex items-center justify-center h-32">
							<p className="text-muted-foreground">No reviews yet</p>
						</CardContent>
					</Card>
				) : (
					reviews.map((review) => (
						<Card key={`${review.orderId}-${review.productId}`}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex items-start space-x-4">
										<Avatar className="h-10 w-10">
											<AvatarImage src={review.customer.image} />
											<AvatarFallback>
												{review.customer.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<CardTitle className="text-base">
												{review.customer.name}
											</CardTitle>
											<CardDescription>
												Order #{review.orderNumber} •{" "}
												{format(new Date(review.createdAt), "MMM d, yyyy")}
											</CardDescription>
										</div>
									</div>
									<div className="flex items-center">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`h-4 w-4 ${
													i < review.rating
														? "text-yellow-400 fill-yellow-400"
														: "text-gray-300"
												}`}
											/>
										))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="mb-4">
									<h3 className="font-medium mb-2">{review.productName}</h3>
									<p className="text-muted-foreground">{review.comment}</p>
								</div>

								{review.vendorResponse && (
									<div className="bg-muted p-4 rounded-lg mt-4">
										<div className="flex items-center gap-2 mb-2">
											<MessageCircle className="h-4 w-4" />
											<span className="font-medium">Your Response</span>
										</div>
										<p className="text-sm text-muted-foreground">
											{review.vendorResponse}
										</p>
										{review.vendorResponseDate && (
											<p className="text-xs text-muted-foreground mt-2">
												Responded on{" "}
												{format(
													new Date(review.vendorResponseDate),
													"MMM d, yyyy"
												)}
											</p>
										)}
									</div>
								)}

								{!review.vendorResponse && (
									<div className="mt-4">
										<Textarea
											placeholder="Write your response..."
											value={responses[review.orderId] || ""}
											onChange={(e) =>
												handleResponseChange(review.orderId, e.target.value)
											}
											className="mb-2"
										/>
										<Button
											onClick={() => handleSubmitResponse(review)}
											disabled={!responses[review.orderId]?.trim()}
										>
											Submit Response
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}

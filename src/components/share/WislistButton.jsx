// components/share/WishlistButton.jsx
"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function WishlistButton({ productId }) {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [inWishlist, setInWishlist] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!productId || status !== "authenticated") {
			return;
		}

		const checkWishlistStatus = async () => {
			try {
				setIsLoading(true);
				const { data } = await axios.post(
					"/api/user/wishlist/check",
					{
						productId,
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
						withCredentials: true,
					}
				);
				setInWishlist(data.inWishlist);
			} catch (error) {
				console.error("Error checking wishlist status:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkWishlistStatus();
	}, [productId, status]);

	const handleWishlistToggle = async () => {
		if (status !== "authenticated") {
			const returnUrl = encodeURIComponent(window.location.pathname);
			router.push(`/login?callbackUrl=${returnUrl}`);
			return;
		}

		try {
			setIsLoading(true);
			const response = await axios.post("/api/user/wishlist/toggle", {
				productId: productId,
			});
			setInWishlist(response.data.inWishlist);
			toast.success(response.data.message);

			// Dispatch event to update wishlist count in navbar
			window.dispatchEvent(new CustomEvent("wishlistUpdated"));
		} catch (error) {
			console.error("Error toggling wishlist item:", error);
			toast.error("Failed to update wishlist");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={handleWishlistToggle}
			disabled={isLoading}
			className="rounded-full hover:bg-rose-50"
		>
			<Heart
				className="h-5 w-5"
				fill={inWishlist ? "#ec4899" : "none"}
				stroke={inWishlist ? "#ec4899" : "currentColor"}
			/>
		</Button>
	);
}

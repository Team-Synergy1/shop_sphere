import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import useProduct from "@/hooks/useProduct";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";

export default function AddToCart({ id, size, className = "", onAddedToCart }) {
	const [isAdded, setIsAdded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { data: session, status } = useSession();
	const [isVendorOrAdmin, setIsVendorOrAdmin] = useState(false);

	const [products] = useProduct();
	const product = products?.find((p) => p._id == id);
	const fetchCartCount = useCartStore((state) => state.fetchCartCount);

	useEffect(() => {
		if (status === "authenticated" && session) {
			// Check if user is a vendor or admin
			const role = session.user.role;
			setIsVendorOrAdmin(role === "vendor" || role === "admin");
		}
	}, [session, status]);

	const handleAddToCart = async () => {
		if (status === "unauthenticated") {
			const returnUrl = encodeURIComponent(
				window.location.pathname + window.location.search
			);
			console.log("vgg", returnUrl);
			router.push(`/login?callbackUrl=${returnUrl}`);
			return;
		}

		// Prevent vendors and admins from adding to cart
		if (isVendorOrAdmin) {
			toast.error("Vendors and admins cannot add products to cart");
			return;
		}

		if (onAddedToCart && typeof onAddedToCart === "function") {
			onAddedToCart();
		}
		setIsLoading(true);
		try {
			const res = await axios.post("/api/addCart", product);
			const wasUpdated = res.data.updated;
			const newQuantity = res.data.quantity;

			setTimeout(() => {
				setIsLoading(false);
				setIsAdded(true);

				const successMsg = wasUpdated
					? `Updated quantity to ${newQuantity}`
					: "Added to cart!";

				// Update cart count in Zustand store
				fetchCartCount();

				setTimeout(() => {
					setIsAdded(false);
					toast.success(successMsg);
				}, 2000);
			}, 600);
		} catch (error) {
			console.error("Error adding to cart:", error);
			setIsLoading(false);
		}
	};

	// If user is a vendor or admin, disable the button
	if (isVendorOrAdmin) {
		return null; // Don't show the button for vendors and admins
	}

	return (
		<Button
			onClick={handleAddToCart}
			disabled={isLoading || isAdded}
			size={size}
			className={className}
		>
			{isLoading ? (
				<span className="flex items-center gap-2">
					<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
					Processing...
				</span>
			) : isAdded ? (
				<span className="flex items-center gap-1">
					<Check className="mr-2 h-5 w-5" />
					Added to Cart
				</span>
			) : (
				<span className="flex items-center gap-1">
					<ShoppingCart className="mr-2 h-5 w-5" />
					Add to Cart
				</span>
			)}
		</Button>
	);
}

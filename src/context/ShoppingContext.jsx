import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { useSession } from "next-auth/react";

const ShoppingContext = createContext();

export function ShoppingProvider({ children }) {
	const { data: session } = useSession();
	const [cartCount, setCartCount] = useState(0);
	const [wishlistCount, setWishlistCount] = useState(0);

	// Fetch cart count
	const fetchCartCount = useCallback(async () => {
		if (!session?.user) {
			setCartCount(0);
			return;
		}
		try {
			const res = await fetch("/api/addCart");
			const data = await res.json();
			setCartCount(Array.isArray(data.cart) ? data.cart.length : 0);
		} catch {
			setCartCount(0);
		}
	}, [session]);

	// Fetch wishlist count
	const fetchWishlistCount = useCallback(async () => {
		if (!session?.user) {
			setWishlistCount(0);
			return;
		}
		try {
			const res = await fetch("/api/user/wishlist");
			const data = await res.json();
			setWishlistCount(Array.isArray(data.wishlist) ? data.wishlist.length : 0);
		} catch {
			setWishlistCount(0);
		}
	}, [session]);

	// Listen for custom events to update counts
	useEffect(() => {
		fetchCartCount();
		fetchWishlistCount();

		const handleCartUpdate = () => fetchCartCount();
		const handleWishlistUpdate = () => fetchWishlistCount();

		window.addEventListener("cartUpdated", handleCartUpdate);
		window.addEventListener("wishlistUpdated", handleWishlistUpdate);

		return () => {
			window.removeEventListener("cartUpdated", handleCartUpdate);
			window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
		};
	}, [fetchCartCount, fetchWishlistCount]);

	return (
		<ShoppingContext.Provider
			value={{ cartCount, wishlistCount, fetchCartCount, fetchWishlistCount }}
		>
			{children}
		</ShoppingContext.Provider>
	);
}

export function useShopping() {
	return useContext(ShoppingContext);
}

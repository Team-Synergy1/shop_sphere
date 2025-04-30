import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
	persist(
		(set) => ({
			cartCount: 0,
			wishlistCount: 0,
			setCartCount: (count) => set({ cartCount: count }),
			setWishlistCount: (count) => set({ wishlistCount: count }),
			fetchCartCount: async () => {
				try {
					const res = await fetch("/api/addCart");
					const data = await res.json();
					set({ cartCount: Array.isArray(data.cart) ? data.cart.length : 0 });
				} catch {
					set({ cartCount: 0 });
				}
			},
			fetchWishlistCount: async () => {
				try {
					const res = await fetch("/api/user/wishlist");
					const data = await res.json();
					set({
						wishlistCount: Array.isArray(data.wishlist)
							? data.wishlist.length
							: 0,
					});
				} catch {
					set({ wishlistCount: 0 });
				}
			},
		}),
		{
			name: "cart-store",
			partialize: (state) => ({
				cartCount: state.cartCount,
				wishlistCount: state.wishlistCount,
			}),
		}
	)
);

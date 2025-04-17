"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import Head from "next/head";
import { Trash2, AlertCircle, Heart } from "lucide-react";
import AddToCart from "@/components/share/addToCart";

const WishlistPage = () => {
	const { data: session, status } = useSession();
	const [wishlistItems, setWishlistItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchWishlist = async () => {
			if (status === "authenticated") {
				try {
					setLoading(true);
					const response = await axios.get("/api/user/wishlist");
					setWishlistItems(response.data.wishlist || []);
					setError(null);
				} catch (err) {
					console.error("Error fetching wishlist:", err);
					setError("Failed to load your wishlist. Please try again later.");
				} finally {
					setLoading(false);
				}
			} else if (status === "unauthenticated") {
				setLoading(false);
				setError("Please log in to view your wishlist");
			}
		};

		fetchWishlist();
	}, [status]);

	const handleRemoveFromWishlist = async (productId) => {
		try {
			await axios.post("/api/user/wishlist/toggle", { productId });
			// Remove item from local state
			setWishlistItems(wishlistItems.filter((item) => item._id !== productId));
		} catch (err) {
			console.error("Error removing from wishlist:", err);
			alert("Failed to remove item from wishlist");
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>{session.user.name} Wishlist</title>
				<meta
					name="description"
					content="View and manage your wishlist items"
				/>
			</Head>

			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">{session.user.name} Wishlist</h1>
					<Link
						href="/products"
						className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 hidden sm:block"
					>
						Continue Shopping
					</Link>
				</div>

				{error ? (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
						<AlertCircle className="text-red-500 mr-3 flex-shrink-0" />
						<p className="text-red-700">{error}</p>
					</div>
				) : wishlistItems.length === 0 ? (
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
						<Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h2 className="text-2xl font-semibold text-gray-700 mb-3">
							Your wishlist is empty
						</h2>
						<p className="text-gray-500 mb-6 max-w-md mx-auto">
							Items added to your wishlist will appear here. Start adding
							products you love!
						</p>
						<Link
							href="/products"
							className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
						>
							Browse Products
						</Link>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Stock Status
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{wishlistItems.map((item) => (
									<tr
										key={item._id}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border border-gray-200">
													{item.images ? (
														<img
															src={item.images[0]}
															alt={item.name}
															className="h-full w-full object-cover object-center"
														/>
													) : (
														<div className="flex h-full w-full items-center justify-center bg-gray-100">
															<span className="text-xs text-gray-400">
																No image
															</span>
														</div>
													)}
												</div>
												<div className="ml-4">
													<Link href={`/product/${item._id}`} className="block">
														<h3 className="text-lg font-medium text-gray-900 hover:text-orange-600">
															{item.name}
														</h3>
													</Link>
													{item.categories && item.categories.length > 0 && (
														<p className="text-sm text-gray-500 mt-1">
															{item.categories.join(", ")}
														</p>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-lg font-medium text-gray-900">
												${item.price.toFixed(2)}
											</div>
											{item.originalPrice &&
												item.originalPrice > item.price && (
													<div className="text-sm text-gray-500 line-through">
														${item.originalPrice.toFixed(2)}
													</div>
												)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													item.inStock
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{item.inStock ? "In Stock" : "Out of Stock"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<AddToCart
													id={item._id}
													size="lg"
													onAddedToCart={() =>
														handleRemoveFromWishlist(item._id)
													}
												/>
												<button
													onClick={() => handleRemoveFromWishlist(item._id)}
													className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-red-500 hover:border-red-300"
												>
													<Trash2 className="h-4 w-4 mr-1" />
													Remove
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{wishlistItems.length > 0 && (
							<div className="mt-6 text-right">
								<button
									onClick={() => {
										const productIds = wishlistItems
											.filter((item) => item.inStock)
											.map((item) => item._id);
										if (productIds.length === 0) {
											alert("No in-stock items to add to cart");
											return;
										}

										Promise.all(
											productIds.map((id) =>
												axios.post("/api/cart/add", {
													productId: id,
													quantity: 1,
												})
											)
										)
											.then(() => alert("All available items added to cart"))
											.catch((err) => {
												console.error("Error adding items to cart:", err);
												alert("Failed to add some items to cart");
											});
									}}
									className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
								>
									Add All to Cart
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
};

export default WishlistPage;

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, Heart, Trash2 } from "react-feather";
import AddToCart from "../components/AddToCart";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

const Wishlist = () => {
	const { data: session } = useSession();
	const [wishlistItems, setWishlistItems] = useState([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (session) {
			axios
				.get("/api/wishlist")
				.then((response) => {
					setWishlistItems(response.data);
				})
				.catch((error) => {
					setError(error.response?.data?.message || "Failed to load wishlist");
				});
		}
	}, [session]);

	const handleRemoveFromWishlist = (id) => {
		axios
			.delete(`/api/wishlist/${id}`)
			.then(() => {
				setWishlistItems((prevItems) =>
					prevItems.filter((item) => item._id !== id)
				);
				toast.success("Item removed from wishlist");
			})
			.catch((error) => {
				toast.error(
					error.response?.data?.message || "Failed to remove item from wishlist"
				);
			});
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col sm:flex-row items-center justify-between mb-8">
				<h1 className="text-2xl font-bold mb-4 sm:mb-0">
					{session.user.name} Wishlist
				</h1>
				<Link
					href="/products"
					className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
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
						Items added to your wishlist will appear here. Start adding products
						you love!
					</p>
					<Link
						href="/products"
						className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
					>
						Browse Products
					</Link>
				</div>
			) : (
				<div className="overflow-hidden">
					<div className="max-w-full overflow-x-auto">
						<table className="min-w-full bg-white border border-gray-200 rounded-lg">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
										<td className="px-4 py-4">
											<div className="flex items-center space-x-3">
												<div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200">
													{item.images ? (
														<img
															src={item.images[0]}
															alt={item.name}
															className="h-full w-full object-cover object-center"
														/>
													) : (
														<div className="h-full w-full bg-gray-100 flex items-center justify-center">
															<span className="text-gray-400 text-xs">
																No image
															</span>
														</div>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<Link
														href={`/productDetails/${item._id}`}
														className="hover:text-orange-600"
													>
														<p className="text-sm font-medium text-gray-900">
															{item.name}
														</p>
													</Link>
													{item.brand && (
														<p className="text-xs text-gray-500">
															{item.brand}
														</p>
													)}
												</div>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												${item.price.toFixed(2)}
											</div>
											{item.originalPrice &&
												item.originalPrice > item.price && (
													<div className="text-xs text-gray-500 line-through">
														${item.originalPrice.toFixed(2)}
													</div>
												)}
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<span
												className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
													item.inStock
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{item.inStock ? "In Stock" : "Out of Stock"}
											</span>
										</td>
										<td className="px-4 py-4 whitespace-nowrap text-right">
											<div className="flex justify-end space-x-2">
												<AddToCart
													id={item._id}
													size="sm"
													onAddedToCart={() =>
														handleRemoveFromWishlist(item._id)
													}
												/>
												<button
													onClick={() => handleRemoveFromWishlist(item._id)}
													className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 hover:text-red-500 hover:border-red-300 transition-colors"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{wishlistItems.length > 0 && (
						<div className="mt-6 text-right">
							<button
								onClick={() => {
									const productIds = wishlistItems
										.filter((item) => item.inStock)
										.map((item) => item._id);
									if (productIds.length === 0) {
										toast.error("No in-stock items to add to cart");
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
										.then(() =>
											toast.success("All available items added to cart")
										)
										.catch((err) => {
											console.error("Error adding items to cart:", err);
											toast.error("Failed to add some items to cart");
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
	);
};

export default Wishlist;

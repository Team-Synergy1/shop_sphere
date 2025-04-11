// app/products/[id]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
	ChevronLeft,
	Heart,
	Share,
	Star,
	ShoppingCart,
	Truck,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import useProduct from "@/hooks/useProduct";
import { useWishlist } from "@/context/WishlistContext";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function ProductPage() {
	const { data: session } = useSession();
	const params = useParams();
	const { isInWishlist, toggleWishlistItem, isLoading: wishlistLoading } = useWishlist();
	const [products] = useProduct();
	const product = products?.find((p) => p._id == params.id);

	const [selectedColor, setSelectedColor] = useState();
	const [quantity, setQuantity] = useState(1);
	const [activeImage, setActiveImage] = useState(0);

	const [inWishlist, setInWishlist] = useState(false);
	const [checkingWishlist, setCheckingWishlist] = useState(true);

	// Check if product is in wishlist on page load
	useEffect(() => {
		if (!product || !session) {
			setCheckingWishlist(false);
			return;
		}

		const checkWishlistStatus = async () => {
			try {
				setCheckingWishlist(true);
				const { data } = await axios.post("/api/user/wishlist/check", {
					productId: product._id
				});
				setInWishlist(data.inWishlist);
			} catch (error) {
				console.error("Error checking wishlist status:", error);
			} finally {
				setCheckingWishlist(false);
			}
		};

		checkWishlistStatus();
	}, [product, session]);

	// Alternative: Use the context to check wishlist status
	useEffect(() => {
		if (product) {
			setInWishlist(isInWishlist(product._id));
		}
	}, [product, isInWishlist]);

	const handleWishlistToggle = async () => {
		if (!product) return;

		const result = await toggleWishlistItem(product._id);
		setInWishlist(result);
	};

	if (!product) {
		return <div className="container mx-auto px-4 py-8">Loading...</div>;
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Link
					href="/products"
					className="flex items-center text-sm text-gray-500 hover:text-gray-700"
				>
					<ChevronLeft className="h-4 w-4 mr-1" />
					Back to products
				</Link>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
						<img
							src={product.images[activeImage]}
							alt={product.name}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex space-x-2">
						{product.images.map((image, index) => (
							<div
								key={index}
								className={`cursor-pointer border-2 rounded ${index === activeImage ? "border-blue-500" : "border-gray-200"
									}`}
								onClick={() => setActiveImage(index)}
							>
								<img
									src={image}
									alt={`${product.name} thumbnail ${index + 1}`}
									className="w-20 h-20 object-fit"
								/>
							</div>
						))}
					</div>
				</div>

				<div>
					<div className="flex justify-between">
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<div className="flex space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={handleWishlistToggle}
								disabled={wishlistLoading || checkingWishlist}
								className={inWishlist ? "bg-pink-50" : ""}
							>
								<Heart
									className="h-5 w-5"
									fill={inWishlist ? "#ec4899" : "none"}
									stroke={inWishlist ? "#ec4899" : "currentColor"}
								/>
							</Button>
							<Button variant="outline" size="icon">
								<Share className="h-5 w-5" />
							</Button>
						</div>
					</div>

					<div className="mt-4 flex items-center justify-between">
						<p className="text-2xl font-bold">${product.price}</p>
						<div className="flex items-center">
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className="h-5 w-5"
										fill={i < Math.floor(product.rating) ? "gold" : "none"}
										stroke={
											i < Math.floor(product.rating) ? "gold" : "currentColor"
										}
									/>
								))}
							</div>
							<span className="ml-2 text-sm text-gray-600">
								{product.rating} ({product.reviewCount} reviews)
							</span>
						</div>
					</div>

					<Separator className="my-6" />

					<p className="text-gray-700 mb-6">{product.description}</p>

					<div className="mb-6">
						<h2 className="text-sm font-medium mb-2">Color</h2>
						<div className="flex space-x-2">
							{product.colors.map((color) => (
								<Badge
									key={color}
									variant={selectedColor === color ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() => setSelectedColor(color)}
								>
									{color}
								</Badge>
							))}
						</div>
					</div>

					<div className="mb-6">
						<h2 className="text-sm font-medium mb-2">Quantity</h2>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
							>
								-
							</Button>
							<span className="px-4 py-2 border rounded-md">{quantity}</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setQuantity(Math.min(product.stock, quantity + 1))
								}
							>
								+
							</Button>
							<span className="ml-4 text-sm text-gray-500">
								{product.stock} available
							</span>
						</div>
					</div>

					<div className="flex space-x-4 mb-6">
						<Button className="" size="lg">
							<ShoppingCart className="mr-2 h-5 w-5" />
							Add to Cart
						</Button>
						<Button variant="secondary" size="lg">
							Buy Now
						</Button>
					</div>

					{/* Shipping Info
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p><span className="font-medium">{product.shipping}</span></p>
                  <p className="text-gray-500">Estimated delivery: {product.delivery}</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
				</div>
			</div>

			{/* product details  */}
			{/* <div className="mt-12">
        <Tabs defaultValue="features">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
		  <TabsContent value="features" className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-2xl font-bold mb-6">Premium Features</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-lg">{feature}</h4>
                      <p className="mt-1 text-gray-600">
                        {product.description} 
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
		  <TabsContent value="specifications" className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-2xl font-bold mb-6">Technical Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <dt className="font-medium text-gray-900">{key}</dt>
                    <dd className="mt-1 text-gray-600">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <p className="text-lg">Customer reviews will be displayed here.</p>
          </TabsContent>
        </Tabs>
      </div> */}
		</div>
	);
}

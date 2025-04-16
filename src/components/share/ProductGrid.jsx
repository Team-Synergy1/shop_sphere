"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";
import AddToCart from "@/components/share/addToCart";
import WishlistButton from "./WislistButton";


export default function ProductGrid({
  products = [],
  viewMode = "grid",
}) {
  // Helper function to get product ID (handles both _id and id)
  const getProductId = (product) => {
    return product._id || product.id;
  };

  // If no products, show message
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">
          No products found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          : "space-y-2"
      }
    >
      {products.map((product) => (
        <Card
          key={getProductId(product)}
          className={
            viewMode === "grid"
              ? "hover:shadow-md transition-shadow h-full rounded-none"
              : "hover:shadow-sm transition-shadow"
          }
        >
          {viewMode === "grid" ? (
            <>
              <CardHeader className="relative p-2">
                <Link href={`/productDetails/${getProductId(product)}`}>
                  <img
                    src={product.images?.[0] || product.image}
                    alt={product.name}
                    className="w-full h-36 object-cover"
                  />
                </Link>
                <div className="absolute -top-5 right-1 ">
                  <WishlistButton 
                    productId={getProductId(product)}
                    initialState={product.inWishlist || false}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <Link href={`/productDetails/${getProductId(product)}`}>
                  <h3 className="text-sm font-medium line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-sm">
                      ${product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" size={12} />
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                </Link>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`text-xs ${
                      product.inStock !== false
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.inStock !== false ? "In Stock" : "Out of Stock"}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToCart id={getProductId(product)} size="xs" className="p-1" />
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-2">
              <div className="flex gap-2">
                <div className="relative">
                  <Link href={`/productDetails/${getProductId(product)}`}>
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </Link>
                
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <Link href={`/productDetails/${getProductId(product)}`}>
                      <h3 className="font-medium text-xs line-clamp-1">{product.name}</h3>
                      <div className="flex items-center mt-0.5">
                        <Star className="text-yellow-500 mr-0.5" size={10} />
                        <span className="text-xs">{product.rating}</span>
                      </div>
                    </Link>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-xs font-bold">BDT.{product.price}</p>
                      <p className="text-xs">
                        {product.inStock !== false ? (
                          <span className="text-green-600">In Stock</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddToCart id={getProductId(product)} size="xs" className="p-1"/>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
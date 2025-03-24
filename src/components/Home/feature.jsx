"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";
import useProduct from "@/hooks/useProduct";

export default function Feature() {
  const [products, loading, error] = useProduct();
  console.log(products);
  
  return (
    <section className="container mx-auto py-12">
      <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
      
      {loading && <p>Loading products...</p>}
      {error && <p>Error loading products: {error.message}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products?.map((product) => (
          <Card
            key={product._id}
            className="group relative hover:shadow-lg transition-shadow h-full pt-0 pb-2 rounded-t-none rounded-b-none"
          >
            <div className="relative h-48 p-0 top-0 overflow-hidden">
              <Link href={`/productDetails/${product._id}`}>
                <img
                  src={product.images && product.images[0]}
                  alt={product.name}
                  className="absolute top-0 left-0 w-full h-full object-fit object-top"
                />
              </Link>
              {/* {product.inStock ? (
                <Badge className="absolute top-2 right-2 bg-green-500 text-white text-xs">
                  In Stock
                </Badge>
              ) : (
                <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                  Out of Stock
                </Badge>
              )} */}
            </div>

            <div className="p-3 space-y-1.5">
              <h3 className="font-medium text-base line-clamp-2 leading-tight">
                {product.name}
              </h3>

              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-primary">
                  BDT. {product.price}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 stroke-yellow-400"
                        : "fill-muted stroke-muted"
                    }`}
                  />
                ))}
                <span>({product.reviewCount})</span>
              </div>

              {/* <Button className="w-full mt-1.5" size="sm">
                Add to Cart
              </Button> */}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
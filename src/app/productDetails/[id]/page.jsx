// app/products/[id]/page.jsx
"use client";

import React, { useState } from "react";
import { ChevronLeft, Heart, Share, Star, ShoppingCart, Truck ,Check} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function ProductPage({ params }) {
  // This would normally fetch from an API based on params.id
  const product = {
    id: params?.id || "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    rating: 4.7,
    reviewCount: 128,
    images: [
      "/api/placeholder/800/600", 
      "/api/placeholder/800/600", 
      "/api/placeholder/800/600"
    ],
    colors: ["Black", "White", "Navy Blue"],
    description: "Experience crystal-clear sound with our premium wireless headphones. Featuring noise-cancellation technology, 30-hour battery life, and ultra-comfortable ear cushions.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.2",
      "Built-in microphone",
      "Touch controls",
      "Premium memory foam cushions"
    ],
    specs: {
      "Weight": "250g",
      "Dimensions": "18 x 15 x 8 cm",
      "Driver size": "40mm",
      "Frequency response": "20Hz - 20kHz",
      "Impedance": "32 ohms",
      "Connectivity": "Bluetooth 5.2, 3.5mm jack"
    },
    stock: 15,
    inStock: true,
    shipping: "Free shipping",
    delivery: "2-3 business days"
  };

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8">
     
      <div className="mb-6">
        <Link href="/products" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
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
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="flex space-x-2">
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`cursor-pointer border-2 rounded ${
                  index === activeImage ? "border-blue-500" : "border-gray-200"
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img 
                  src={image} 
                  alt={`${product.name} thumbnail ${index+1}`} 
                  className="w-20 h-20 object-cover"
                />
              </div>
            ))}
          </div>
        </div>

   
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
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
                    stroke={i < Math.floor(product.rating) ? "gold" : "currentColor"}
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
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
// app/dashboard/user/wishlist/page.jsx
// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import Link from "next/link";
// import Image from "next/image";
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Heart, ShoppingCart, X } from "lucide-react";
// import { toast } from "sonner";

// export default function WishlistPage() {
//   const { data: session } = useSession();
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       if (session?.user?.id) {
//         try {
//           const response = await axios.get("/api/user/wishlist");
//           setWishlistItems(response.data);
//         } catch (error) {
//           console.error("Failed to fetch wishlist:", error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchWishlist();
//   }, [session]);

//   const handleRemoveFromWishlist = async (productId) => {
//     try {
//       await axios.delete(`/api/user/wishlist/${productId}`);
//       setWishlistItems(wishlistItems.filter(item => item._id !== productId));
//       toast({
//         title: "Product removed",
//         description: "Product has been removed from your wishlist.",
//       });
//     } catch (error) {
//       console.error("Failed to remove from wishlist:", error);
//       toast({
//         title: "Error",
//         description: "Failed to remove product from wishlist.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleAddToCart = async (productId) => {
//     try {
//       await axios.post("/api/cart", {
//         productId,
//         quantity: 1
//       });
//       toast({
//         title: "Added to cart",
//         description: "Product has been added to your cart.",
//       });
//     } catch (error) {
//       console.error("Failed to add to cart:", error);
//       toast({
//         title: "Error",
//         description: "Failed to add product to cart.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
      
//       <Card>
//         <CardHeader>
//           <CardTitle>Wishlist Items</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {wishlistItems.length > 0 ? (
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {wishlistItems.map((item) => (
//                 <div key={item._id} className="group relative overflow-hidden rounded-lg border border-muted bg-background p-2">
//                   <div className="aspect-square overflow-hidden rounded-md">
//                     <Link href={`/product/${item._id}`}>
//                       <div className="h-full w-full object-cover transition-all group-hover:scale-105">
//                         <Image 
//                           src={item.images[0] || "/placeholder.svg"} 
//                           alt={item.name}
//                           width={300}
//                           height={300}
//                           className="h-full w-full object-cover"
//                         />
//                       </div>
//                     </Link>
//                   </div>
                  
//                   <div className="flex flex-col space-y-1.5 p-3">
//                     <Link href={`/product/${item._id}`}>
//                       <h3 className="font-semibold tracking-tight line-clamp-1">{item.name}</h3>
//                     </Link>
//                     <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
//                     <div className="mt-auto flex items-center justify-between">
//                       <span className="font-semibold">${item.price.toFixed(2)}</span>
//                       <div className="flex gap-2">
//                         <Button 
//                           variant="outline" 
//                           size="icon"
//                           onClick={() => handleRemoveFromWishlist(item._id)}
//                         >
//                           <X className="h-4 w-4" />
//                           <span className="sr-only">Remove</span>
//                         </Button>
//                         <Button 
//                           variant="default" 
//                           size="icon"
//                           onClick={() => handleAddToCart(item._id)}
//                         >
//                           <ShoppingCart className="h-4 w-4" />
//                           <span className="sr-only">Add to Cart</span>
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-10">
//               <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
//               <h3 className="mt-2 text-sm font-medium">Your wishlist is empty</h3>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 Save items you love to your wishlist.
//               </p>
//               <div className="mt-6">
//                 <Link href="/" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
//                   Browse Products
//                 </Link>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";


export default function WishlistPage() {
  const { data: session, status } = useSession();
  const { wishlistItems, isLoading, toggleWishlistItem, fetchWishlist } = useWishlist();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchWishlist();
    
  }, []);

  useEffect(() => {
    setItems(wishlistItems);
  }, [wishlistItems]);

  const handleRemoveFromWishlist = async (productId) => {
    await toggleWishlistItem(productId);
  };

  if ( isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full rounded-md mb-4" />
                <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
                <Skeleton className="h-4 w-1/2 rounded-md mb-4" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-8">
            Create an account or sign in to save your favorite items.
          </p>
          <Link href="/auth/signin">
            <Button size="lg">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">
            Browse our products and add your favorites to your wishlist.
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="h-60 overflow-hidden">
              <img
                src={product.images?.[0] || "/placeholder-product.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <Link href={`/productDetails/${product._id}`}>
                <h2 className="text-lg font-medium hover:text-blue-600 transition-colors">
                  {product.name}
                </h2>
              </Link>
              <p className="text-lg font-semibold mt-2">${product.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </CardContent>
            <Separator />
            <CardFooter className="p-4 flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(product._id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
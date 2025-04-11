"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch wishlist data on session change
  useEffect(() => {
    if (session && session?.user?.role == "user") {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [session]);

  const fetchWishlist = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get("/api/user/wishlist");
      setWishlistItems(response.data.wishlist.products);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to fetch wishlist items");
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId || item === productId);
  };

  const toggleWishlistItem = async (productId) => {
    if (!session) {
      toast.error("You need to be logged in to add items to wishlist");
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/user/wishlist", { productId });
      
      // Update local state based on response
      if (response.data.added) {
        setWishlistItems(prev => [...prev, productId]);
        toast.success("Product added to your wishlist");
      } else {
        setWishlistItems(prev => prev.filter(id => id !== productId && id._id !== productId));
        toast.success("Product removed from your wishlist");
      }
      
      return response.data.added;
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        fetchWishlist,
        isInWishlist,
        toggleWishlistItem,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
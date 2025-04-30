"use client";

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      // Cart state
      cart: {
        items: [],
        count: 0,
      },
      // Cart actions
      addToCart: (item) => 
        set((state) => {
          const existingItemIndex = state.cart.items.findIndex(i => i._id === item._id)
          if (existingItemIndex !== -1) {
            const updatedItems = [...state.cart.items]
            updatedItems[existingItemIndex].quantity = (updatedItems[existingItemIndex].quantity || 1) + 1
            return { 
              cart: {
                items: updatedItems,
                count: state.cart.count + 1
              }
            }
          }
          return { 
            cart: {
              items: [...state.cart.items, { ...item, quantity: 1 }],
              count: state.cart.count + 1
            }
          }
        }),
      removeFromCart: (itemId) =>
        set((state) => ({
          cart: {
            items: state.cart.items.filter(item => item._id !== itemId),
            count: state.cart.count - 1
          }
        })),
      updateCartItemQuantity: (itemId, quantity) =>
        set((state) => {
          const existingItemIndex = state.cart.items.findIndex(i => i._id === itemId)
          if (existingItemIndex !== -1) {
            const updatedItems = [...state.cart.items]
            const oldQuantity = updatedItems[existingItemIndex].quantity || 1
            updatedItems[existingItemIndex].quantity = quantity
            return { 
              cart: {
                items: updatedItems,
                count: state.cart.count + (quantity - oldQuantity)
              }
            }
          }
          return state
        }),
      clearCart: () => set({ cart: { items: [], count: 0 } }),

      // Wishlist state
      wishlist: {
        items: [],
        count: 0,
      },
      // Wishlist actions
      addToWishlist: (item) =>
        set((state) => {
          const exists = state.wishlist.items.some(i => i._id === item._id)
          if (!exists) {
            return {
              wishlist: {
                items: [...state.wishlist.items, item],
                count: state.wishlist.count + 1
              }
            }
          }
          return state
        }),
      removeFromWishlist: (itemId) =>
        set((state) => ({
          wishlist: {
            items: state.wishlist.items.filter(item => item._id !== itemId),
            count: state.wishlist.count - 1
          }
        })),
      clearWishlist: () => set({ wishlist: { items: [], count: 0 } }),

      // Initialize store with data from the server
      initializeStore: (cartItems, wishlistItems) => set({
        cart: {
          items: cartItems,
          count: cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
        },
        wishlist: {
          items: wishlistItems,
          count: wishlistItems.length
        }
      })
    }),
    {
      name: 'shop-sphere-storage',
      skipHydration: true,
    }
  )
)
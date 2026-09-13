"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Product } from "@/lib/data";
import { createPersistedListStore, createPersistedJSONStore } from "@/lib/persisted-store";

export interface CartItem {
  id: string;
  quantity: number;
}

const EMPTY_CART: CartItem[] = [];

const cartStore = createPersistedJSONStore<CartItem[]>("weartry_cart", EMPTY_CART);
const wishlistStore = createPersistedListStore("weartry_wishlist");

interface StoreContextValue {
  cartItems: CartItem[];
  cartCount: number;
  wishlistIds: string[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const cartItems = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const wishlistIds = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );
  const [isCartOpen, setCartOpen] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(product: Product, quantity = 1) {
    const current = cartStore.current;
    const existing = current.find((item) => item.id === product.id);
    if (existing) {
      cartStore.set(
        current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      );
    } else {
      cartStore.set([...current, { id: product.id, quantity }]);
    }
    setCartOpen(true);
  }

  function updateCartQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      cartStore.set(cartStore.current.filter((item) => item.id !== id));
      return;
    }
    cartStore.set(cartStore.current.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }

  function removeFromCart(id: string) {
    cartStore.set(cartStore.current.filter((item) => item.id !== id));
  }

  function clearCart() {
    cartStore.set([]);
  }

  function addToWishlist(product: Product) {
    const current = wishlistStore.current;
    if (!current.includes(product.id)) {
      wishlistStore.set([...current, product.id]);
    }
  }

  function removeFromWishlist(id: string) {
    wishlistStore.set(wishlistStore.current.filter((existing) => existing !== id));
  }

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        cartCount,
        wishlistIds,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isCartOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

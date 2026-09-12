"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Product } from "@/lib/data";
import { createPersistedListStore } from "@/lib/persisted-store";

const cartStore = createPersistedListStore("weartry_cart");
const wishlistStore = createPersistedListStore("weartry_wishlist");

interface StoreContextValue {
  cartIds: string[];
  wishlistIds: string[];
  addToCart: (product: Product) => void;
  addToWishlist: (product: Product) => void;
  removeFromCart: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const cartIds = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const wishlistIds = useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );
  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);

  function addToCart(product: Product) {
    const current = cartStore.current;
    if (!current.includes(product.id)) {
      cartStore.set([...current, product.id]);
    }
    setCartOpen(true);
  }

  function addToWishlist(product: Product) {
    const current = wishlistStore.current;
    if (!current.includes(product.id)) {
      wishlistStore.set([...current, product.id]);
    }
    setWishlistOpen(true);
  }

  function removeFromCart(id: string) {
    cartStore.set(cartStore.current.filter((existing) => existing !== id));
  }

  function removeFromWishlist(id: string) {
    wishlistStore.set(wishlistStore.current.filter((existing) => existing !== id));
  }

  return (
    <StoreContext.Provider
      value={{
        cartIds,
        wishlistIds,
        addToCart,
        addToWishlist,
        removeFromCart,
        removeFromWishlist,
        isCartOpen,
        isWishlistOpen,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        openWishlist: () => setWishlistOpen(true),
        closeWishlist: () => setWishlistOpen(false),
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

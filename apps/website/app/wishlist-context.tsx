
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type WishlistProduct = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category?: string;
  oldPrice?: number;
  rating?: number;
  tag?: string;
};

type WishlistContextType = {
  wishlist: WishlistProduct[];
  toggleWishlist: (product: WishlistProduct) => void;
  removeFromWishlist: (id: string | number) => void;
  isWishlisted: (id: string | number) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fastkart-wishlist");
      if (saved) {
        setWishlist(JSON.parse(saved));
      }
    } catch {
      setWishlist([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem("fastkart-wishlist", JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  const toggleWishlist = (product: WishlistProduct) => {
    setWishlist((current) => {
      const exists = current.some(
        (item) => String(item.id) === String(product.id)
      );

      return exists
        ? current.filter(
            (item) => String(item.id) !== String(product.id)
          )
        : [...current, product];
    });
  };

  const removeFromWishlist = (id: string | number) => {
    setWishlist((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
  };

  const isWishlisted = (id: string | number) =>
    wishlist.some((item) => String(item.id) === String(id));

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}


"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
};

type CartItem = Omit<CartProduct, "image"> & {
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, amount: number) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("fastkart-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(
            parsedCart.map((item) => ({
              ...item,
              image: item.image || "",
              quantity: Math.max(1, Number(item.quantity) || 1),
            }))
          );
        }
      }
    } catch {
      localStorage.removeItem("fastkart-cart");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("fastkart-cart", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  const addToCart = (product: CartProduct) => {
    if (
      product.id === undefined ||
      product.id === null ||
      !product.name ||
      !Number.isFinite(Number(product.price))
    ) {
      console.error("Invalid product:", product);
      return;
    }

    const normalizedProduct: CartItem = {
      ...product,
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
      quantity: 1,
    };

    setCart((items) => {
      const existing = items.find(
        (item) => String(item.id) === String(normalizedProduct.id)
      );

      if (existing) {
        return items.map((item) =>
          String(item.id) === String(normalizedProduct.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...items, normalizedProduct];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((items) =>
      items.filter((item) => String(item.id) !== String(id))
    );
  };

  const updateQuantity = (id: string | number, amount: number) => {
    setCart((items) =>
      items.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + amount),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("fastkart-cart");
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

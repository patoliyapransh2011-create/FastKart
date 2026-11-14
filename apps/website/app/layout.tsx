
import type { Metadata } from "next";

import "./globals.css";
import "./account/account.css";
import "./wishlist/wishlist.css";
import "./cart/cart.css";
import "./settings/settings.css";
import "./checkout/checkout.css";
import "./order-success/order-success.css";
import "./admin/admin.css";
import "./admin/cancelled-orders/cancelled-orders.css";
import "./admin/orders/orders.css";
import "./admin/customers/customers.css";
import "./admin/categories/categories.css";
import "./admin/products/products.css";

import { CartProvider } from "./cart-context";
import { WishlistProvider } from "./wishlist-context";

export const metadata: Metadata = {
  title: "FastKart | Online Shopping",
  description:
    "FastKart - Discover electronics, fashion, accessories and more at great prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

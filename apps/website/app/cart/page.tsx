
"use client";

import Link from "next/link";
import { useCart } from "../cart-context";
import "../cart/cart.css";

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
  } = useCart();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 50;
  const total = subtotal + delivery;

  return (
    <main className="cart-page">
      <div className="cart-container">
        <Link href="/" className="cart-back">
          ← Continue Shopping
        </Link>

        <div className="cart-header">
          <h1 className="cart-title">Shopping Cart</h1>
          <span className="cart-items-count">
            {cartCount} Items
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>

            <h2>Your Cart is Empty</h2>

            <p>You haven't added any products yet.</p>

            <Link href="/" className="cart-shop-btn">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-products">
              {cart.map((item) => (
                <div className="cart-product" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-product-image"
                  />

                  <div className="cart-product-info">
                    <h3>{item.name}</h3>

                    <p className="cart-product-price">
                      {money(item.price)}
                    </p>

                    <div className="cart-quantity">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, -1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-product-right">
                    <p className="cart-line-total">
                      {money(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="cart-remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Items ({cartCount})</span>
                <span>{money(subtotal)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>
                  {delivery === 0 ? "FREE" : money(delivery)}
                </span>
              </div>

              <hr className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>

              <p className="cart-delivery-note">
                Free delivery on orders above ₹999.
              </p>

              <Link
                href="/checkout"
                className="cart-checkout-btn"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

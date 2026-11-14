
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { useCart } from "../cart-context";
import "../checkout/checkout.css";

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

type PaymentMethod = "COD" | "UPI" | "Card" | "Net Banking";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = subtotal === 0 || subtotal >= 999 ? 0 : 50;
  const total = subtotal + delivery;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    if (cart.length === 0) {
      alert("Your cart is empty!");
      router.push("/cart");
      return;
    }

    setSubmitting(true);

    try {
      const order = {
        orderId: `FK-${Date.now()}`,
        orderDate: new Date().toLocaleString("en-IN"),
        customer: { ...form },
        items: cart.map((item) => ({ ...item })),
        subtotal,
        delivery,
        total,
        paymentMethod,
        paymentStatus: "Demo - Not Paid",
        orderStatus: "Confirmed",
        deliveryStatus: "Processing",
      };

      localStorage.setItem(
        "fastkart-last-order",
        JSON.stringify(order)
      );

      const previousOrders = JSON.parse(
        localStorage.getItem("fastkart-orders") || "[]"
      );

      localStorage.setItem(
        "fastkart-orders",
        JSON.stringify([order, ...previousOrders])
      );

      clearCart();
      localStorage.removeItem("fastkart-cart");

      router.push("/order-success");
    } catch (error) {
      console.error("Order submission failed:", error);
      setSubmitting(false);
      alert("Unable to place order. Please try again.");
    }
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">🛒</div>
            <h1 className="checkout-empty-title">
              Your Cart is Empty
            </h1>
            <p className="checkout-empty-description">
              Add products before proceeding to checkout.
            </p>
            <Link href="/" className="checkout-shop-btn">
              Start Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <Link href="/cart" className="checkout-back">
          ← Back to Cart
        </Link>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2 className="checkout-section-title">
              Delivery Information
            </h2>

            <div className="checkout-field">
              <label className="checkout-label">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="checkout-input"
              />
            </div>

            <div className="checkout-fields-two">
              <div className="checkout-field">
                <label className="checkout-label">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="10-digit phone number"
                  className="checkout-input"
                />
              </div>

              <div className="checkout-field">
                <label className="checkout-label">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="checkout-input"
                />
              </div>
            </div>

            <div className="checkout-field">
              <label className="checkout-label">
                Full Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="House number, street, area"
                className="checkout-input"
              />
            </div>

            <div className="checkout-fields-three">
              <div className="checkout-field">
                <label className="checkout-label">City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                  className="checkout-input"
                />
              </div>

              <div className="checkout-field">
                <label className="checkout-label">State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  placeholder="State"
                  className="checkout-input"
                />
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  className="checkout-input"
                />
              </div>
            </div>

            <hr className="checkout-divider" />

            <h2 className="checkout-section-title">
              Select Payment Method
            </h2>

            <div className="checkout-payment-options">
              {([
                ["COD", "💵", "Cash on Delivery"],
                ["UPI", "📱", "UPI"],
                ["Card", "💳", "Credit / Debit Card"],
                ["Net Banking", "🏦", "Net Banking"],
              ] as const).map(([value, icon, label]) => (
                <label
                  key={value}
                  className={`checkout-payment-option ${
                    paymentMethod === value ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="checkout-payment-radio"
                  />
                  <span className="checkout-payment-icon">
                    {icon}
                  </span>
                  <span className="checkout-payment-label">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <p className="checkout-demo-note">
              Demo payment selection only. No real payment will be
              collected or processed.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="checkout-place-btn"
            >
              {submitting ? "Processing..." : "Place Order →"}
            </button>
          </form>

          <div className="checkout-summary">
            <h2 className="checkout-summary-title">
              Order Summary
            </h2>

            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="checkout-item-image"
                  />

                  <div className="checkout-item-info">
                    <p className="checkout-item-name">
                      {item.name}
                    </p>
                    <p className="checkout-item-quantity">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="checkout-item-price">
                    {money(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <hr className="checkout-divider" />

            <div className="checkout-summary-row">
              <span>Items ({cartCount})</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className="checkout-summary-row">
              <span>Delivery</span>
              <span>
                {delivery === 0 ? "FREE" : money(delivery)}
              </span>
            </div>

            <hr className="checkout-divider" />

            <div className="checkout-total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>

            <p className="checkout-delivery-note">
              Free delivery on orders above ₹999.
            </p>

            <hr className="checkout-divider" />

            <div className="checkout-summary-row">
              <span>Payment Method</span>
              <strong>{paymentMethod}</strong>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

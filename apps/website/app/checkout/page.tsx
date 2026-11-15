
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useCart } from "../cart-context";
import PaymentQR from "./PaymentQR";
import "./checkout.css";

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

type PaymentMethod = "COD" | "UPI" | "Card" | "Net Banking";

type Product = {
  id: string | number;
  name: string;
  stock?: number;
};

type Coupon = {
  id: string;
  code: string;
  discountType: "Percentage" | "Fixed";
  discountValue: number;
  minOrder: number;
  expiryDate: string;
  active: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] =
    useState<Coupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");

  const [paymentId, setPaymentId] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const orderLock = useRef(false);

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

  const calculateDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "Percentage") {
      return Math.min(
        subtotal,
        (subtotal * coupon.discountValue) / 100
      );
    }

    return Math.min(subtotal, coupon.discountValue);
  };

  const discount = appliedCoupon
    ? calculateDiscount(appliedCoupon)
    : 0;

  const total = subtotal - discount + delivery;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const applyCoupon = () => {
    const enteredCode = couponCode.trim().toUpperCase();

    if (!enteredCode) {
      setCouponMessage("Please enter a coupon code.");
      setAppliedCoupon(null);
      return;
    }

    try {
      const coupons: Coupon[] = JSON.parse(
        localStorage.getItem("fastkart-admin-coupons") || "[]"
      );

      const coupon = coupons.find(
        (item) => item.code.toUpperCase() === enteredCode
      );

      if (!coupon) {
        setAppliedCoupon(null);
        setCouponMessage("Invalid coupon code.");
        return;
      }

      if (!coupon.active) {
        setAppliedCoupon(null);
        setCouponMessage("This coupon is inactive.");
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      if (coupon.expiryDate < today) {
        setAppliedCoupon(null);
        setCouponMessage("This coupon has expired.");
        return;
      }

      if (subtotal < coupon.minOrder) {
        setAppliedCoupon(null);
        setCouponMessage(
          `Minimum order amount is ${money(coupon.minOrder)}.`
        );
        return;
      }

      if (
        coupon.discountValue <= 0 ||
        (coupon.discountType === "Percentage" &&
          coupon.discountValue > 100)
      ) {
        setAppliedCoupon(null);
        setCouponMessage("This coupon has an invalid discount.");
        return;
      }

      setAppliedCoupon(coupon);
      setCouponCode(enteredCode);
      setCouponMessage("Coupon applied successfully!");
    } catch {
      setAppliedCoupon(null);
      setCouponMessage("Unable to validate coupon.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("Coupon removed.");
  };

  // Create order after successful demo payment or COD.
  const processOrder = (paymentResult: string) => {
    if (orderLock.current || cart.length === 0) return;

    orderLock.current = true;
    setSubmitting(true);

    try {
      const savedProducts: Product[] = JSON.parse(
        localStorage.getItem("fastkart-admin-products") || "[]"
      );

      const productsWithStock = savedProducts.map((product) => ({
        ...product,
        stock:
          typeof product.stock === "number"
            ? Math.max(0, product.stock)
            : 10,
      }));

      // Validate stock.
      for (const item of cart) {
        const product = productsWithStock.find(
          (p) => String(p.id) === String(item.id)
        );

        if (!product) {
          throw new Error(`${item.name} is no longer available.`);
        }

        if ((product.stock || 0) < item.quantity) {
          throw new Error(
            `${item.name}: only ${product.stock || 0} unit(s) available.`
          );
        }
      }

      // Validate coupon again.
      let finalCoupon: Coupon | null = null;
      let finalDiscount = 0;

      if (appliedCoupon) {
        const coupons: Coupon[] = JSON.parse(
          localStorage.getItem("fastkart-admin-coupons") || "[]"
        );

        const currentCoupon = coupons.find(
          (item) =>
            item.code.toUpperCase() === appliedCoupon.code.toUpperCase()
        );

        const today = new Date().toISOString().split("T")[0];

        if (
          !currentCoupon ||
          !currentCoupon.active ||
          currentCoupon.expiryDate < today ||
          subtotal < currentCoupon.minOrder
        ) {
          throw new Error(
            "Your coupon is no longer valid. Please apply it again."
          );
        }

        finalCoupon = currentCoupon;

        if (currentCoupon.discountType === "Percentage") {
          finalDiscount = Math.min(
            subtotal,
            (subtotal * currentCoupon.discountValue) / 100
          );
        } else {
          finalDiscount = Math.min(
            subtotal,
            currentCoupon.discountValue
          );
        }
      }

      const finalTotal = subtotal - finalDiscount + delivery;

      // Deduct stock after validation.
      const updatedProducts = productsWithStock.map((product) => {
        const cartItem = cart.find(
          (item) => String(item.id) === String(product.id)
        );

        if (!cartItem) return product;

        return {
          ...product,
          stock: (product.stock || 0) - cartItem.quantity,
        };
      });

      const order = {
        orderId: `FK-${Date.now()}`,
        orderDate: new Date().toLocaleString("en-IN"),
        customer: { ...form },
        items: cart.map((item) => ({ ...item })),
        subtotal,
        delivery,
        couponCode: finalCoupon?.code || "",
        discount: finalDiscount,
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentResult,
        paymentGateway:
          paymentMethod === "COD"
            ? "Cash on Delivery"
            : "FastKart Demo Gateway",
        transactionId:
          paymentResult === "Paid - Demo"
            ? `FKDEMO-${Date.now()}`
            : "",
        orderStatus: "Confirmed",
        deliveryStatus: "Processing",
      };

      const previousOrders = JSON.parse(
        localStorage.getItem("fastkart-orders") || "[]"
      );

      localStorage.setItem(
        "fastkart-orders",
        JSON.stringify([order, ...previousOrders])
      );

      localStorage.setItem(
        "fastkart-last-order",
        JSON.stringify(order)
      );

      localStorage.setItem(
        "fastkart-admin-products",
        JSON.stringify(updatedProducts)
      );

      window.dispatchEvent(new Event("fastkart-products-updated"));
      window.dispatchEvent(new Event("fastkart-orders-updated"));

      clearCart();
      localStorage.removeItem("fastkart-cart");

      router.push("/order-success");
    } catch (error) {
      orderLock.current = false;
      setSubmitting(false);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again."
      );
    }
  };

  // Create a demo payment.
  const startPayment = async () => {
    setPaymentError("");
    setPaymentStatus("");

    try {
      const response = await fetch("/api/demo-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start payment.");
      }

      setPaymentId(data.payment.id);
      setPaymentDialogOpen(true);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Payment could not start."
      );
    }
  };

  // Check payment status automatically.
  useEffect(() => {
    if (!paymentId || !paymentDialogOpen) return;

    let active = true;

    const checkPayment = async () => {
      try {
        const response = await fetch(
          `/api/demo-payment?id=${encodeURIComponent(paymentId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!active || !response.ok) return;

        if (data.payment.status === "paid") {
          setPaymentDialogOpen(false);
          setPaymentStatus("paid");
          setPaymentId("");
        }

        if (data.payment.status === "failed") {
          setPaymentDialogOpen(false);
          setPaymentStatus("failed");
          setPaymentId("");
          setPaymentError(
            "Demo payment failed. Your cart is unchanged. Please try again."
          );
        }
      } catch {
        // Try again on the next check.
      }
    };

    const timer = window.setInterval(checkPayment, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [paymentId, paymentDialogOpen]);

  // Place order only after the server reports demo success.
  useEffect(() => {
    if (paymentStatus === "paid") {
      processOrder("Paid - Demo");
    }
  }, [paymentStatus]);

  const updateDemoPayment = async (status: "paid" | "failed") => {
    if (!paymentId) return;

    try {
      const response = await fetch("/api/demo-payment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: paymentId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment update failed.");
      }
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Payment update failed."
      );
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting) return;

    if (cart.length === 0) {
      alert("Your cart is empty!");
      router.push("/cart");
      return;
    }

    if (paymentMethod === "COD") {
      processOrder("Pending - Cash on Delivery");
      return;
    }

    startPayment();
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
                <label className="checkout-label">Phone Number</label>
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
                <label className="checkout-label">Email Address</label>
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
              <label className="checkout-label">Full Address</label>
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
                ["UPI", "📱", "UPI QR Payment"],
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
              Demo payment only. No real money will be transferred.
            </p>

            {paymentError && (
              <p className="checkout-payment-error">
                {paymentError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="checkout-place-btn"
            >
              {submitting ? "Processing..." : "Place Order →"}
            </button>

            {paymentDialogOpen && (
              <div className="demo-qr-overlay">
                <div className="demo-qr-modal">
                  <button
                    type="button"
                    className="demo-qr-close"
                    onClick={() => {
                      setPaymentDialogOpen(false);
                      setPaymentId("");
                    }}
                  >
                    ✕
                  </button>

                  {paymentMethod === "UPI" ? (
                    <PaymentQR
                      paymentId={paymentId}
                      amount={total}
                    />
                  ) : (
                    <div className="demo-bank-payment">
                      <div className="demo-bank-icon">
                        {paymentMethod === "Card" ? "💳" : "🏦"}
                      </div>

                      <h2>FastKart Demo Payment</h2>

                      <p>
                        {paymentMethod} Demo Payment
                      </p>

                      <div className="demo-bank-amount">
                        {money(total)}
                      </div>

                      <p className="demo-bank-warning">
                        Simulation only. No real payment or bank
                        credentials are required.
                      </p>

                      <button
                        type="button"
                        className="demo-bank-success"
                        onClick={() => updateDemoPayment("paid")}
                      >
                        Approve Demo Payment
                      </button>

                      <button
                        type="button"
                        className="demo-bank-failed"
                        onClick={() => updateDemoPayment("failed")}
                      >
                        Simulate Failed Payment
                      </button>
                    </div>
                  )}

                  <p className="demo-qr-waiting">
                    Waiting for demo payment approval...
                  </p>

                  <button
                    type="button"
                    className="demo-qr-cancel"
                    onClick={() => {
                      setPaymentDialogOpen(false);
                      setPaymentId("");
                    }}
                  >
                    Cancel Payment
                  </button>
                </div>
              </div>
            )}
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

            <h3 className="checkout-section-title">
              Apply Coupon
            </h3>

            <div className="checkout-coupon-box">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setAppliedCoupon(null);
                  setCouponMessage("");
                }}
                placeholder="Enter coupon code"
                className="checkout-input"
                disabled={!!appliedCoupon}
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="checkout-coupon-btn"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="checkout-coupon-btn"
                >
                  Apply
                </button>
              )}
            </div>

            {couponMessage && (
              <p
                className="checkout-coupon-message"
                style={{
                  color: appliedCoupon ? "#15803d" : "#dc2626",
                }}
              >
                {couponMessage}
              </p>
            )}

            <hr className="checkout-divider" />

            <div className="checkout-summary-row">
              <span>Items ({cartCount})</span>
              <span>{money(subtotal)}</span>
            </div>

            {appliedCoupon && (
              <div className="checkout-summary-row">
                <span>Coupon Discount</span>
                <strong style={{ color: "#15803d" }}>
                  -{money(discount)}
                </strong>
              </div>
            )}

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

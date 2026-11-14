
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "../order-success/order-success.css";

type Order = {
  orderId: string;
  orderDate: string;
  customer: {
    name: string;
    city: string;
    phone?: string;
    email?: string;
  };
  total: number;
  subtotal?: number;
  delivery?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus: string;
  deliveryStatus: string;
};

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("fastkart-last-order");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch {
        setOrder(null);
      }
    }
  }, []);

  if (!order) {
    return (
      <main className="order-success-page">
        <div className="order-success-container">
          <h1 className="order-success-title">
            Order Details Not Found
          </h1>
          <p className="order-success-description">
            Please place an order to see your confirmation details.
          </p>
          <Link href="/" className="order-success-shop-btn">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-success-page">
      <div className="order-success-container">
        <div className="order-success-header">
          <div className="order-success-icon">✓</div>

          <h1 className="order-success-title">
            Order Confirmed!
          </h1>

          <p className="order-success-description">
            Thank you for shopping with FastKart.
            Your order has been placed successfully.
          </p>
        </div>

        <div className="order-success-details">
          <div className="order-success-id">
            <span className="order-success-id-label">
              ORDER ID
            </span>
            <strong className="order-success-id-value">
              {order.orderId}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Order Date</span>
            <strong className="order-success-value">
              {order.orderDate}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Customer Name</span>
            <strong className="order-success-value">
              {order.customer?.name || "Not available"}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">City</span>
            <strong className="order-success-value">
              {order.customer?.city || "Not available"}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Payment Method</span>
            <strong className="order-success-value">
              {order.paymentMethod || "Not available"}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Payment Status</span>
            <strong className="order-success-value order-success-payment">
              {order.paymentStatus || "Not available"}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Order Status</span>
            <strong className="order-success-value order-success-status">
              {order.orderStatus}
            </strong>
          </div>

          <div className="order-success-row">
            <span className="order-success-label">Delivery Status</span>
            <strong className="order-success-value">
              {order.deliveryStatus}
            </strong>
          </div>

          {typeof order.subtotal === "number" && (
            <div className="order-success-row">
              <span className="order-success-label">Subtotal</span>
              <strong className="order-success-value">
                {money(order.subtotal)}
              </strong>
            </div>
          )}

          {typeof order.delivery === "number" && (
            <div className="order-success-row">
              <span className="order-success-label">Delivery Charge</span>
              <strong className="order-success-value">
                {order.delivery === 0 ? "FREE" : money(order.delivery)}
              </strong>
            </div>
          )}

          <div className="order-success-row order-success-total">
            <span className="order-success-label">Total Amount</span>
            <strong className="order-success-value">
              {money(order.total)}
            </strong>
          </div>
        </div>

        <div className="order-success-note">
          This is a demo checkout. No real payment has been collected.
        </div>

        <div className="order-success-actions">
          <Link href="/" className="order-success-shop-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

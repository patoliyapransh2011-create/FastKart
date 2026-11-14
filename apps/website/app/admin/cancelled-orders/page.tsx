
"use client";

import { useEffect, useState } from "react";

type Order = {
  orderId: string;
  orderDate?: string;
  total: number;
  orderStatus?: string;
  deliveryStatus?: string;
  customer?: {
    name?: string;
    phone?: string;
    city?: string;
  };
};

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

export default function CancelledOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("fastkart-orders");

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          setOrders(
            parsedOrders.filter((order: Order) =>
              ["cancelled", "canceled"].includes(
                (order.orderStatus || "").trim().toLowerCase()
              )
            )
          );
        }
      }
    } catch (error) {
      console.error("Cancelled orders error:", error);
    }

    setLoaded(true);
  }, []);

  const totalCancelledAmount = orders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );

  return (
    <div className="cancelled-page">
      <div className="cancelled-heading">
        <div>
          <p className="cancelled-eyebrow">ORDER MANAGEMENT</p>
          <h1>Cancelled Orders</h1>
          <p>View and manage all cancelled customer orders.</p>
        </div>
      </div>

      <div className="cancelled-stats">
        <div className="cancelled-stat-card">
          <span>Total Cancelled Orders</span>
          <strong>{loaded ? orders.length : "—"}</strong>
        </div>

        <div className="cancelled-stat-card">
          <span>Cancelled Order Value</span>
          <strong>
            {loaded ? money(totalCancelledAmount) : "—"}
          </strong>
        </div>
      </div>

      <div className="cancelled-table-card">
        <div className="cancelled-table-heading">
          <div>
            <h2>Cancelled Order List</h2>
            <p>All cancelled orders are listed below.</p>
          </div>
        </div>

        <div className="cancelled-table-wrap">
          <table className="cancelled-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={7}>Loading cancelled orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cancelled-empty">
                    <span>✓</span>
                    <strong>No Cancelled Orders</strong>
                    <small>There are currently no cancelled orders.</small>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr key={order.orderId || index}>
                    <td>
                      <strong>{order.orderId || "N/A"}</strong>
                    </td>
                    <td>{order.customer?.name || "Guest"}</td>
                    <td>{order.customer?.phone || "—"}</td>
                    <td>{order.customer?.city || "—"}</td>
                    <td>{order.orderDate || "—"}</td>
                    <td>{money(Number(order.total) || 0)}</td>
                    <td>
                      <span className="cancelled-status">
                        Cancelled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

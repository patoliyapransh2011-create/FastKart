
"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  orderId: string;
  orderDate?: string;
  total: number;
  orderStatus?: string;
  deliveryStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  customer?: {
    name?: string;
    phone?: string;
    city?: string;
  };
};

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

const isCancelled = (order: Order) =>
  ["cancelled", "canceled"].includes(
    (order.orderStatus || "").trim().toLowerCase()
  );

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fastkart-orders");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch (error) {
      console.error("Orders loading error:", error);
    }

    setLoaded(true);
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((order) => !isCancelled(order)),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return activeOrders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (order.orderId || "").toLowerCase().includes(searchText) ||
        (order.customer?.name || "").toLowerCase().includes(searchText) ||
        (order.customer?.phone || "").includes(searchText);

      const status = (order.orderStatus || "Pending").toLowerCase();

      const matchesFilter =
        filter === "All" ||
        status === filter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [activeOrders, search, filter]);

  const totalRevenue = activeOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  return (
    <div className="orders-page">
      <div className="orders-heading">
        <div>
          <p className="orders-eyebrow">ORDER MANAGEMENT</p>
          <h1>Orders</h1>
          <p>Manage and track all customer orders.</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="orders-stat-card">
          <span>Total Orders</span>
          <strong>{loaded ? activeOrders.length : "—"}</strong>
        </div>

        <div className="orders-stat-card">
          <span>Total Revenue</span>
          <strong>{loaded ? money(totalRevenue) : "—"}</strong>
        </div>

        <div className="orders-stat-card">
          <span>Confirmed Orders</span>
          <strong>
            {loaded
              ? activeOrders.filter(
                  (o) => o.orderStatus?.toLowerCase() === "confirmed"
                ).length
              : "—"}
          </strong>
        </div>

        <div className="orders-stat-card">
          <span>Processing Orders</span>
          <strong>
            {loaded
              ? activeOrders.filter(
                  (o) => o.deliveryStatus?.toLowerCase() === "processing"
                ).length
              : "—"}
          </strong>
        </div>
      </div>

      <div className="orders-table-card">
        <div className="orders-table-heading">
          <div>
            <h2>All Orders</h2>
            <p>View and manage customer orders.</p>
          </div>
        </div>

        <div className="orders-toolbar">
          <input
            type="text"
            placeholder="Search order ID, customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>City</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Delivery Status</th>
              </tr>
            </thead>

            <tbody>
              {!loaded ? (
                <tr>
                  <td colSpan={9}>Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="orders-empty">
                    <strong>No Orders Found</strong>
                    <small>There are no matching active orders.</small>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.orderId || index}>
                    <td>
                      <strong>{order.orderId || "N/A"}</strong>
                    </td>
                    <td>{order.customer?.name || "Guest"}</td>
                    <td>{order.customer?.phone || "—"}</td>
                    <td>{order.customer?.city || "—"}</td>
                    <td>{order.orderDate || "—"}</td>
                    <td>{money(Number(order.total) || 0)}</td>
                    <td>{order.paymentMethod || "—"}</td>
                    <td>
                      <span className="orders-status">
                        {order.orderStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span className="orders-delivery-status">
                        {order.deliveryStatus || "Pending"}
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

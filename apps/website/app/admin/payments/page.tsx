
"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentOrder = {
  orderId?: string;
  id?: string;
  orderDate?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  customerName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  total?: number;
};

const STORAGE_KEY = "fastkart-orders";

const money = (amount: number) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

export default function PaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadOrders = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setOrders(saved ? JSON.parse(saved) : []);
      } catch {
        setOrders([]);
      }
    };

    loadOrders();
    window.addEventListener("storage", loadOrders);
    window.addEventListener("fastkart-orders-updated", loadOrders);

    return () => {
      window.removeEventListener("storage", loadOrders);
      window.removeEventListener("fastkart-orders-updated", loadOrders);
    };
  }, []);

  const getStatus = (status?: string) => {
    const value = (status || "Pending").toLowerCase();

    if (
      value.includes("paid") ||
      value.includes("success") ||
      value.includes("completed")
    ) {
      return "Paid";
    }

    if (value.includes("fail") || value.includes("reject")) {
      return "Failed";
    }

    return "Pending";
  };

  const activeOrders = orders.filter(
  (order) =>
    (order.orderStatus || "").toLowerCase() !== "cancelled"
);

  const paidOrders = activeOrders.filter(
  (order) => getStatus(order.paymentStatus) === "Paid"
);

const pendingOrders = activeOrders.filter(
  (order) => getStatus(order.paymentStatus) === "Pending"
);

const failedOrders = activeOrders.filter(
  (order) => getStatus(order.paymentStatus) === "Failed"
);

const codOrders = activeOrders.filter(
  (order) => (order.paymentMethod || "").toLowerCase() === "cod"
);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = order.orderId || order.id || "";
      const customer =
        order.customer?.name || order.customerName || "";
      const method = order.paymentMethod || "Not specified";
      const status = getStatus(order.paymentStatus);

      const matchesSearch =
        orderId.toLowerCase().includes(search.toLowerCase()) ||
        customer.toLowerCase().includes(search.toLowerCase());

      const matchesMethod =
        methodFilter === "All" || method === methodFilter;

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [orders, search, methodFilter, statusFilter]);

  return (
    <div className="payments-page">
      <div className="payments-header">
        <div>
          <h1>Payments Management</h1>
          <p>Manage and monitor all customer payments.</p>
        </div>
      </div>

      <div className="payments-stats">
        <div className="payments-stat-card">
          <span>Total Payments</span>
<h2>{activeOrders.length}</h2>         
 <small>All customer orders</small>
        </div>

        <div className="payments-stat-card">
          <span>Successful Payments</span>
          <h2>{paidOrders.length}</h2>
          <small>Paid orders</small>
        </div>

        <div className="payments-stat-card">
          <span>Pending Payments</span>
          <h2>{pendingOrders.length}</h2>
          <small>Awaiting payment</small>
        </div>

        <div className="payments-stat-card">
          <span>Failed Payments</span>
          <h2>{failedOrders.length}</h2>
          <small>Unsuccessful payments</small>
        </div>

        <div className="payments-stat-card">
          <span>COD Orders</span>
          <h2>{codOrders.length}</h2>
          <small>Cash on delivery</small>
        </div>
      </div>

      <div className="payments-table-card">
        <div className="payments-table-heading">
          <div>
            <h2>All Transactions</h2>
            <p>View payment details for every order.</p>
          </div>

          <span className="payments-count">
            {filteredOrders.length} Records
          </span>
        </div>

        <div className="payments-filters">
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="COD">COD</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const status = getStatus(order.paymentStatus);

                  return (
                    <tr key={`${order.orderId || order.id || "order"}-${index}`}>
                      <td className="payments-order-id">
                        #{order.orderId || order.id || "N/A"}
                      </td>

                      <td>
                        <strong>
                          {order.customer?.name ||
                            order.customerName ||
                            "Customer"}
                        </strong>
                        <small className="payments-email">
                          {order.customer?.email || ""}
                        </small>
                      </td>

                      <td>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td>
                        <span className="payments-method">
                          {order.paymentMethod || "Not specified"}
                        </span>
                      </td>

                      <td className="payments-amount">
                        {money(order.total || 0)}
                      </td>

                      <td>
                        <span className={`payments-status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                        {order.paymentStatus && (
                          <small className="payments-original-status">
                            {order.paymentStatus}
                          </small>
                        )}
                      </td>

                      <td>
                        {order.orderStatus || "Confirmed"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="payments-empty">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

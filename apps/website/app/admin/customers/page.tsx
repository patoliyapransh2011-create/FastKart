
"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  orderId: string;
  orderDate?: string;
  total: number;
  orderStatus?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
  };
};

type Customer = {
  name: string;
  phone: string;
  email: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
};

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fastkart-orders");
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        setOrders(
          parsed.filter(
            (order) =>
              order.orderStatus?.toLowerCase() !== "cancelled" &&
              order.orderStatus?.toLowerCase() !== "canceled"
          )
        );
      }
    } catch {
      setOrders([]);
    }
  }, []);

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    orders.forEach((order) => {
      const name = order.customer?.name || "Guest Customer";
      const phone = order.customer?.phone || "";
      const email = order.customer?.email || "";
      const city = order.customer?.city || "";
      const key = phone || email || name;

      const existing = customerMap.get(key);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(order.total) || 0;

        if (
          order.orderDate &&
          (!existing.lastOrder ||
            new Date(order.orderDate) > new Date(existing.lastOrder))
        ) {
          existing.lastOrder = order.orderDate;
        }
      } else {
        customerMap.set(key, {
          name,
          phone,
          email,
          city,
          totalOrders: 1,
          totalSpent: Number(order.total) || 0,
          lastOrder: order.orderDate || "",
        });
      }
    });

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }, [orders]);

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.name,
      customer.phone,
      customer.email,
      customer.city,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalSpent,
    0
  );

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );

  return (
    <div className="customers-page">
      <div className="customers-heading">
        <div>
          <span className="customers-eyebrow">CUSTOMER MANAGEMENT</span>
          <h1>Customers</h1>
          <p>Manage and understand your customers.</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="customers-stat-card">
          <div className="customers-stat-icon blue">♙</div>
          <div>
            <span>Total Customers</span>
            <h2>{customers.length}</h2>
          </div>
        </div>

        <div className="customers-stat-card">
          <div className="customers-stat-icon green">₹</div>
          <div>
            <span>Total Revenue</span>
            <h2>{money(totalRevenue)}</h2>
          </div>
        </div>

        <div className="customers-stat-card">
          <div className="customers-stat-icon purple">▤</div>
          <div>
            <span>Total Orders</span>
            <h2>{totalOrders}</h2>
          </div>
        </div>
      </div>

      <div className="customers-table-card">
        <div className="customers-table-heading">
          <div>
            <h2>All Customers</h2>
            <p>{filteredCustomers.length} customers found</p>
          </div>

          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="customers-table-wrap">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.phone || customer.email || index}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td>{customer.phone || "—"}</td>
                    <td>{customer.email || "—"}</td>
                    <td>{customer.city || "—"}</td>
                    <td>
                      <span className="customer-order-count">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="customer-spent">
                      {money(customer.totalSpent)}
                    </td>
                    <td>
                      {customer.lastOrder
                        ? new Date(customer.lastOrder).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="customers-empty">
                      <span>♙</span>
                      <h3>No customers found</h3>
                      <p>Customers will appear here after orders are placed.</p>
                    </div>
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

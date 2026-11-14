
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category?: string;
};

type Order = {
  orderId: string;
  total: number;
  orderStatus?: string;
  customer?: {
    name?: string;
  };
};

const shortcuts = [
  {
    title: "Manage Products",
    description: "Add, edit and manage store products.",
    href: "/admin/products",
    icon: "📦",
  },
  {
    title: "Manage Orders",
    description: "View customer orders and update status.",
    href: "/admin/orders",
    icon: "🛍️",
  },
  {
    title: "Customers",
    description: "View your registered customers.",
    href: "/admin/customers",
    icon: "👥",
  },
  {
    title: "Categories",
    description: "Organize your store categories.",
    href: "/admin/categories",
    icon: "🗂️",
  },
];

const money = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN");

const isCancelled = (order: Order) =>
  ["cancelled", "canceled"].includes(
    (order.orderStatus || "").trim().toLowerCase()
  );

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(
        "fastkart-admin-products"
      );

      const savedOrders = localStorage.getItem("fastkart-orders");

      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error("Admin dashboard data error:", error);
    }

    setMounted(true);
  }, []);

  const cancelledOrders = orders.filter(isCancelled);
  const activeOrders = orders.filter((order) => !isCancelled(order));

  const revenue = activeOrders.reduce(
    (total, order) => total + (Number(order.total) || 0),
    0
  );

  const customers = new Set(
    activeOrders.map((order) => order.customer?.name).filter(Boolean)
  ).size;

  const stats = [
    {
      label: "Total Products",
      value: mounted ? products.length : "—",
      icon: "📦",
      color: "blue",
    },
    {
      label: "Total Orders",
      value: mounted ? activeOrders.length : "—",
      icon: "🛍️",
      color: "purple",
    },
    {
      label: "Cancelled Orders",
      value: mounted ? cancelledOrders.length : "—",
      icon: "❌",
      color: "orange",
    },
    {
      label: "Total Revenue",
      value: mounted ? money(revenue) : "—",
      icon: "₹",
      color: "green",
    },
    {
      label: "Total Customers",
      value: mounted ? customers : "—",
      icon: "👥",
      color: "blue",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p>Welcome to your FastKart store management panel.</p>
        </div>

        <Link href="/admin/products" className="dashboard-add-btn">
          + Add Product
        </Link>
      </div>

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div
            className={`dashboard-stat-card ${stat.color}`}
            key={stat.label}
          >
            <div className="dashboard-stat-top">
              <span>{stat.label}</span>
              <span className="dashboard-stat-icon">{stat.icon}</span>
            </div>

            <strong>{stat.value}</strong>
            <small>Store overview</small>
          </div>
        ))}
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Manage your online store from one place.</p>
          </div>
        </div>

        <div className="dashboard-shortcuts">
          {shortcuts.map((item) => (
            <Link
              href={item.href}
              className="dashboard-shortcut-card"
              key={item.title}
            >
              <span className="dashboard-shortcut-icon">
                {item.icon}
              </span>

              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="dashboard-shortcut-link">
                Open Section →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest active orders received by your store.</p>
          </div>

          <Link href="/admin/orders" className="dashboard-view-all">
            View All →
          </Link>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {!mounted ? (
                <tr>
                  <td colSpan={4}>Loading orders...</td>
                </tr>
              ) : activeOrders.length === 0 ? (
                <tr>
                  <td colSpan={4}>No active orders available.</td>
                </tr>
              ) : (
                activeOrders.slice(0, 5).map((order, index) => (
                  <tr key={order.orderId || index}>
                    <td>{order.orderId || "N/A"}</td>
                    <td>{order.customer?.name || "Guest"}</td>
                    <td>{money(Number(order.total) || 0)}</td>
                    <td>
                      <span className="dashboard-order-status">
                        {order.orderStatus || "Confirmed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Store Information</h2>
            <p>Your current store overview.</p>
          </div>
        </div>

        <div className="dashboard-info-card">
          <div>
            <span>Store Name</span>
            <strong>FastKart</strong>
          </div>
          <div>
            <span>Platform</span>
            <strong>E-Commerce</strong>
          </div>
          <div>
            <span>Currency</span>
            <strong>INR (₹)</strong>
          </div>
          <div>
            <span>Admin Panel</span>
            <strong className="dashboard-active-label">Active</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

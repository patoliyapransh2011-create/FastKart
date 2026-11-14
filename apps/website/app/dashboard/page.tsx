
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "../cart-context";
import { useWishlist } from "../wishlist-context";
import "../dashboard/dashboard.css";

type Order = {
  orderId?: string;
  total?: number;
  orderStatus?: string;
  deliveryStatus?: string;
};

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("fastkart-account");
      const savedOrders = localStorage.getItem("fastkart-orders");

      if (savedProfile) setProfile(JSON.parse(savedProfile));

      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      console.error("Dashboard data loading failed");
    }
  }, []);

  const shortcuts = [
    {
      title: "My Orders",
      description: "Track and manage your orders",
      icon: "📦",
      link: "/my-orders",
      count: orders.length,
    },
    {
      title: "My Wishlist",
      description: "Your favourite saved products",
      icon: "❤️",
      link: "/wishlist",
      count: wishlist.length,
    },
    {
      title: "My Cart",
      description: "Continue your shopping",
      icon: "🛒",
      link: "/cart",
      count: cartCount,
    },
    {
      title: "My Account",
      description: "Manage your profile details",
      icon: "👤",
      link: "/account",
    },
    {
      title: "Settings",
      description: "Manage your preferences",
      icon: "⚙️",
      link: "/setting",
    },
  ];

  return (
    <main className="store dashboard-store">
      <div className="announcement">
        🎉 Welcome to FastKart
        <span> | </span>
        Your personal shopping dashboard
      </div>

      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo">
            <span className="logo-icon">F</span>
            Fast<span>Kart</span>
          </Link>

          <div className="header-actions">
            <Link href="/" className="header-link">
              <span>⌂</span>
              <small>Home</small>
            </Link>

            <Link href="/wishlist" className="header-link">
              <span>♡</span>
              <small>Wishlist</small>
            </Link>

            <Link href="/account" className="header-link">
              <span>♙</span>
              <small>Account</small>
            </Link>

            <Link href="/my-orders" className="header-link">
              <span>📦</span>
              <small>My Orders</small>
            </Link>

            <Link href="/cart" className="header-link cart-link">
              <span>🛒</span>
              <small>Cart</small>
              <b className="cart-count">{cartCount}</b>
            </Link>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-inner">
            <Link href="/">Home</Link>
            <Link href="/#categories">Categories</Link>
            <Link href="/#products">Shop</Link>
            <Link href="/my-orders">My Orders</Link>
            <Link href="/setting">⚙️ Settings</Link>
          </div>
        </nav>
      </header>

      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">MY FASTKART</span>
          <h1>
            Hello, {profile.name || "Customer"}!
            <span> Welcome Back.</span>
          </h1>
          <p>
            Manage your orders, saved products and shopping
            activities from one place.
          </p>
          <Link href="/#products" className="primary-btn">
            Continue Shopping →
          </Link>
        </div>
        <div className="dashboard-hero-icon">🛍️</div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-heading">
          <span className="eyebrow">QUICK ACCESS</span>
          <h2>Your Shopping Dashboard</h2>
          <p>Everything you need, all in one place.</p>
        </div>

        <div className="dashboard-grid">
          {shortcuts.map((item) => (
            <Link
              href={item.link}
              key={item.title}
              className="dashboard-card"
            >
              <div className="dashboard-card-top">
                <span className="dashboard-card-icon">{item.icon}</span>
                {item.count !== undefined && (
                  <span className="dashboard-count">{item.count}</span>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <strong>Open Page →</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-bottom">
        <div className="dashboard-panel">
          <span className="eyebrow">YOUR ACTIVITY</span>
          <h2>Recent Orders</h2>

          {orders.length === 0 ? (
            <p className="dashboard-muted">
              You have not placed any orders yet.
            </p>
          ) : (
            <div className="dashboard-orders">
              {orders.slice(0, 3).map((order, index) => (
                <div
                  className="dashboard-order"
                  key={order.orderId || index}
                >
                  <div>
                    <strong>{order.orderId || "Order"}</strong>
                    <small>
                      {order.deliveryStatus ||
                        order.orderStatus ||
                        "Processing"}
                    </small>
                  </div>
                  <b>
                    ₹{Number(order.total || 0).toLocaleString("en-IN")}
                  </b>
                </div>
              ))}
            </div>
          )}

          <Link href="/my-orders" className="dashboard-text-link">
            View All Orders →
          </Link>
        </div>

        <div className="dashboard-panel">
          <span className="eyebrow">YOUR PROFILE</span>
          <h2>Profile Information</h2>

          <div className="dashboard-profile">
            <div>
              <small>Full Name</small>
              <strong>{profile.name || "Not added"}</strong>
            </div>
            <div>
              <small>Email Address</small>
              <strong>{profile.email || "Not added"}</strong>
            </div>
            <div>
              <small>Phone Number</small>
              <strong>{profile.phone || "Not added"}</strong>
            </div>
          </div>

          <Link href="/account" className="dashboard-text-link">
            Edit Profile →
          </Link>
        </div>
      </section>

      <footer className="footer dashboard-footer">
        <div className="footer-bottom">
          <p>© 2026 FastKart. All rights reserved.</p>
          <p>Designed with ❤️ for better shopping.</p>
        </div>
      </footer>
    </main>
  );
}

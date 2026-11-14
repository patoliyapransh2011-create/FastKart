
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: "▦" },
  { name: "Products", href: "/admin/products", icon: "□" },
  { name: "Orders", href: "/admin/orders", icon: "▤" },
  { name: "Customers", href: "/admin/customers", icon: "♙" },
  { name: "Categories", href: "/admin/categories", icon: "▧" },
  { name: "Inventory", href: "/admin/inventory", icon: "▣" },
  { name: "Coupons", href: "/admin/coupons", icon: "％" },
  { name: "Payments", href: "/admin/payments", icon: "₹" },
  { name: "Reports", href: "/admin/reports", icon: "▥" },
  { name: "Settings", href: "/admin/settings", icon: "⚙" },
  { name: "Cancelled Orders", href: "/admin/cancelled-orders", icon: "✕" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-logo">
          <span>F</span>
          <div>
            <strong>FastKart</strong>
            <small>ADMIN PANEL</small>
          </div>
        </Link>

        <div className="admin-menu-heading">MAIN MENU</div>

        <nav className="admin-navigation">
          {menuItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-menu-link ${
                  active ? "active" : ""
                }`}
              >
                <span className="admin-menu-icon">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-back-store">
            ← View Store
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <strong>Admin Dashboard</strong>
            <span>Manage your FastKart store</span>
          </div>

          <Link href="/admin/settings" className="admin-profile">
            <span className="admin-avatar">A</span>
            <span>Administrator</span>
          </Link>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

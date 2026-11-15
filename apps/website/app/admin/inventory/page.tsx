
"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
};

const STORAGE_KEY = "fastkart-admin-products";
const LOW_STOCK_LIMIT = 5;

const money = (amount: number) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        const normalized = saved.map((product: Product) => ({
          ...product,
          stock:
            typeof product.stock === "number"
              ? Math.max(0, product.stock)
              : 10,
        }));

        setProducts(normalized);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(normalized)
        );
      } catch (error) {
        console.error("Inventory loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    window.addEventListener("fastkart-products-updated", loadProducts);

    return () => {
      window.removeEventListener(
        "fastkart-products-updated",
        loadProducts
      );
    };
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("fastkart-products-updated"));
  };

  const updateStock = (id: string | number, value: string) => {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 0) {
      alert("Stock must be a whole number of 0 or more.");
      return;
    }

    const updated = products.map((product) =>
      String(product.id) === String(id)
        ? { ...product, stock: quantity }
        : product
    );

    saveProducts(updated);
  };

  const totalStock = products.reduce(
    (sum, product) => sum + (product.stock || 0),
    0
  );

  const lowStock = products.filter(
    (product) =>
      (product.stock || 0) > 0 &&
      (product.stock || 0) <= LOW_STOCK_LIMIT
  ).length;

  const outOfStock = products.filter(
    (product) => (product.stock || 0) === 0
  ).length;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const stock = product.stock || 0;

      const matchesFilter =
        filter === "All" ||
        (filter === "In Stock" && stock > LOW_STOCK_LIMIT) ||
        (filter === "Low Stock" &&
          stock > 0 &&
          stock <= LOW_STOCK_LIMIT) ||
        (filter === "Out of Stock" && stock === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <main className="inventory-page">
      <div className="inventory-heading">
        <div>
          <p className="inventory-eyebrow">STOCK MANAGEMENT</p>
          <h1>Inventory</h1>
          <p>Manage product quantities and stock availability.</p>
        </div>
      </div>

      <section className="inventory-stats">
        <div className="inventory-stat-card">
          <span>Total Products</span>
          <strong>{products.length}</strong>
          <small>Products in your store</small>
        </div>

        <div className="inventory-stat-card">
          <span>Total Stock</span>
          <strong>{totalStock.toLocaleString("en-IN")}</strong>
          <small>Total available units</small>
        </div>

        <div className="inventory-stat-card inventory-warning">
          <span>Low Stock</span>
          <strong>{lowStock}</strong>
          <small>5 units or fewer</small>
        </div>

        <div className="inventory-stat-card inventory-danger">
          <span>Out of Stock</span>
          <strong>{outOfStock}</strong>
          <small>Products unavailable</small>
        </div>
      </section>

      <section className="inventory-table-card">
        <div className="inventory-toolbar">
          <div>
            <h2>Product Stock</h2>
            <p>Update the available quantity of each product.</p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="inventory-search"
          />
        </div>

        <div className="inventory-filters">
          {["All", "In Stock", "Low Stock", "Out of Stock"].map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`inventory-filter ${
                  filter === item ? "active" : ""
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {loading ? (
          <div className="inventory-empty">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="inventory-empty">
            No products found.
          </div>
        ) : (
          <div className="inventory-table-wrap">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Available Stock</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock = product.stock || 0;

                  const status =
                    stock === 0
                      ? "Out of Stock"
                      : stock <= LOW_STOCK_LIMIT
                      ? "Low Stock"
                      : "In Stock";

                  return (
                    <tr key={String(product.id)}>
                      <td>
                        <div className="inventory-product">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="inventory-no-image">
                              📦
                            </div>
                          )}
                          <strong>{product.name}</strong>
                        </div>
                      </td>

                      <td>{product.category}</td>
                      <td>{money(product.price)}</td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={stock}
                          className="inventory-stock-input"
                          aria-label={`Stock for ${product.name}`}
                          onChange={(e) =>
                            updateStock(product.id, e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${
                            stock === 0
                              ? "status-out"
                              : stock <= LOW_STOCK_LIMIT
                              ? "status-low"
                              : "status-in"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

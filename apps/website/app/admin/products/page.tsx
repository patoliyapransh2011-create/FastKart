
"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  oldPrice?: number;
  rating?: number;
  tag?: string;
};

const STORAGE_KEY = "fastkart-admin-products";
const INIT_KEY = "fastkart-products-v2-initialized";

const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    oldPrice: 3499,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    tag: "BEST SELLER",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 1999,
    oldPrice: 2999,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    tag: "POPULAR",
  },
  {
    id: 3,
    name: "Premium Sneakers",
    category: "Fashion",
    price: 2999,
    oldPrice: 3999,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    tag: "NEW",
  },
  {
    id: 4,
    name: "Classic Backpack",
    category: "Accessories",
    price: 1499,
    oldPrice: 2199,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    tag: "SALE",
  },
  {
    id: 5,
    name: "Modern Sunglasses",
    category: "Accessories",
    price: 999,
    oldPrice: 1599,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    tag: "TRENDING",
  },
  {
    id: 6,
    name: "Running Shoes",
    category: "Fashion",
    price: 2299,
    oldPrice: 3299,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    tag: "POPULAR",
  },
  {
    id: 7,
    name: "Wireless Speaker",
    category: "Electronics",
    price: 1799,
    oldPrice: 2499,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
    tag: "NEW",
  },
  {
    id: 8,
    name: "Travel Backpack",
    category: "Accessories",
    price: 1899,
    oldPrice: 2699,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600",
    tag: "SALE",
  },
];

const money = (amount: number) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let initialProducts: Product[] = [];

      if (localStorage.getItem(INIT_KEY) !== "true") {
        const existing: Product[] = saved ? JSON.parse(saved) : [];

        // Default products + existing admin products.
        // Existing products with matching IDs override defaults.
        initialProducts = defaultProducts.map((item) => {
          const existingItem = existing.find(
            (savedItem) => String(savedItem.id) === String(item.id)
          );

          return existingItem ? { ...item, ...existingItem } : item;
        });

        const defaultIds = new Set(
          defaultProducts.map((item) => String(item.id))
        );

        initialProducts.push(
          ...existing.filter(
            (item) => !defaultIds.has(String(item.id))
          )
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
        localStorage.setItem(INIT_KEY, "true");
        window.dispatchEvent(new Event("fastkart-products-updated"));
      } else {
        initialProducts = saved ? JSON.parse(saved) : [];
      }

      setProducts(Array.isArray(initialProducts) ? initialProducts : []);

      const savedCategories = JSON.parse(
        localStorage.getItem("fastkart-admin-categories") || "[]"
      );

      const productCategories = initialProducts
        .map((item) => item.category)
        .filter(Boolean);

      const allCategories = [
        ...new Set([
          "Electronics",
          "Fashion",
          "Accessories",
          ...(Array.isArray(savedCategories) ? savedCategories : []),
          ...productCategories,
        ]),
      ];

      setCategories(allCategories);
      setCategory(allCategories[0] || "Electronics");
    } catch (error) {
      console.error("Products loading error:", error);
      setProducts([]);
    }

    setLoaded(true);
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(INIT_KEY, "true");
    window.dispatchEvent(new Event("fastkart-products-updated"));
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory(categories[0] || "Electronics");
    setDescription("");
    setImage("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleImage = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !price || Number(price) <= 0) {
      alert("Please enter a product name and valid price.");
      return;
    }

    const product: Product = {
      id: editingId ?? Date.now(),
      name: name.trim(),
      price: Number(price),
      category,
      description: description.trim(),
      image,
    };

    const updated =
      editingId !== null
        ? products.map((item) =>
            String(item.id) === String(editingId)
              ? { ...item, ...product }
              : item
          )
        : [...products, product];

    saveProducts(updated);
    resetForm();
  };

  const editProduct = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category || "Electronics");
    setDescription(product.description || "");
    setImage(product.image || "");
    setShowForm(true);
  };

  const deleteProduct = (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    saveProducts(
      products.filter((item) => String(item.id) !== String(id))
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        filter === "All" || product.category === filter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, filter]);

  const totalValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0),
    0
  );

  if (!loaded) {
    return <div className="products-page">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="products-heading">
        <div>
          <span className="products-eyebrow">INVENTORY MANAGEMENT</span>
          <h1>Products</h1>
          <p>Manage your store products and inventory.</p>
        </div>

        <button
          className="products-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Product
        </button>
      </div>

      <div className="products-stats">
        <div className="products-stat-card">
          <div className="products-stat-icon blue">▣</div>
          <div>
            <span>Total Products</span>
            <h2>{products.length}</h2>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon green">₹</div>
          <div>
            <span>Total Product Value</span>
            <h2>{money(totalValue)}</h2>
          </div>
        </div>

        <div className="products-stat-card">
          <div className="products-stat-icon purple">▦</div>
          <div>
            <span>Categories</span>
            <h2>{new Set(products.map((p) => p.category)).size}</h2>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="products-form-card">
          <div className="products-form-heading">
            <div>
              <h2>{editingId !== null ? "Edit Product" : "Add New Product"}</h2>
              <p>Enter the product details below.</p>
            </div>
            <button type="button" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="products-form-grid">
              <label>
                Product Name *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </label>

              <label>
                Price (₹) *
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </label>

              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <small>Add categories from the Categories page first.</small>
                )}
              </label>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                />
              </label>

              <label className="products-image-label">
                Product Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
              </label>

              {image && (
                <div className="products-image-preview">
                  <img src={image} alt="Product preview" />
                  <button type="button" onClick={() => setImage("")}>
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="products-form-actions">
              <button type="button" className="products-cancel-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="products-save-btn">
                {editingId !== null ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-table-card">
        <div className="products-table-heading">
          <div>
            <h2>All Products</h2>
            <p>{filteredProducts.length} products found</p>
          </div>

          <div className="products-toolbar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="products-name-cell">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="products-no-image">▣</div>
                        )}
                        <strong>{product.name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="products-category-badge">
                        {product.category}
                      </span>
                    </td>

                    <td className="products-price">{money(product.price)}</td>
                    <td className="products-description">
                      {product.description || "—"}
                    </td>

                    <td>
                      <div className="products-actions">
                        <button
                          className="products-edit-btn"
                          onClick={() => editProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="products-delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="products-empty">
                      <span>▣</span>
                      <h3>No products found</h3>
                      <p>Add a product or change your search.</p>
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

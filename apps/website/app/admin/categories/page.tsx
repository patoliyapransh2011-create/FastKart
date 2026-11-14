
"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string | number;
  name: string;
  category: string;
  price: number;
};

const PRODUCTS_KEY = "fastkart-admin-products";
const CATEGORIES_KEY = "fastkart-admin-categories";

const money = (amount: number) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [manualCategories, setManualCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data only after the component mounts.
  // This prevents server/client hydration mismatch.
  useEffect(() => {
    const loadData = () => {
      try {
        const savedProducts = localStorage.getItem(PRODUCTS_KEY);
        const parsedProducts = savedProducts
          ? JSON.parse(savedProducts)
          : [];

        setProducts(
          Array.isArray(parsedProducts) ? parsedProducts : []
        );

        const savedCategories = localStorage.getItem(CATEGORIES_KEY);
        const parsedCategories = savedCategories
          ? JSON.parse(savedCategories)
          : [];

        setManualCategories(
          Array.isArray(parsedCategories)
            ? parsedCategories.filter(
                (item): item is string => typeof item === "string"
              )
            : []
        );
      } catch {
        setProducts([]);
        setManualCategories([]);
      }

      setIsLoaded(true);
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("fastkart-products-updated", loadData);
    window.addEventListener("fastkart-categories-updated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("fastkart-products-updated", loadData);
      window.removeEventListener("fastkart-categories-updated", loadData);
    };
  }, []);

  // Count products in each category.
  const productCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    products.forEach((product) => {
      const name = product.category?.trim();

      if (name) {
        const existingKey = Array.from(categoryMap.keys()).find(
          (item) => item.toLowerCase() === name.toLowerCase()
        );

        const key = existingKey || name;

        categoryMap.set(key, (categoryMap.get(key) || 0) + 1);
      }
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products]);

  // Combine product categories and manually created categories.
  const allCategories = useMemo(() => {
    const combined = [...productCategories];

    manualCategories.forEach((name) => {
      const exists = combined.some(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      );

      if (!exists) {
        combined.push({
          name,
          count: 0,
        });
      }
    });

    return combined;
  }, [productCategories, manualCategories]);

  const visibleCategories = useMemo(() => {
    return allCategories.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allCategories, search]);

  // Add category.
  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) {
      setMessage("Please enter a category name.");
      return;
    }

    const alreadyExists = allCategories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      setMessage("This category already exists.");
      return;
    }

    const updated = [...manualCategories, name];

    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));

      setManualCategories(updated);
      setNewCategory("");
      setMessage("Category added successfully.");

      window.dispatchEvent(new Event("fastkart-categories-updated"));
    } catch {
      setMessage("Unable to save category. Please try again.");
    }
  };

  // Delete category.
  const deleteCategory = (name: string) => {
    const hasProducts = products.some(
      (product) =>
        product.category?.toLowerCase() === name.toLowerCase()
    );

    if (hasProducts) {
      setMessage(
        "This category has products. Move or remove them first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}" category?`
    );

    if (!confirmed) return;

    const updated = manualCategories.filter(
      (category) => category.toLowerCase() !== name.toLowerCase()
    );

    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));

      setManualCategories(updated);
      setMessage("Category deleted successfully.");

      window.dispatchEvent(new Event("fastkart-categories-updated"));
    } catch {
      setMessage("Unable to delete category. Please try again.");
    }
  };

  return (
    <div className="categories-page">
      {/* Heading */}
      <div className="categories-heading">
        <div>
          <span className="categories-eyebrow">
            PRODUCT MANAGEMENT
          </span>

          <h1>Categories</h1>

          <p>
            Organize and manage your product categories.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="categories-stats">
        <div className="categories-stat-card">
          <div className="categories-stat-icon blue">▦</div>

          <div>
            <span>Total Categories</span>
            <h2>
              {isLoaded ? allCategories.length : 0}
            </h2>
          </div>
        </div>

        <div className="categories-stat-card">
          <div className="categories-stat-icon green">▣</div>

          <div>
            <span>Total Products</span>
            <h2>
              {isLoaded ? products.length : 0}
            </h2>
          </div>
        </div>
      </div>

      <div className="categories-content">
        {/* Add Category */}
        <div className="categories-add-card">
          <h2>Add New Category</h2>

          <p>
            Create a category for organizing products.
          </p>

          <div className="categories-add-form">
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addCategory();
                }
              }}
            />

            <button onClick={addCategory}>
              + Add Category
            </button>
          </div>

          {message && (
            <p className="categories-message">
              {message}
            </p>
          )}
        </div>

        {/* Categories Table */}
        <div className="categories-table-card">
          <div className="categories-table-heading">
            <div>
              <h2>All Categories</h2>

              <p>
                {isLoaded ? visibleCategories.length : 0} categories found
              </p>
            </div>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="categories-table-wrap">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Total Products</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {!isLoaded ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="categories-empty">
                        <p>Loading categories...</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleCategories.length > 0 ? (
                  visibleCategories.map((category) => (
                    <tr key={category.name}>
                      <td>
                        <div className="category-name-cell">
                          <span className="category-icon">
                            ▦
                          </span>

                          <strong>{category.name}</strong>
                        </div>
                      </td>

                      <td>
                        {category.count} Products
                      </td>

                      <td>
                        <span className="category-active">
                          Active
                        </span>
                      </td>

                      <td>
                        <button
                          className="category-delete"
                          onClick={() => deleteCategory(category.name)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <div className="categories-empty">
                        <h3>No categories found</h3>

                        <p>
                          Add a category to get started.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

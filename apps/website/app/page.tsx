
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";

type StoreProduct = {
  id: string | number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  image: string;
  tag?: string;
  description?: string;
};

type StoreCategory = {
  name: string;
  icon: string;
  color: string;
};

const defaultProducts: StoreProduct[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    oldPrice: 3499,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    tag: "BEST SELLER",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 1999,
    oldPrice: 2999,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    tag: "POPULAR",
  },
  {
    id: 3,
    name: "Premium Sneakers",
    category: "Fashion",
    price: 2999,
    oldPrice: 3999,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    tag: "NEW",
  },
  {
    id: 4,
    name: "Classic Backpack",
    category: "Accessories",
    price: 1499,
    oldPrice: 2199,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    tag: "SALE",
  },
  {
    id: 5,
    name: "Modern Sunglasses",
    category: "Accessories",
    price: 999,
    oldPrice: 1599,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600",
    tag: "TRENDING",
  },
  {
    id: 6,
    name: "Running Shoes",
    category: "Fashion",
    price: 2299,
    oldPrice: 3299,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    tag: "POPULAR",
  },
  {
    id: 7,
    name: "Wireless Speaker",
    category: "Electronics",
    price: 1799,
    oldPrice: 2499,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
    tag: "NEW",
  },
  {
    id: 8,
    name: "Travel Backpack",
    category: "Accessories",
    price: 1899,
    oldPrice: 2699,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600",
    tag: "SALE",
  },
];

const defaultCategories: StoreCategory[] = [
  { name: "Electronics", icon: "🎧", color: "blue" },
  { name: "Fashion", icon: "👟", color: "pink" },
  { name: "Accessories", icon: "🎒", color: "purple" },
];

const money = (amount: number) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN");

function getCategoryList(
  savedCategories: string[],
  adminProducts: StoreProduct[]
): StoreCategory[] {
  const names = Array.from(
    new Set([
      ...defaultCategories.map((item) => item.name),
      ...savedCategories.filter(
        (item) => typeof item === "string" && item.trim()
      ),
      ...adminProducts.map((item) => item.category).filter(Boolean),
    ])
  );

  const colors = ["blue", "pink", "purple", "green"];
  const icons: Record<string, string> = {
    Electronics: "🎧",
    Fashion: "👟",
    Accessories: "🎒",
  };

  return [
    ...names.map((name, index) => ({
      name,
      icon: icons[name] || "🛍️",
      color:
        defaultCategories.find((item) => item.name === name)?.color ||
        colors[index % colors.length],
    })),
    { name: "All", icon: "🛍️", color: "green" },
  ];
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [storeProducts, setStoreProducts] =
    useState<StoreProduct[]>(defaultProducts);

  const [categories, setCategories] =
    useState<StoreCategory[]>([
      ...defaultCategories,
      { name: "All", icon: "🛍️", color: "green" },
    ]);

  const { cart, addToCart, cartCount } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Load and sync Admin Products and Categories
  useEffect(() => {
    const refreshStoreData = () => {
      try {
        const savedProducts = JSON.parse(
          localStorage.getItem("fastkart-admin-products") || "[]"
        );

        const savedCategories = JSON.parse(
          localStorage.getItem("fastkart-admin-categories") || "[]"
        );

        const adminProducts: StoreProduct[] = Array.isArray(savedProducts)
          ? savedProducts
              .filter(
                (item: any) =>
                  item &&
                  item.id !== undefined &&
                  item.name &&
                  Number.isFinite(Number(item.price))
              )
              .map((item: any) => ({
                id: item.id,
                name: String(item.name),
                category: String(item.category || "Other"),
                price: Number(item.price),
                image: String(item.image || ""),
                description: String(item.description || ""),
                tag: "NEW",
              }))
          : [];

        // Avoid duplicate IDs between default and admin products
        const defaultIds = new Set(
          defaultProducts.map((item) => String(item.id))
        );

        const uniqueAdminProducts = adminProducts.filter(
          (item) => !defaultIds.has(String(item.id))
        );

       setStoreProducts(
  Array.isArray(savedProducts)
    ? adminProducts
    : defaultProducts
);
        setCategories(
          getCategoryList(
            Array.isArray(savedCategories) ? savedCategories : [],
            uniqueAdminProducts
          )
        );
      } catch (error) {
        console.error("FastKart store sync error:", error);
      }
    };

    refreshStoreData();

    window.addEventListener(
      "fastkart-products-updated",
      refreshStoreData
    );

    window.addEventListener(
      "fastkart-categories-updated",
      refreshStoreData
    );

    window.addEventListener("storage", refreshStoreData);

    return () => {
      window.removeEventListener(
        "fastkart-products-updated",
        refreshStoreData
      );

      window.removeEventListener(
        "fastkart-categories-updated",
        refreshStoreData
      );

      window.removeEventListener("storage", refreshStoreData);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search, storeProducts]);

  return (
    <main className="store">
      {/* Announcement */}
      <div className="announcement">
        🎉 Free shipping on orders above ₹999
        <span> | </span>
        Discover amazing deals at FastKart
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo">
            <span className="logo-icon">F</span>
            Fast<span>Kart</span>
          </a>

          <form
            className="search-box"
            onSubmit={(e) => e.preventDefault()}
          >
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search for products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit">Search</button>
          </form>

          <div className="header-actions">
            <a href="/wishlist" className="header-link">
              <span>♡</span>
              <small>Wishlist</small>
            </a>

            <a href="/account" className="header-link">
              <span>♙</span>
              <small>Account</small>
            </a>

            <a href="/dashboard" className="header-link">
              👤 Dashboard
            </a>

            <a href="/settings" className="header-link">
              <span>⚙️</span>
              <small>Settings</small>
            </a>

            <a href="/my-orders" className="header-link">
              <span>📦</span>
              <small>My Orders</small>
            </a>

            <a href="/cart" className="header-link cart-link">
              <span>🛒</span>
              <small>Cart</small>
              <b className="cart-count">{cartCount}</b>
            </a>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>

        <nav className={`navigation ${mobileMenu ? "nav-open" : ""}`}>
          <div className="nav-inner">
            <a href="/" onClick={() => setMobileMenu(false)}>
              Home
            </a>

            <a href="#categories" onClick={() => setMobileMenu(false)}>
              Categories
            </a>

            <a href="#products" onClick={() => setMobileMenu(false)}>
              Shop
            </a>

            <a href="#deals" onClick={() => setMobileMenu(false)}>
              Today's Deals
            </a>

            <a href="#about" onClick={() => setMobileMenu(false)}>
              About Us
            </a>

            <a href="#contact" onClick={() => setMobileMenu(false)}>
              Contact
            </a>

            <a href="/my-orders" onClick={() => setMobileMenu(false)}>
              My Orders
            </a>

            <a href="/settings" onClick={() => setMobileMenu(false)}>
              ⚙️ Settings
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            WELCOME TO FASTKART
          </span>

          <h1>
            Shopping Made
            <span> Simple & Better.</span>
          </h1>

          <p>
            Discover amazing products, unbeatable prices
            and a shopping experience you will love.
          </p>

          <div className="hero-buttons">
            <a href="#products" className="primary-btn">
              Shop Now →
            </a>

            <a href="#categories" className="secondary-btn">
              Explore Categories
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>10K+</strong>
              <small>Happy Customers</small>
            </div>

            <div>
              <strong>5K+</strong>
              <small>Products</small>
            </div>

            <div>
              <strong>4.8★</strong>
              <small>Customer Rating</small>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1000"
            alt="Shopping products and gift boxes"
          />

          <div className="floating-card">
            <span>✨</span>

            <div>
              <strong>Special Offers</strong>
              <small>Up to 50% OFF</small>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <div className="benefit">
          <span>🚚</span>
          <div>
            <strong>Free Shipping</strong>
            <small>On orders above ₹999</small>
          </div>
        </div>

        <div className="benefit">
          <span>🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <small>Safe & secure checkout</small>
          </div>
        </div>

        <div className="benefit">
          <span>↩️</span>
          <div>
            <strong>Easy Returns</strong>
            <small>Simple return process</small>
          </div>
        </div>

        <div className="benefit">
          <span>🎧</span>
          <div>
            <strong>24/7 Support</strong>
            <small>We're here to help</small>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORE MORE</span>
            <h2>Shop By Category</h2>
            <p>Find exactly what you are looking for.</p>
          </div>
        </div>

        <div className="categories">
          {categories.map((item) => (
            <button
              key={item.name}
              className={`category-card ${item.color} ${
                category === item.name ? "category-active" : ""
              }`}
              onClick={() => {
                setCategory(item.name);

                document.getElementById("products")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <span>{item.icon}</span>

              <strong>
                {item.name === "All" ? "All Products" : item.name}
              </strong>

              <small>Explore Collection →</small>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="section products-section" id="products">
        <div className="section-heading product-heading">
          <div>
            <span className="eyebrow">OUR COLLECTION</span>
            <h2>Featured Products</h2>
            <p>Handpicked products just for you.</p>
          </div>

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item.name}
                className={category === item.name ? "filter-active" : ""}
                onClick={() => setCategory(item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "52px",
                      background: "#f1f5f9",
                    }}
                  >
                    📦
                  </div>
                )}

                <span className="product-tag">
                  {product.tag || "NEW"}
                </span>

                <button
                  className="wishlist-btn"
                  aria-label={`Add ${product.name} to wishlist`}
                  onClick={() => toggleWishlist(product)}
                >
                  {isWishlisted(product.id) ? "❤️" : "♡"}
                </button>
              </div>

              <div className="product-info">
                <small className="product-category">
                  {product.category}
                </small>

                <h3>{product.name}</h3>

                <div className="rating">
                  {product.rating ? (
                    <>
                      ⭐ {product.rating}
                      <span> (Customer rating)</span>
                    </>
                  ) : (
                    <span>✨ New Product</span>
                  )}
                </div>

                <div className="price-row">
                  <strong>{money(product.price)}</strong>

                  {product.oldPrice && product.oldPrice > product.price && (
                    <del>{money(product.oldPrice)}</del>
                  )}
                </div>

                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  {cart.some(
                    (item) => String(item.id) === String(product.id)
                  )
                    ? "Add Another +"
                    : "+ Add to Cart"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-products">
            <span>🔍</span>
            <h3>No products found</h3>
            <p>Try another search or category.</p>

            <button
              className="primary-btn"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Special Offer */}
      <section className="deal-banner" id="deals">
        <div>
          <span>LIMITED TIME OFFER</span>
          <h2>Upgrade Your Shopping Experience!</h2>
          <p>
            Discover exciting deals on your favourite products.
          </p>

          <a href="#products" className="deal-btn">
            Explore Deals →
          </a>
        </div>

        <div className="deal-emoji">🛍️</div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <span>STAY UPDATED</span>
        <h2>Get the Latest Offers</h2>
        <p>
          Subscribe to receive updates about new products and deals.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for subscribing!");
          }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            required
          />

          <button type="submit">Subscribe</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer" id="about">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo footer-logo">
              <span className="logo-icon">F</span>
              Fast<span>Kart</span>
            </a>

            <p>
              Your one-stop destination for quality products,
              amazing deals and a better shopping experience.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="#categories">Categories</a>
            <a href="#products">Products</a>
            <a href="#deals">Offers</a>
            <a href="/my-orders">My Orders</a>
          </div>

          <div>
            <h3>Customer Service</h3>
            <a href="#contact">Contact Us</a>
            <a href="#contact">Help Center</a>
            <a href="#contact">Shipping Policy</a>
            <a href="#contact">Return Policy</a>
          </div>

          <div id="contact">
            <h3>Contact</h3>
            <p>📧 support@fastkart.com</p>
            <p>📞 +91 00000 00000</p>
            <p>📍 India</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 FastKart. All rights reserved.</p>
          <p>Designed with ❤️ for better shopping.</p>
        </div>
      </footer>
    </main>
  );
}


"use client";

import Link from "next/link";
import { useWishlist } from "../wishlist-context";
import { useCart } from "../cart-context";
import "../wishlist/wishlist.css";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <div>
            <h1 className="wishlist-title">My Wishlist ❤️</h1>
            <p className="wishlist-subtitle">
              Your favourite products in one place.
            </p>
          </div>

          <Link href="/" className="wishlist-shop-btn">
            Continue Shopping →
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save your favourite products here and find them
              whenever you need.
            </p>

            <Link href="/" className="wishlist-explore-btn">
              Explore Products →
            </Link>
          </div>
        ) : (
          <>
            <p className="wishlist-count">
              {wishlist.length} saved product(s)
            </p>

            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div className="wishlist-card" key={product.id}>
                  <div className="wishlist-image">
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className="wishlist-details">
                    <p className="wishlist-category">
                      {product.category || "Product"}
                    </p>

                    <h2 className="wishlist-product-name">
                      {product.name}
                    </h2>

                    <p className="wishlist-price">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <div className="wishlist-actions">
                      <button
                        onClick={() => {
                          addToCart(product);
                          removeFromWishlist(product.id);
                        }}
                        className="wishlist-add-btn"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() =>
                          removeFromWishlist(product.id)
                        }
                        className="wishlist-remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

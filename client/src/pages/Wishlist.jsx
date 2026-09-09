import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
} from 'lucide-react';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart, wishlistCount } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleMoveToBag = (product) => {
    const id = product._id || product.slug;
    const chosenSize = selectedSizes[id] || (product.sizes && product.sizes[0]) || 'Standard';
    addToCart(product, chosenSize, 1);
    // Optionally remove from wishlist once moved to bag
    toggleWishlist(product);
  };

  return (
    <div className="shv-wishlist-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-wishlist-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Curated Wishlist</span>
        </div>

        {/* Hero Header */}
        <div className="shv-wishlist-header">
          <span className="shv-wishlist-eyebrow">Personal Silver Vault</span>
          <h1 className="shv-wishlist-title">My Curated 925 Silver Wishlist</h1>
          <p className="shv-wishlist-subtitle">
            Your private salon of hand-selected pieces, sculpted in pure 925 sterling silver and finished with platinum rhodium.
          </p>
          <div className="shv-wishlist-meta-strip">
            <span>✦ {wishlistCount} {wishlistCount === 1 ? 'Silhouette' : 'Silhouettes'} Saved</span>
            <span>•</span>
            <span>✦ Certified 925 BIS Hallmarked</span>
            <span>•</span>
            <span>✦ Complimentary Insured Delivery &gt; ₹999</span>
          </div>
        </div>

        {/* Content Body */}
        {wishlist.length === 0 ? (
          <div className="shv-wishlist-empty-card">
            <div className="shv-wishlist-empty-icon-wrap">
              <Heart size={42} />
            </div>
            <span className="shv-wishlist-empty-eyebrow">The Vault is Waiting</span>
            <h2>Your Personal Curation is Empty</h2>
            <p>
              Explore our treasury of sculpted silver bands, solitaires, liquid chains, and statement cuffs. Tap the heart emblem on any piece to preserve it here.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Explore 925 Silver Treasury <ArrowRight size={16} />
              </Link>
              <Link to="/shop?bestseller=true" className="btn btn-outline btn-lg">
                View Bestsellers
              </Link>
            </div>
          </div>
        ) : (
          <div className="shv-wishlist-grid">
            {wishlist.map((product) => {
              const prodId = product._id || product.slug;
              const currentSize =
                selectedSizes[prodId] || (product.sizes && product.sizes[0]) || 'Standard';
              const imageSrc =
                product.image ||
                (product.images && product.images[0]) ||
                '/hero-ring-banner.jpg';

              return (
                <div key={prodId} className="shv-wishlist-card">
                  {/* Image & Quick Remove */}
                  <div className="shv-wishlist-card-media">
                    <Link to={`/product/${product.slug || product._id}`}>
                      <img
                        src={imageSrc}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = '/hero-ring-banner.jpg';
                        }}
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="shv-wishlist-remove-btn"
                      title="Remove from wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="shv-wishlist-badge-wrap">
                      <span className="shv-hallmark-badge">925 BIS</span>
                      {product.badge && (
                        <span className="shv-custom-tag">{product.badge}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="shv-wishlist-card-body">
                    <span className="shv-wishlist-cat-label">
                      {product.category || 'Pure Silver'}
                    </span>
                    <h3 className="shv-wishlist-prod-title">
                      <Link to={`/product/${product.slug || product._id}`}>
                        {product.name}
                      </Link>
                    </h3>

                    {/* Pricing */}
                    <div className="shv-wishlist-price-row">
                      <span className="shv-wishlist-price">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="shv-wishlist-orig-price">
                            ₹{product.originalPrice}
                          </span>
                          <span className="shv-wishlist-save-badge">
                            Save{' '}
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100
                            )}
                            %
                          </span>
                        </>
                      )}
                    </div>

                    {/* Sizing dropdown if product has multiple sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="shv-wishlist-size-select-wrap">
                        <label>Select Size:</label>
                        <select
                          value={currentSize}
                          onChange={(e) => handleSizeChange(prodId, e.target.value)}
                        >
                          {product.sizes.map((sz, idx) => (
                            <option key={idx} value={sz}>
                              {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Action CTA */}
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="btn btn-primary shv-wishlist-add-btn"
                    >
                      <ShoppingBag size={15} />
                      <span>Move to Bag • ₹{product.price}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Trust Guarantee Strip */}
        <div className="shv-wishlist-trust-strip">
          <div className="shv-w-trust-col">
            <ShieldCheck size={20} className="shv-w-trust-icon" />
            <div>
              <strong>BIS 925 Hallmark Guaranteed</strong>
              <span>Certified precious metal purity stamp</span>
            </div>
          </div>
          <div className="shv-w-trust-col">
            <Truck size={20} className="shv-w-trust-icon" />
            <div>
              <strong>Complimentary Insured Air Shipping</strong>
              <span>Doorstep delivery across India over ₹999</span>
            </div>
          </div>
          <div className="shv-w-trust-col">
            <Sparkles size={20} className="shv-w-trust-icon" />
            <div>
              <strong>Anti-Tarnish Rhodium Polish</strong>
              <span>100% water, gym &amp; sweat resistant</span>
            </div>
          </div>
          <div className="shv-w-trust-col">
            <RotateCcw size={20} className="shv-w-trust-icon" />
            <div>
              <strong>30-Day Hassle-Free Returns</strong>
              <span>Doorstep pickup with instant refunds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;

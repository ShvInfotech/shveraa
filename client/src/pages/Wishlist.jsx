import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Check,
  CheckCircle2,
} from 'lucide-react';

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart, wishlistCount, showToast } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        const data = await fetchProducts({ bestseller: 'true' });
        setBestsellers(data?.slice(0, 4) || []);
      } catch (err) {
        console.error('Error fetching bestsellers for wishlist:', err);
      }
    };
    loadBestsellers();
  }, []);

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
    toggleWishlist(product);
    if (showToast) {
      showToast(`Moved "${product.name}" to your shopping bag!`);
    }
  };

  const handleMoveAllToBag = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((product) => {
      const id = product._id || product.slug;
      const chosenSize = selectedSizes[id] || (product.sizes && product.sizes[0]) || 'Standard';
      addToCart(product, chosenSize, 1);
    });
    // Remove all moved items from wishlist
    [...wishlist].forEach((p) => toggleWishlist(p));
    if (showToast) {
      showToast('All preserved silhouettes moved to your shopping bag!');
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear all preserved pieces from your wishlist?')) {
      [...wishlist].forEach((p) => toggleWishlist(p));
      if (showToast) {
        showToast('Wishlist cleared.');
      }
    }
  };

  return (
    <div className="shv-wishlist-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="shv-shop-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="shv-bc-sep">/</span>
          <span className="shv-bc-current">My Wishlist</span>
        </nav>

        {/* Hero Header */}
        <div className="shv-wishlist-header">
          <span className="shv-script-eyebrow">Personal Silver Vault</span>
          <h1 className="shv-wishlist-title">My Curated 925 Silver Wishlist</h1>
          <p className="shv-wishlist-subtitle">
            Your private sanctuary of saved fine jewellery, sculpted in pure 925 sterling silver with protective triple-rhodium shine.
          </p>

          <div className="shv-wishlist-meta-strip">
            <span className="shv-guarantee-pill">
              ✦ {wishlistCount} {wishlistCount === 1 ? 'Silhouette' : 'Silhouettes'} Preserved
            </span>
            <span className="shv-guarantee-divider" />
            <span className="shv-guarantee-pill">✦ BIS 925 Hallmarked</span>
            <span className="shv-guarantee-divider" />
            <span className="shv-guarantee-pill">✦ Insured Doorstep Delivery</span>
          </div>
        </div>

        {/* Content Body */}
        {wishlist.length === 0 ? (
          <div className="shv-wishlist-empty-card">
            <div className="shv-wishlist-empty-icon-wrap">
              <Heart size={44} strokeWidth={1.4} />
            </div>
            <span className="shv-script-eyebrow" style={{ fontSize: '1.2rem', color: '#A07E52' }}>
              The Vault is Waiting
            </span>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', marginTop: '4px', marginBottom: '8px', color: '#1A1612' }}>
              Your Personal Curation is Empty
            </h2>
            <p style={{ maxWidth: '520px', margin: '0 auto 1.75rem', color: '#72685C', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Preserve your favorite solid 925 sterling silver bands, solitaires, liquid chains, and statement cuffs by tapping the heart emblem on any piece.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                <span>Explore 925 Silver Treasury</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/shop?bestseller=true" className="btn btn-outline btn-lg">
                View Bestsellers
              </Link>
            </div>

            {/* Recommended Bestsellers */}
            {bestsellers.length > 0 && (
              <div style={{ marginTop: '4.5rem', textAlign: 'left', borderTop: '1px solid rgba(160, 126, 82, 0.2)', paddingTop: '2.5rem' }}>
                <span className="section-subtitle">Recommended for You</span>
                <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', marginBottom: '1.5rem', color: '#1A1612' }}>
                  Treasury Bestsellers to Spark Your Inspiration
                </h3>
                <div className="shv-shop-products-grid col-4">
                  {bestsellers.map((product) => (
                    <ProductCard key={product._id || product.slug} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Wishlist Actions Toolbar */}
            <div className="shv-wishlist-toolbar">
              <div className="shv-wishlist-toolbar-info">
                <span className="shv-wishlist-counter-badge">
                  <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'Design' : 'Designs'} in Vault
                </span>
                <span className="shv-wishlist-stock-status">
                  <CheckCircle2 size={14} color="#16A34A" />
                  <span>All items in stock &amp; ready to dispatch</span>
                </span>
              </div>

              <div className="shv-wishlist-toolbar-actions">
                <button
                  type="button"
                  onClick={handleMoveAllToBag}
                  className="btn btn-primary btn-sm shv-wishlist-bulk-btn"
                >
                  <ShoppingBag size={15} />
                  <span>Move All to Bag</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="shv-wishlist-clear-btn"
                >
                  <Trash2 size={14} />
                  <span>Clear Wishlist</span>
                </button>
              </div>
            </div>

            {/* 4-Column Responsive Grid matching Shop page */}
            <div className="shv-shop-products-grid col-4">
              {wishlist.map((product) => {
                const prodId = product._id || product.slug;
                const currentSize =
                  selectedSizes[prodId] || (product.sizes && product.sizes[0]) || 'Standard';
                const imageSrc =
                  product.image ||
                  (product.images && product.images[0]) ||
                  '/hero-ring-banner.jpg';
                const secondaryImg =
                  (product.images && product.images[1]) || imageSrc;

                return (
                  <div key={prodId} className="shv-wishlist-item-card">
                    {/* Card Media with Smooth Image Stack */}
                    <div className="product-image-container">
                      <Link
                        to={`/product/${product.slug || product._id}`}
                        className="product-image-link"
                      >
                        <div className="product-image-stack">
                          <img
                            src={imageSrc}
                            alt={product.name}
                            loading="lazy"
                            className="product-main-img product-img-primary"
                            onError={(e) => {
                              e.currentTarget.src = '/hero-ring-banner.jpg';
                            }}
                          />
                          {secondaryImg && secondaryImg !== imageSrc && (
                            <img
                              src={secondaryImg}
                              alt={`${product.name} Alternate`}
                              loading="lazy"
                              className="product-main-img product-img-secondary"
                            />
                          )}
                        </div>
                      </Link>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className="shv-wishlist-remove-btn"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* Hallmarks Badge Stack */}
                      <div className="product-badges-stack">
                        {product.badge && (
                          <span className="product-badge product-badge-silver">
                            {product.badge}
                          </span>
                        )}
                        <span className="product-hallmark-tag">925 BIS</span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="shv-wishlist-card-body">
                      <div>
                        <span className="shv-wishlist-cat-label">
                          {product.category || 'Solid 925 Silver'}
                        </span>
                        <h3 className="shv-wishlist-prod-title">
                          <Link to={`/product/${product.slug || product._id}`}>
                            {product.name}
                          </Link>
                        </h3>

                        {/* Pricing Row */}
                        <div className="shv-wishlist-price-row">
                          <span className="shv-wishlist-price">
                            ₹{product.price?.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="shv-wishlist-orig-price">
                                ₹{product.originalPrice?.toLocaleString('en-IN')}
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
                      </div>

                      {/* Size Selection Pills */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="shv-wishlist-size-picker">
                          <span className="shv-wishlist-size-label">Size:</span>
                          <div className="shv-wishlist-size-pills">
                            {product.sizes.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleSizeChange(prodId, sz)}
                                className={`shv-wishlist-size-chip ${
                                  currentSize === sz ? 'active' : ''
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Move to Bag Button */}
                      <button
                        type="button"
                        onClick={() => handleMoveToBag(product)}
                        className="btn btn-primary shv-wishlist-add-btn"
                      >
                        <ShoppingBag size={15} />
                        <span>Move to Bag • ₹{product.price?.toLocaleString('en-IN')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Trust Assurance Ribbon */}
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

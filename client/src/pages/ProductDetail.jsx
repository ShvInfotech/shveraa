import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Check,
  Award,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { fetchProductById, fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customEngraving, setCustomEngraving] = useState('');
  const [openSection, setOpenSection] = useState('description');

  const isWishlisted = product ? isInWishlist(product._id || product.slug) : false;

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setSelectedImageIndex(0);
        setQuantity(1);
        setCustomEngraving('');

        const data = await fetchProductById(id);
        if (data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }

          const related = await fetchProducts({ category: data.category });
          setRelatedProducts(related.filter((p) => (p._id || p.slug) !== (data._id || data.slug)).slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="section" style={{ minHeight: '60vh' }}>
        <div className="container">
          <Loader text="Revealing 925 silver craftsmanship..." />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div className="container">
          <h2>Product Not Found</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            The silver piece you are looking for is currently unavailable.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore 925 Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity, {
      customText: customEngraving.trim() || undefined,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity, {
      customText: customEngraving.trim() || undefined,
    });
  };

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? '' : sectionKey));
  };

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85'];

  return (
    <div className="section" style={{ paddingTop: '1.5rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748B',
              fontSize: '0.88rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to 925 Silver Collection
          </Link>
        </div>

        {/* Main Product Layout: Gallery + Sticky Info */}
        <div className="product-detail-layout">
          {/* Left: Image Gallery */}
          <div className="product-gallery">
            {/* Primary Main Image */}
            <div className="product-main-gallery-img">
              <img src={images[selectedImageIndex]} alt={product.name} />
              {product.badge && (
                <span className="product-badge product-badge-silver" style={{ top: '16px', left: '16px' }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`product-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Details */}
          <div className="product-info-column">
            {/* Category & Hallmark pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="product-category-tag">{product.category}</span>
              <span className="product-hallmark-pill">
                <ShieldCheck size={13} /> 925 BIS Hallmarked
              </span>
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            {/* Price Row */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="product-detail-orig-price">₹{product.originalPrice}</span>
                  <span className="product-detail-save-badge">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Ratings Summary */}
            {product.rating && (
              <div className="product-detail-rating-row">
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#18181B" color="#18181B" />
                  ))}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{product.rating}</span>
                <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  ({product.reviewsCount || 42} verified collector reviews)
                </span>
              </div>
            )}

            {/* Material & Finish Highlights */}
            <div className="product-spec-box">
              <div className="product-spec-item">
                <span className="product-spec-label">Metal:</span>
                <span className="product-spec-val">{product.material || 'Solid 925 Sterling Silver'}</span>
              </div>
              {product.finish && (
                <div className="product-spec-item">
                  <span className="product-spec-label">Finish:</span>
                  <span className="product-spec-val">{product.finish}</span>
                </div>
              )}
              {product.stone && (
                <div className="product-spec-item">
                  <span className="product-spec-label">Stone:</span>
                  <span className="product-spec-val">{product.stone}</span>
                </div>
              )}
            </div>

            {/* Custom Engraving Input if Personalised */}
            {(product.isPersonalised || product.category === 'personalised') && (
              <div className="product-engraving-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="product-engraving-label">
                    ✦ Custom Laser Inscription (Names or Initials)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {customEngraving.length} / 12 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  value={customEngraving}
                  onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                  placeholder="e.g. ARIA or S & V"
                  className="product-engraving-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Complimentary diamond-tipped precision laser engraving included.
                </span>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Select Size / Length
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', textDecoration: 'underline', cursor: 'pointer' }}>
                    Size Guide
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`product-size-pill ${selectedSize === size ? 'active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                Quantity
              </label>
              <div className="cart-qty-controller" style={{ width: '130px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <ShoppingBag size={18} />
                <span>Add to Bag</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`action-btn action-btn-lg ${isWishlisted ? 'wishlisted' : ''}`}
                aria-label="Save to Wishlist"
                style={{
                  width: '52px',
                  height: '52px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? '#E11D48' : 'none'}
                  color={isWishlisted ? '#E11D48' : '#18181B'}
                />
              </button>
            </div>

            {/* Trust Badges Strip (Emily's inspired) */}
            <div className="product-trust-card">
              <div className="product-trust-item">
                <ShieldCheck size={18} />
                <div>
                  <strong>Certified 925 Sterling Silver</strong>
                  <p>Certified pure silver with BIS hallmark guarantee.</p>
                </div>
              </div>

              <div className="product-trust-item">
                <Truck size={18} />
                <div>
                  <strong>Free Insured Express Delivery</strong>
                  <p>Delivered in 2-4 business days with tamper-proof seal.</p>
                </div>
              </div>

              <div className="product-trust-item">
                <RotateCcw size={18} />
                <div>
                  <strong>30-Day Hassle-Free Exchange</strong>
                  <p>Hassle-free returns &amp; doorstep pickup.</p>
                </div>
              </div>
            </div>

            {/* Collapsible Accordion Tabs */}
            <div className="product-accordions">
              {/* Description */}
              <div className="accordion-item">
                <button
                  type="button"
                  onClick={() => toggleSection('description')}
                  className="accordion-header"
                >
                  <span>Silhouette &amp; Atelier Notes</span>
                  {openSection === 'description' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'description' && (
                  <div className="accordion-body">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* 925 Silver Care Guide */}
              <div className="accordion-item">
                <button
                  type="button"
                  onClick={() => toggleSection('care')}
                  className="accordion-header"
                >
                  <span>925 Silver Care &amp; Longevity</span>
                  {openSection === 'care' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'care' && (
                  <div className="accordion-body">
                    <p>
                      Your Shveraa piece is crafted from solid 925 sterling silver with a protective micro-shield of mirror rhodium. It is completely safe to wear in the shower, pool, and gym.
                    </p>
                    <ul style={{ paddingLeft: '18px', marginTop: '8px', lineHeight: '1.7' }}>
                      <li>To refresh its brilliance, gently buff with the included microfiber polishing cloth.</li>
                      <li>Store in your Shveraa velvet pouch when not adorning your daily ritual.</li>
                      <li>Naturally hypoallergenic, lead-free, and nickel-free.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="accordion-item">
                <button
                  type="button"
                  onClick={() => toggleSection('shipping')}
                  className="accordion-header"
                >
                  <span>Complimentary Shipping &amp; Returns</span>
                  {openSection === 'shipping' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'shipping' && (
                  <div className="accordion-body">
                    <p>
                      Orders over ₹999 qualify for complimentary express insured shipping across India. Each piece arrives securely sealed in our signature luxury presentation gift box with certificate of authenticity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #E2E8F0' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <span className="section-subtitle">Complete The Layering</span>
              <h2 className="section-title">You May Also Adore</h2>
            </div>

            <div className="products-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id || rel.slug} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

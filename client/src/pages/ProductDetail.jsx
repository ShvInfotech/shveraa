import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
  Package,
  Clock,
  ThumbsUp,
  CheckCircle2,
  MessageSquare,
  Share2,
  X,
  Zap,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchProductById, fetchProducts } from '../services/api';
import { getProductColors } from '../services/storeService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const SEED_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Dr. Radhika Sen',
    city: 'Mumbai',
    rating: 5,
    date: 'Aug 24, 2026',
    verified: true,
    title: 'Heirloom quality that rivals fine white gold',
    comment:
      'The triple rhodium mirror finish is breathtaking. I have worn it continuously for three weeks, through monsoon humidity and daily hospital shifts, and there is zero discoloration. The BIS 925 laser hallmark stamp on the inside is crisp and sharp. The velvet presentation box made unboxing feel like a true luxury experience.',
    helpful: 24,
  },
  {
    id: 'rev-2',
    name: 'Ananya Deshmukh',
    city: 'Bengaluru',
    rating: 5,
    date: 'Aug 18, 2026',
    verified: true,
    title: 'Substantial hand-feel and liquid light reflection',
    comment:
      'You can immediately tell this is solid sterling silver from the substantial hand-feel. The micro-pavé stone setting catches afternoon light like brilliant diamonds. Arrived in Bengaluru in just 2 days flat via BlueDart Air Express with tamper-proof security seal.',
    helpful: 19,
  },
  {
    id: 'rev-3',
    name: 'Kavita Chawla',
    city: 'New Delhi',
    rating: 5,
    date: 'Aug 09, 2026',
    verified: true,
    title: 'Completely hypoallergenic on ultra-sensitive skin',
    comment:
      'I usually break out in hives with brass, copper, or lesser silver alloys. This piece has zero nickel and zero lead — it is completely hypoallergenic and so lightweight that I forget I am wearing it. Truly crafted for 24/7 skin kindness.',
    helpful: 15,
  },
  {
    id: 'rev-4',
    name: 'Pooja Varma',
    city: 'Jaipur',
    rating: 4,
    date: 'Jul 29, 2026',
    verified: true,
    title: 'Exceptional presentation, perfect anniversary gift',
    comment:
      'Gifted this piece for an anniversary and she was mesmerized. The signature velvet keepsake box, microfiber silver buffing cloth, and authenticity certificate card show unmatched attention to detail.',
    helpful: 8,
  },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customEngraving, setCustomEngraving] = useState('');
  const [openSection, setOpenSection] = useState('specs');

  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | '5' | '4' | 'verified'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewerCity, setNewReviewerCity] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState({});

  // Verify whether the logged in user has purchased this specific product
  const hasPurchasedProduct = React.useMemo(() => {
    if (!isAuthenticated || !user || !product) return false;
    try {
      const ordersStr = localStorage.getItem('shveraa_orders');
      let orders = ordersStr ? JSON.parse(ordersStr) : [];
      const lastOrderStr = localStorage.getItem('shveraa_last_order');
      if (lastOrderStr) {
        try {
          const lastOrder = JSON.parse(lastOrderStr);
          if (lastOrder && !orders.some((o) => o.orderId === lastOrder.orderId)) {
            orders = [lastOrder, ...orders];
          }
        } catch {}
      }

      if (!Array.isArray(orders) || orders.length === 0) return false;

      const userEmail = (user.email || '').trim().toLowerCase();
      const userName = (user.name || '').trim().toLowerCase();

      return orders.some((order) => {
        const orderEmail = (order.customer?.email || '').trim().toLowerCase();
        const orderName = (order.customer?.fullName || '').trim().toLowerCase();
        const isUserOrder = (orderEmail && orderEmail === userEmail) || (orderName && orderName === userName);
        if (!isUserOrder) return false;

        return order.items?.some((item) => {
          const itemId = String(item.id || item._id || '').toLowerCase();
          const itemSlug = String(item.slug || '').toLowerCase();
          const itemName = String(item.name || '').toLowerCase();

          const prodId = String(product._id || product.id || '').toLowerCase();
          const prodSlug = String(product.slug || '').toLowerCase();
          const prodName = String(product.name || '').toLowerCase();

          return (
            (prodId && (itemId === prodId || itemSlug === prodId)) ||
            (prodSlug && (itemSlug === prodSlug || itemId === prodSlug)) ||
            (prodName && itemName === prodName)
          );
        });
      });
    } catch {
      return false;
    }
  }, [isAuthenticated, user, product]);

  const isWishlisted = product ? isInWishlist(product._id || product.slug) : false;

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setSelectedImageIndex(0);
        setQuantity(1);
        setCustomEngraving('');
        setDeliveryResult(null);
        setPincodeError('');

        const data = await fetchProductById(id);
        if (data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }

          const colors = getProductColors(data);
          const queryColor = searchParams.get('color') || location.state?.selectedColor;
          const matched = colors.find(
            (c) =>
              c.name.toLowerCase() === queryColor?.toLowerCase() ||
              c.id.toLowerCase() === queryColor?.toLowerCase() ||
              c.shortName.toLowerCase() === queryColor?.toLowerCase()
          );
          setSelectedColor(matched ? matched.name : (colors[0]?.name || 'Pure 925 Silver'));

          // Fetch related pieces
          const allCatalog = await fetchProducts();
          const filteredRelated = allCatalog
            .filter((p) => (p._id || p.slug) !== (data._id || data.slug))
            .filter((p) => p.category === data.category || p.bestseller)
            .slice(0, 4);

          // If less than 4, pad with other products
          if (filteredRelated.length < 4) {
            const others = allCatalog
              .filter((p) => (p._id || p.slug) !== (data._id || data.slug))
              .filter((p) => !filteredRelated.some((r) => (r._id || r.slug) === (p._id || p.slug)))
              .slice(0, 4 - filteredRelated.length);
            setRelatedProducts([...filteredRelated, ...others]);
          } else {
            setRelatedProducts(filteredRelated);
          }

          // Load reviews from localStorage + seed
          const storageKey = `shveraa_product_reviews_${data._id || data.slug}`;
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setReviews([...parsed, ...SEED_REVIEWS]);
            } catch {
              setReviews(SEED_REVIEWS);
            }
          } else {
            setReviews(SEED_REVIEWS);
          }
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
      <div className="section" style={{ minHeight: '65vh' }}>
        <div className="container">
          <Loader text="Revealing solid 925 sterling silver craftsmanship..." />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section" style={{ minHeight: '65vh', textAlign: 'center' }}>
        <div className="container">
          <h2>Silhouette Not Found</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem', color: '#716960' }}>
            The fine silver piece you are looking for has been retired or is momentarily unavailable.
          </p>
          <Link to="/shop" className="btn btn-primary">
            Explore 925 Silver Collections
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85'];

  const availableColors = product ? getProductColors(product) : [];
  const selectedColorObj = availableColors.find((c) => c.name === selectedColor) || availableColors[0];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity, {
      color: selectedColor || selectedColorObj?.name || 'Pure 925 Silver',
      customText: customEngraving.trim() || undefined,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity, {
      color: selectedColor || selectedColorObj?.name || 'Pure 925 Silver',
      customText: customEngraving.trim() || undefined,
    });
    navigate('/checkout');
  };

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? '' : sectionKey));
  };

  // Pincode Delivery Check
  const handleCheckPincode = (e) => {
    e.preventDefault();
    setPincodeError('');
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeError('Please enter a valid 6-digit Indian PIN code.');
      setDeliveryResult(null);
      return;
    }

    const today = new Date();
    const estDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dayStr = estDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });

    setDeliveryResult({
      date: dayStr,
      pincode: pincode.trim(),
      carrier: 'BlueDart Air Express',
    });
  };

  // Reviews Filtering
  const filteredReviews = reviews.filter((rev) => {
    if (reviewFilter === '5') return rev.rating === 5;
    if (reviewFilter === '4') return rev.rating === 4;
    if (reviewFilter === 'verified') return rev.verified;
    return true;
  });

  // Calculate review stats
  const totalReviews = reviews.length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (totalReviews || 1)).toFixed(1);
  const fiveStarsCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarsCount = reviews.filter((r) => r.rating === 4).length;
  const threeStarsCount = reviews.filter((r) => r.rating === 3).length;

  const handleHelpfulVote = (revId) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [revId]: (prev[revId] || 0) + 1,
    }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated || !hasPurchasedProduct) {
      alert('Only verified collectors who have purchased this piece can submit a review.');
      return;
    }
    if (!newReviewerName.trim() || !newReviewTitle.trim() || !newReviewComment.trim()) {
      alert('Please fill in your name, review title, and detailed feedback.');
      return;
    }

    const createdReview = {
      id: `user-rev-${Date.now()}`,
      name: newReviewerName.trim() || user?.name || 'Verified Collector',
      city: newReviewerCity.trim() || 'Verified Collector',
      rating: newRating,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      verified: true,
      title: newReviewTitle.trim(),
      comment: newReviewComment.trim(),
      helpful: 1,
    };

    const updated = [createdReview, ...reviews];
    setReviews(updated);

    // Persist to localStorage
    const storageKey = `shveraa_product_reviews_${product._id || product.slug}`;
    const userOnly = updated.filter((r) => r.id.startsWith('user-rev-'));
    localStorage.setItem(storageKey, JSON.stringify(userOnly));

    // Reset Form
    setNewReviewerName('');
    setNewReviewerCity('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewRating(5);
    setIsReviewModalOpen(false);
  };

  return (
    <div className="section" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
      <div className="container">
        {/* 1. Breadcrumbs Bar */}
        <div className="shv-pdp-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="shv-pdp-sep">/</span>
          <Link to="/shop">Collections</Link>
          <span className="shv-pdp-sep">/</span>
          <Link to={`/shop?category=${product.category?.toLowerCase()}`} style={{ textTransform: 'capitalize' }}>
            {product.category || 'Silver Pieces'}
          </Link>
          <span className="shv-pdp-sep">/</span>
          <span className="active">{product.name}</span>
        </div>

        {/* 2. Main Product Layout: Image Gallery + Sticky Info Column */}
        <div className="product-detail-layout">
          {/* Left: Gallery */}
          <div className="product-gallery">
            <div className="product-main-gallery-img">
              <img src={images[selectedImageIndex]} alt={product.name} />
              {product.badge && (
                <span className="product-badge product-badge-silver" style={{ top: '16px', left: '16px' }}>
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`product-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Details */}
          <div className="product-info-column">
            {/* Hallmark & Purity Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span className="product-hallmark-pill">
                <ShieldCheck size={13} color="#A07E52" /> BIS 925 Hallmarked
              </span>
              <span className="product-hallmark-pill">
                <Sparkles size={13} color="#A07E52" /> Triple Rhodium Shield
              </span>
              <span className="product-hallmark-pill">
                <Award size={13} color="#A07E52" /> 100% Hypoallergenic
              </span>
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            {/* Price Row */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">₹{product.price?.toLocaleString('en-IN')}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="product-detail-orig-price">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  <span className="product-detail-save-badge">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Rating Summary Header */}
            <div className="product-detail-rating-row">
              <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#A07E52" color="#A07E52" />
                ))}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{avgRating} / 5.0</span>
              <a
                href="#reviews-hub"
                style={{ color: '#716960', fontSize: '0.85rem', textDecoration: 'underline', marginLeft: '4px' }}
              >
                ({totalReviews} collector reviews)
              </a>
            </div>

            {/* Short Atelier Lead */}
            <p style={{ color: '#4A443D', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {product.description ||
                'Sculpted from certified solid 925 sterling silver and finished with triple platinum-rhodium mirror polish for everyday tarnish immunity.'}
            </p>

            {/* Custom Engraving Input if Personalised */}
            {(product.isPersonalised || product.category === 'personalised') && (
              <div className="product-engraving-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="product-engraving-label">
                    ✦ Complimentary Diamond Laser Inscription
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#716960' }}>
                    {customEngraving.length} / 12 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={12}
                  value={customEngraving}
                  onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                  placeholder="e.g. AURA or M & R"
                  className="product-engraving-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#716960', marginTop: '4px', display: 'block' }}>
                  Precision diamond-tipped laser engraving included without extra delay.
                </span>
              </div>
            )}

            {/* Metal Finish / Color Variation Selector */}
            {availableColors.length > 0 && (
              <div className="product-detail-color-section">
                <div className="product-detail-color-header">
                  <div className="product-detail-color-label-wrap">
                    <span className="product-option-title">Metal &amp; Color Finish:</span>
                    <span className="product-active-color-name">
                      {selectedColorObj?.name || selectedColor}
                    </span>
                  </div>
                  {selectedColorObj?.badge && (
                    <span className="product-color-purity-badge">
                      ✦ {selectedColorObj.badge}
                    </span>
                  )}
                </div>

                <div className="product-detail-color-swatches">
                  {availableColors.map((color) => {
                    const isSelected = (selectedColorObj?.name === color.name) || (selectedColor === color.name);
                    return (
                      <button
                        key={color.id || color.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.name);
                          setSearchParams(
                            (prev) => {
                              const next = new URLSearchParams(prev);
                              next.set('color', color.name);
                              return next;
                            },
                            { replace: true }
                          );
                        }}
                        className={`product-color-pill-btn ${isSelected ? 'active' : ''}`}
                        title={`${color.name} • ${color.purity || 'Solid 925'}`}
                        aria-label={`Select ${color.name}`}
                      >
                        <span
                          className="product-color-dot-lg"
                          style={{
                            background: color.gradient || color.hex,
                            borderColor: color.border || '#CBD5E1',
                          }}
                        >
                          {isSelected && <Check size={11} className="product-color-check-icon" strokeWidth={3} />}
                        </span>
                        <span className="product-color-pill-name">{color.shortName || color.name}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedColorObj?.description && (
                  <p className="product-color-desc-hint">
                    {selectedColorObj.description}
                  </p>
                )}
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Select Size / Length
                  </label>
                  <Link to="/size-guide" style={{ fontSize: '0.78rem', color: '#A07E52', textDecoration: 'underline' }}>
                    Ring &amp; Wrist Size Guide
                  </Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'gap', gap: '8px' }}>
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

            {/* Quantity Controller */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
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

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
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
                onClick={handleBuyNow}
                className="btn btn-outline btn-lg"
                style={{
                  background: '#FAF8F5',
                  borderColor: '#1A1612',
                  color: '#1A1612',
                  fontWeight: 600,
                  padding: '0 20px',
                }}
              >
                <Zap size={16} fill="currentColor" />
                <span>Buy Now</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`action-btn action-btn-lg ${isWishlisted ? 'wishlisted' : ''}`}
                aria-label="Save to Wishlist"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? '#E11D48' : 'none'}
                  color={isWishlisted ? '#E11D48' : '#1A1612'}
                />
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="shv-pdp-delivery-box">
              <div className="shv-pdp-delivery-header">
                <Truck size={17} color="#A07E52" />
                <span>Check Estimated Doorstep Air Delivery</span>
              </div>
              <form onSubmit={handleCheckPincode} className="shv-pdp-pincode-form">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="shv-pdp-pincode-input"
                />
                <button type="submit" className="shv-pdp-pincode-btn">
                  Check
                </button>
              </form>
              {pincodeError && (
                <span style={{ color: '#E11D48', fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
                  {pincodeError}
                </span>
              )}
              {deliveryResult && (
                <div className="shv-pdp-delivery-result">
                  <CheckCircle2 size={16} />
                  <span>
                    Express Air Delivery to <strong>{deliveryResult.pincode}</strong> by{' '}
                    <strong>{deliveryResult.date}</strong> via BlueDart. Cash on Delivery available.
                  </span>
                </div>
              )}
            </div>

            {/* Trust Assurance Strip */}
            <div className="product-trust-card">
              <div className="product-trust-item">
                <ShieldCheck size={18} color="#A07E52" />
                <div>
                  <strong>Certified Pure 925 Sterling Silver</strong>
                  <p>Hallmarked with BIS standard laser certification stamp.</p>
                </div>
              </div>

              <div className="product-trust-item">
                <Truck size={18} color="#A07E52" />
                <div>
                  <strong>Free Insured Express Air Delivery</strong>
                  <p>Complimentary express shipping on all orders over ₹999.</p>
                </div>
              </div>

              <div className="product-trust-item">
                <RotateCcw size={18} color="#A07E52" />
                <div>
                  <strong>30-Day Hassle-Free Returns &amp; Exchanges</strong>
                  <p>Doorstep collection with 100% money-back guarantee.</p>
                </div>
              </div>
            </div>

            {/* Detailed Specifications & Inclusions Cards */}
            <div className="product-accordions">
              {/* Detailed Specs Tab */}
              <div className="accordion-item">
                <button
                  type="button"
                  onClick={() => toggleSection('specs')}
                  className="accordion-header"
                >
                  <span>Atelier Specifications &amp; Material Purity</span>
                  {openSection === 'specs' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'specs' && (
                  <div className="accordion-body">
                    <div className="shv-pdp-specs-grid">
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Precious Metal</span>
                        <span className="shv-pdp-spec-value">{product.metalType || product.material || 'Solid 925 Sterling Silver'}</span>
                      </div>
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Protective Plating</span>
                        <span className="shv-pdp-spec-value">{product.finish || 'Triple Rhodium Mirror Luster'}</span>
                      </div>
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Hallmark Stamp</span>
                        <span className="shv-pdp-spec-value">{product.metalPurity || 'BIS 925 Laser Inscription'}</span>
                      </div>
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Stone / Gem</span>
                        <span className="shv-pdp-spec-value">{product.stone || '5A Brilliant Cubic Zirconia'}</span>
                      </div>
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Gem Carat &amp; Cut</span>
                        <span className="shv-pdp-spec-value">{product.stoneCarat || 'VVS1 Brilliant Cut'}</span>
                      </div>
                      <div className="shv-pdp-spec-card">
                        <span className="shv-pdp-spec-title">Approx. Net Weight</span>
                        <span className="shv-pdp-spec-value">{product.metalWeight || '~4.85g Solid Silver'}</span>
                      </div>
                    </div>

                    {/* What's inside the box */}
                    <div className="shv-pdp-inclusions-card">
                      <div className="shv-pdp-inclusions-title">
                        <Package size={16} color="#A07E52" />
                        <span>What's Inside Your Milestone Unboxing</span>
                      </div>
                      <div className="shv-pdp-inclusions-list">
                        <div className="shv-pdp-inclusion-item">
                          <Check size={14} color="#059669" /> Shveraa Velvet Presentation Box
                        </div>
                        <div className="shv-pdp-inclusion-item">
                          <Check size={14} color="#059669" /> Microfiber Silver Polishing Cloth
                        </div>
                        <div className="shv-pdp-inclusion-item">
                          <Check size={14} color="#059669" /> Soft Satin Keepsake Pouch
                        </div>
                        <div className="shv-pdp-inclusion-item">
                          <Check size={14} color="#059669" /> BIS 925 Authenticity Certificate
                        </div>
                      </div>
                    </div>
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
                  <span>925 Silver Care &amp; Longevity Routine</span>
                  {openSection === 'care' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'care' && (
                  <div className="accordion-body">
                    <p>
                      Your Shveraa piece is crafted from genuine solid 925 sterling silver, fortified with an invisible
                      triple-plated shield of precious rhodium. It is naturally tarnish-resistant and designed for daily wear.
                    </p>
                    <ul style={{ paddingLeft: '18px', marginTop: '8px', lineHeight: '1.7' }}>
                      <li>To restore its mirror fire, gently buff with the included microfiber polishing cloth.</li>
                      <li>Safe for everyday showering, hand washing, and light perfumes.</li>
                      <li>Store in your Shveraa velvet pouch when not adorning your daily ritual.</li>
                      <li>Zero base metal alloys — guaranteed safe for ultra-sensitive skin.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Complimentary Shipping & Returns */}
              <div className="accordion-item">
                <button
                  type="button"
                  onClick={() => toggleSection('shipping')}
                  className="accordion-header"
                >
                  <span>Complimentary Insured Shipping &amp; 30-Day Returns</span>
                  {openSection === 'shipping' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === 'shipping' && (
                  <div className="accordion-body">
                    <p>
                      All orders above ₹999 qualify for complimentary insured Air Express shipping via BlueDart across India.
                      Each parcel travels in a tamper-evident security docket.
                    </p>
                    <p style={{ marginTop: '8px' }}>
                      Should you require a size adjustment or return, our concierge arranges doorstep pickup within 30 days
                      with immediate exchange or full refund.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Customer Reviews Hub */}
        <section id="reviews-hub" className="shv-pdp-reviews-section">
          {/* Reviews Header */}
          <div className="shv-reviews-header-wrap">
            <div>
              <span className="section-subtitle">Verified Collector Experiences</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}>
                Customer Reviews &amp; Testimonials
              </h2>
            </div>
            {isAuthenticated && hasPurchasedProduct && (
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="shv-write-review-btn"
              >
                <MessageSquare size={16} />
                <span>Write a Review</span>
              </button>
            )}
          </div>

          {/* Ratings Summary Card */}
          <div className="shv-reviews-summary-card">
            {/* Col 1: Big Score */}
            <div className="shv-rating-big-col">
              <div className="shv-rating-big-num">{avgRating}</div>
              <div className="shv-rating-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#A07E52" color="#A07E52" />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#716960' }}>
                Based on {totalReviews} collector reviews
              </span>
              <span className="shv-rating-recom-badge">✦ 98% of buyers recommend</span>
            </div>

            {/* Col 2: Star Distribution Bars */}
            <div className="shv-breakdown-col">
              <div className="shv-breakdown-row">
                <span className="shv-breakdown-label">5 Stars</span>
                <div className="shv-breakdown-bar-wrap">
                  <div
                    className="shv-breakdown-bar-fill"
                    style={{ width: `${(fiveStarsCount / (totalReviews || 1)) * 100}%` }}
                  />
                </div>
                <span className="shv-breakdown-count">{fiveStarsCount}</span>
              </div>

              <div className="shv-breakdown-row">
                <span className="shv-breakdown-label">4 Stars</span>
                <div className="shv-breakdown-bar-wrap">
                  <div
                    className="shv-breakdown-bar-fill"
                    style={{ width: `${(fourStarsCount / (totalReviews || 1)) * 100}%` }}
                  />
                </div>
                <span className="shv-breakdown-count">{fourStarsCount}</span>
              </div>

              <div className="shv-breakdown-row">
                <span className="shv-breakdown-label">3 Stars</span>
                <div className="shv-breakdown-bar-wrap">
                  <div
                    className="shv-breakdown-bar-fill"
                    style={{ width: `${(threeStarsCount / (totalReviews || 1)) * 100}%` }}
                  />
                </div>
                <span className="shv-breakdown-count">{threeStarsCount}</span>
              </div>

              <div className="shv-breakdown-row">
                <span className="shv-breakdown-label">2 Stars</span>
                <div className="shv-breakdown-bar-wrap">
                  <div className="shv-breakdown-bar-fill" style={{ width: '0%' }} />
                </div>
                <span className="shv-breakdown-count">0</span>
              </div>

              <div className="shv-breakdown-row">
                <span className="shv-breakdown-label">1 Star</span>
                <div className="shv-breakdown-bar-wrap">
                  <div className="shv-breakdown-bar-fill" style={{ width: '0%' }} />
                </div>
                <span className="shv-breakdown-count">0</span>
              </div>
            </div>

            {/* Col 3: Sentiment Meters */}
            <div className="shv-sentiment-col">
              <div className="shv-sentiment-item">
                <span className="shv-sentiment-name">Tarnish Resistance</span>
                <span className="shv-sentiment-score">100%</span>
              </div>
              <div className="shv-sentiment-item">
                <span className="shv-sentiment-name">Mirror Luster Fire</span>
                <span className="shv-sentiment-score">99%</span>
              </div>
              <div className="shv-sentiment-item">
                <span className="shv-sentiment-name">Skin Kindness &amp; Comfort</span>
                <span className="shv-sentiment-score">100%</span>
              </div>
              <div className="shv-sentiment-item">
                <span className="shv-sentiment-name">Gift Packaging Feel</span>
                <span className="shv-sentiment-score">98%</span>
              </div>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="shv-reviews-filters-bar">
            <div className="shv-review-filter-pills">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`shv-review-filter-pill ${reviewFilter === 'all' ? 'active' : ''}`}
              >
                All Reviews ({totalReviews})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('5')}
                className={`shv-review-filter-pill ${reviewFilter === '5' ? 'active' : ''}`}
              >
                5 Stars ({fiveStarsCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('4')}
                className={`shv-review-filter-pill ${reviewFilter === '4' ? 'active' : ''}`}
              >
                4 Stars ({fourStarsCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('verified')}
                className={`shv-review-filter-pill ${reviewFilter === 'verified' ? 'active' : ''}`}
              >
                Verified Purchases Only
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="shv-reviews-list">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="shv-review-card">
                <div className="shv-review-card-top">
                  <div className="shv-reviewer-info">
                    <div className="shv-reviewer-avatar">
                      {rev.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="shv-reviewer-name">
                        <span>{rev.name}</span>
                        {rev.verified && (
                          <span className="shv-verified-badge">
                            <CheckCircle2 size={11} /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="shv-reviewer-meta">{rev.city}</div>
                    </div>
                  </div>
                  <span className="shv-review-date">{rev.date}</span>
                </div>

                <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      fill={idx < rev.rating ? '#A07E52' : '#E2E8F0'}
                      color={idx < rev.rating ? '#A07E52' : '#E2E8F0'}
                    />
                  ))}
                </div>

                <h3 className="shv-review-title">{rev.title}</h3>
                <p className="shv-review-text">{rev.comment}</p>

                <div className="shv-review-actions">
                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(rev.id)}
                    className={`shv-helpful-btn ${helpfulVotes[rev.id] ? 'voted' : ''}`}
                  >
                    <ThumbsUp size={13} />
                    <span>
                      Helpful ({rev.helpful + (helpfulVotes[rev.id] || 0)})
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Curated Pairings & Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '5rem', paddingTop: '3.5rem', borderTop: '1px solid rgba(160, 126, 82, 0.2)' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
              <span className="section-subtitle">Complete The Layering</span>
              <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}>
                You May Also Adore
              </h2>
              <p style={{ color: '#716960', fontSize: '0.92rem', marginTop: '6px' }}>
                Handpicked 925 sterling silver silhouettes sculpted to complement your chosen piece.
              </p>
            </div>

            <div className="shv-shop-products-grid col-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id || rel.slug} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Mobile Sticky Bottom Action Bar */}
      <div className="shv-mobile-sticky-bar">
        <div className="shv-mobile-sticky-info">
          <img src={images[0]} alt={product.name} className="shv-mobile-sticky-img" />
          <div className="shv-mobile-sticky-text">
            <div className="shv-mobile-sticky-title">{product.name}</div>
            <div className="shv-mobile-sticky-price">₹{product.price?.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="btn btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
        >
          <ShoppingBag size={16} />
          <span>Add to Bag</span>
        </button>
      </div>

      {/* 6. Write a Review Modal */}
      {isReviewModalOpen && (
        <div className="shv-modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div className="shv-review-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="shv-modal-close-btn"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px', color: '#1A1612' }}>
              Write an Atelier Review
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#716960', marginBottom: '16px' }}>
              Share your personal experience with the <strong>{product.name}</strong>.
            </p>

            <form onSubmit={handleSubmitReview}>
              {/* Star Picker */}
              <div>
                <span className="shv-form-label">Your Rating</span>
                <div className="shv-star-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="shv-star-pick-btn"
                    >
                      <Star
                        size={26}
                        fill={star <= newRating ? '#A07E52' : 'none'}
                        color={star <= newRating ? '#A07E52' : '#D1C7BA'}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px', alignSelf: 'center', color: '#A07E52' }}>
                    {newRating === 5 ? '5.0 — Exceptional' : `${newRating}.0 Stars`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="shv-form-group">
                  <label className="shv-form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="shv-form-input"
                  />
                </div>
                <div className="shv-form-group">
                  <label className="shv-form-label">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    value={newReviewerCity}
                    onChange={(e) => setNewReviewerCity(e.target.value)}
                    className="shv-form-input"
                  />
                </div>
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure silver brilliance, incredible luster!"
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Detailed Review</label>
                <textarea
                  required
                  placeholder="Tell other collectors about the hand-feel, purity stamp, tarnish resistance, or unboxing..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  className="shv-form-textarea"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px', padding: '12px' }}
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  X,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Gift,
  LayoutGrid,
  Grid3X3,
  Check,
  ChevronDown,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { ALL_CATEGORIES, fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORY_EDITORIAL = {
  all: {
    title: 'The Pure 925 Silver Treasury',
    subtitle:
      'Hand-sculpted in Jaipur with certified 92.5% silver purity. Triple-dipped in mirror rhodium for water-resistant radiance that defies time.',
    eyebrow: 'Artisan Silversmithing Jaipur • 92.5% Purity',
  },
  rings: {
    title: 'Sculpted Silver Bands & Solitaires',
    subtitle:
      'From fluid molten wave bands to architectural moissanite solitaires, cast for everyday tactile weight and timeless grace.',
    eyebrow: 'Heirloom Hand Finishes',
  },
  necklaces: {
    title: 'Liquid Chains & Luminous Pendants',
    subtitle:
      'Italian-engineered herringbone ribbons, paperclip links, and medallion talismans that reflect light with every gesture.',
    eyebrow: 'Platinum-Luster Chains',
  },
  earrings: {
    title: 'Architectural Hoops & Sculptural Drops',
    subtitle:
      'Featherweight hollow teardrops and micro-pavé huggies designed for all-day comfort with hypoallergenic security.',
    eyebrow: 'Featherweight Atelier Grace',
  },
  bracelets: {
    title: 'Fluid Cuffs & Bezel Tennis Silhouettes',
    subtitle:
      'Contoured open wrists and flawless bezel-articulated links finished with hand-burnished 925 hallmarks.',
    eyebrow: 'Molten Silver Silhouettes',
  },
  personalised: {
    title: 'Laser-Carved Bespoke Heirlooms',
    subtitle:
      'Custom nameplates, initial signets, and cherished dates laser-cut into heavy 925 silver for personal keepsakes.',
    eyebrow: 'Custom Atelier Craft',
  },
  anklets: {
    title: 'Waterproof Chains & Faceted Beads',
    subtitle:
      'Beach-safe, shower-safe silver chains featuring satellite beads and facet drops for effortless summer shimmer.',
    eyebrow: 'Ocean-Ready Durability',
  },
  wishlist: {
    title: 'Your Saved Atelier Creations',
    subtitle:
      'Pieces you have bookmarked for your personal collection or upcoming milestone celebrations.',
    eyebrow: 'Curated by You',
  },
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(4); // 4 or 3 columns on desktop
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { wishlist } = useCart();

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';
  const bestsellerOnly = searchParams.get('bestseller') === 'true';
  const wishlistOnly = searchParams.get('wishlist') === 'true';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedSort !== 'featured') params.sort = selectedSort;
        if (searchQuery) params.search = searchQuery;
        if (bestsellerOnly) params.bestseller = 'true';
        if (maxPriceParam) params.maxPrice = maxPriceParam;

        const data = await fetchProducts(params);

        if (wishlistOnly) {
          const wishlistIds = new Set(wishlist.map((w) => w._id || w.slug));
          setProducts(data.filter((p) => wishlistIds.has(p._id || p.slug)));
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, selectedSort, searchQuery, bestsellerOnly, wishlistOnly, maxPriceParam, wishlist]);

  const updateFilter = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'all' && val !== 'featured') {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setFilterDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const editorial = wishlistOnly
    ? CATEGORY_EDITORIAL.wishlist
    : CATEGORY_EDITORIAL[selectedCategory] || CATEGORY_EDITORIAL.all;

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (bestsellerOnly ? 1 : 0) +
    (wishlistOnly ? 1 : 0) +
    (maxPriceParam ? 1 : 0);

  return (
    <div className="shv-shop-page">
      {/* 1. Shop Editorial Hero Header Banner */}
      <section className="shv-shop-hero-banner">
        <div className="container">
          <nav className="shv-shop-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="shv-bc-sep">/</span>
            <Link to="/shop" onClick={clearAllFilters}>
              Collections
            </Link>
            <span className="shv-bc-sep">/</span>
            <span className="shv-bc-current">
              {wishlistOnly
                ? 'Saved Wishlist'
                : selectedCategory === 'all'
                ? 'All 925 Silver'
                : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </span>
          </nav>

          <div className="shv-shop-banner-content">
            <span className="shv-script-eyebrow">{editorial.eyebrow}</span>
            <h1 className="shv-shop-title">{editorial.title}</h1>
            <p className="shv-shop-subtitle">{editorial.subtitle}</p>

            {/* Hallmark Assurance Strip */}
            <div className="shv-shop-guarantee-bar">
              <span className="shv-guarantee-pill">
                <span className="shv-guarantee-star">✦</span> BIS 925 Hallmarked
              </span>
              <span className="shv-guarantee-divider" />
              <span className="shv-guarantee-pill">
                <span className="shv-guarantee-star">✦</span> Triple-Dipped Rhodium Shield
              </span>
              <span className="shv-guarantee-divider" />
              <span className="shv-guarantee-pill">
                <span className="shv-guarantee-star">✦</span> 100% Skin Friendly
              </span>
              <span className="shv-guarantee-divider" />
              <span className="shv-guarantee-pill">
                <span className="shv-guarantee-star">✦</span> Insured Delivery &gt; ₹999
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Luxury Category Navigation Pill Carousel */}
      <div className="shv-shop-cat-nav-wrap">
        <div className="container">
          <div className="shv-shop-cat-nav">
            <button
              type="button"
              onClick={() => updateFilter('category', 'all')}
              className={`shv-shop-cat-pill ${selectedCategory === 'all' && !wishlistOnly ? 'active' : ''}`}
            >
              <span>All 925 Silver</span>
            </button>

            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateFilter('category', cat.slug)}
                className={`shv-shop-cat-pill ${selectedCategory === cat.slug && !wishlistOnly ? 'active' : ''}`}
              >
                <span>{cat.name}</span>
                {cat.itemCount && (
                  <span className="shv-cat-pill-count">
                    {cat.itemCount.replace(' designs', '')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container shv-shop-main-container">
        {/* 3. Modern Interactive Toolbar */}
        <div className="shv-shop-toolbar">
          {/* Left: Result Counter & Desktop Grid Switcher */}
          <div className="shv-toolbar-left">
            <span className="shv-shop-count">
              Showing <strong>{products.length}</strong> certified silver pieces
            </span>

            {/* Desktop Grid Switcher (3-Col Editorial vs 4-Col Compact) */}
            <div className="shv-view-switchers" aria-label="Layout Grid Options">
              <button
                type="button"
                className={`shv-view-btn ${gridCols === 4 ? 'active' : ''}`}
                onClick={() => setGridCols(4)}
                title="4-Column Grid View"
                aria-label="4-Column Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`shv-view-btn ${gridCols === 3 ? 'active' : ''}`}
                onClick={() => setGridCols(3)}
                title="3-Column Editorial View"
                aria-label="3-Column Editorial View"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>

          {/* Center: Quick Filter Pills */}
          <div className="shv-quick-filters">
            <button
              type="button"
              className={`shv-quick-chip ${bestsellerOnly ? 'active' : ''}`}
              onClick={() => updateFilter('bestseller', bestsellerOnly ? '' : 'true')}
            >
              <Sparkles size={12} />
              <span>Bestsellers</span>
            </button>

            <button
              type="button"
              className={`shv-quick-chip ${maxPriceParam === '2000' ? 'active' : ''}`}
              onClick={() => updateFilter('maxPrice', maxPriceParam === '2000' ? '' : '2000')}
            >
              <span>Under ₹2,000</span>
            </button>

            <button
              type="button"
              className={`shv-quick-chip ${maxPriceParam === '3000' ? 'active' : ''}`}
              onClick={() => updateFilter('maxPrice', maxPriceParam === '3000' ? '' : '3000')}
            >
              <span>Under ₹3,000</span>
            </button>
          </div>

          {/* Right: Filter Drawer Trigger & Custom Sort Select */}
          <div className="shv-toolbar-right">
            <button
              type="button"
              className="shv-filter-drawer-btn"
              onClick={() => setFilterDrawerOpen(true)}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="shv-filter-count-badge">{activeFiltersCount}</span>
              )}
            </button>

            {/* Custom Styled Sort Select */}
            <div className="shv-sort-dropdown-wrap">
              <select
                value={selectedSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="shv-sort-select"
                aria-label="Sort Collection"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Additions</option>
              </select>
              <ChevronDown size={14} className="shv-sort-chevron" />
            </div>
          </div>
        </div>

        {/* 4. Active Filters Dismissible Tag Strip */}
        {(searchQuery || wishlistOnly || bestsellerOnly || maxPriceParam || (selectedCategory !== 'all' && !wishlistOnly)) && (
          <div className="shv-active-tags-strip">
            <span className="shv-active-label">Active Filters:</span>

            {searchQuery && (
              <div className="shv-active-tag">
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => updateFilter('search', '')} aria-label="Remove search filter">
                  <X size={12} />
                </button>
              </div>
            )}

            {selectedCategory !== 'all' && !wishlistOnly && (
              <div className="shv-active-tag">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => updateFilter('category', 'all')} aria-label="Remove category filter">
                  <X size={12} />
                </button>
              </div>
            )}

            {wishlistOnly && (
              <div className="shv-active-tag">
                <Heart size={12} fill="#E11D48" color="#E11D48" />
                <span>Saved Wishlist ({products.length})</span>
                <button onClick={() => updateFilter('wishlist', '')} aria-label="Remove wishlist filter">
                  <X size={12} />
                </button>
              </div>
            )}

            {bestsellerOnly && (
              <div className="shv-active-tag">
                <Sparkles size={12} />
                <span>Bestsellers</span>
                <button onClick={() => updateFilter('bestseller', '')} aria-label="Remove bestseller filter">
                  <X size={12} />
                </button>
              </div>
            )}

            {maxPriceParam && (
              <div className="shv-active-tag">
                <span>Under ₹{maxPriceParam}</span>
                <button onClick={() => updateFilter('maxPrice', '')} aria-label="Remove price filter">
                  <X size={12} />
                </button>
              </div>
            )}

            <button onClick={clearAllFilters} className="shv-reset-all-btn">
              Reset All
            </button>
          </div>
        )}

        {/* 5. Products Grid or Empty State */}
        {loading ? (
          <div className="shv-shop-loader-wrap">
            <Loader text="Curating certified 925 silver collection..." />
          </div>
        ) : products.length === 0 ? (
          <div className="shv-shop-empty-state">
            <div className="shv-empty-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h3>No pieces matched your selection</h3>
            <p>Try clearing your filters or explore our all-time favorite 925 silver bestsellers.</p>
            <button onClick={clearAllFilters} className="shv-empty-reset-btn">
              <span>View All 925 Silver</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className={`shv-shop-products-grid col-${gridCols}`}>
            {products.map((product, index) => (
              <React.Fragment key={product._id || product.slug}>
                <ProductCard product={product} />

                {/* Atelier Bespoke Inset Card inserted after 4th item when viewing All */}
                {index === 3 && products.length >= 6 && selectedCategory === 'all' && (
                  <div className="shv-shop-editorial-card">
                    <div className="shv-shop-editorial-card-inner">
                      <span className="shv-editorial-card-tag">ATELIER BESPOKE</span>
                      <h3 className="shv-editorial-card-title">
                        Custom Sizing &amp; Personal Inscriptions
                      </h3>
                      <p className="shv-editorial-card-p">
                        Need an exact custom band diameter or personalized talisman engraving? Our master silversmiths handcraft pieces to your precise measurements.
                      </p>
                      <Link to="/contact" className="shv-editorial-card-link">
                        <span>INQUIRE CUSTOM PIECE</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* 6. Slide-Out Filter Drawer */}
      {filterDrawerOpen && (
        <div
          className="shv-filter-drawer-overlay"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <div
            className="shv-filter-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Filter Options"
          >
            <div className="shv-filter-drawer-header">
              <div className="shv-filter-header-title">
                <SlidersHorizontal size={16} />
                <h3>Filter Collection</h3>
              </div>
              <button
                className="shv-filter-close-btn"
                onClick={() => setFilterDrawerOpen(false)}
                aria-label="Close Filter Drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="shv-filter-drawer-body">
              {/* Category Filter */}
              <div className="shv-filter-section">
                <h4 className="shv-filter-heading">Silhouette Category</h4>
                <div className="shv-filter-categories-list">
                  <button
                    type="button"
                    className={`shv-filter-cat-row ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      updateFilter('category', 'all');
                    }}
                  >
                    <span>All 925 Silver</span>
                    {selectedCategory === 'all' && <Check size={14} />}
                  </button>
                  {ALL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`shv-filter-cat-row ${selectedCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => {
                        updateFilter('category', cat.slug);
                      }}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.slug && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Cap Presets */}
              <div className="shv-filter-section">
                <h4 className="shv-filter-heading">Price Cap</h4>
                <div className="shv-price-presets-grid">
                  <button
                    type="button"
                    className={`shv-price-preset-btn ${!maxPriceParam ? 'active' : ''}`}
                    onClick={() => updateFilter('maxPrice', '')}
                  >
                    All Prices
                  </button>
                  <button
                    type="button"
                    className={`shv-price-preset-btn ${maxPriceParam === '1500' ? 'active' : ''}`}
                    onClick={() => updateFilter('maxPrice', '1500')}
                  >
                    Under ₹1,500
                  </button>
                  <button
                    type="button"
                    className={`shv-price-preset-btn ${maxPriceParam === '2000' ? 'active' : ''}`}
                    onClick={() => updateFilter('maxPrice', '2000')}
                  >
                    Under ₹2,000
                  </button>
                  <button
                    type="button"
                    className={`shv-price-preset-btn ${maxPriceParam === '3000' ? 'active' : ''}`}
                    onClick={() => updateFilter('maxPrice', '3000')}
                  >
                    Under ₹3,000
                  </button>
                </div>
              </div>

              {/* Special Curation Filters */}
              <div className="shv-filter-section">
                <h4 className="shv-filter-heading">Curation</h4>
                <div className="shv-curation-checkboxes">
                  <label className="shv-checkbox-row">
                    <input
                      type="checkbox"
                      checked={bestsellerOnly}
                      onChange={(e) => updateFilter('bestseller', e.target.checked ? 'true' : '')}
                    />
                    <span>Bestsellers Only</span>
                  </label>
                  <label className="shv-checkbox-row">
                    <input
                      type="checkbox"
                      checked={wishlistOnly}
                      onChange={(e) => updateFilter('wishlist', e.target.checked ? 'true' : '')}
                    />
                    <span>Saved Wishlist Only</span>
                  </label>
                </div>
              </div>

              {/* Metal Purity Guarantee */}
              <div className="shv-filter-purity-callout">
                <ShieldCheck size={18} className="shv-purity-icon" />
                <div>
                  <h5>100% Solid 925 Hallmark</h5>
                  <p>Every piece is certified solid 925 sterling silver with zero cheap base metals or nickel.</p>
                </div>
              </div>
            </div>

            <div className="shv-filter-drawer-footer">
              <button
                type="button"
                className="shv-filter-clear-btn"
                onClick={() => {
                  clearAllFilters();
                  setFilterDrawerOpen(false);
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="shv-filter-apply-btn"
                onClick={() => setFilterDrawerOpen(false)}
              >
                <span>View {products.length} Pieces</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Reassurance & Trust Strip */}
      <section className="shv-shop-trust-strip">
        <div className="container">
          <div className="shv-shop-trust-grid">
            <div className="shv-shop-trust-item">
              <div className="shv-shop-trust-icon">
                <ShieldCheck size={20} strokeWidth={1.3} />
              </div>
              <div className="shv-shop-trust-text">
                <h4>BIS 925 CERTIFIED</h4>
                <p>Authentic solid sterling silver with laser hallmark</p>
              </div>
            </div>

            <div className="shv-shop-trust-divider" />

            <div className="shv-shop-trust-item">
              <div className="shv-shop-trust-icon">
                <Sparkles size={20} strokeWidth={1.3} />
              </div>
              <div className="shv-shop-trust-text">
                <h4>TRIPLE RHODIUM SHIELD</h4>
                <p>Anti-tarnish, water-safe platinum luster</p>
              </div>
            </div>

            <div className="shv-shop-trust-divider" />

            <div className="shv-shop-trust-item">
              <div className="shv-shop-trust-icon">
                <Gift size={20} strokeWidth={1.3} />
              </div>
              <div className="shv-shop-trust-text">
                <h4>VELVET ATELIER BOX</h4>
                <p>Complimentary gift-ready presentation</p>
              </div>
            </div>

            <div className="shv-shop-trust-divider" />

            <div className="shv-shop-trust-item">
              <div className="shv-shop-trust-icon">
                <RotateCcw size={20} strokeWidth={1.3} />
              </div>
              <div className="shv-shop-trust-text">
                <h4>30-DAY GRACE PERIOD</h4>
                <p>Seamless doorstep exchange &amp; sizing swap</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;

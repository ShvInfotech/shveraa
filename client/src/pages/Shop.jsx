import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Gift,
  LayoutGrid,
  Grid3X3,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { fetchProducts, getImageUrl, apiGetShopBanners } from '../services/api';
import { useCart } from '../context/CartContext';
import { useDynamicStore, JEWELRY_COLORS } from '../services/storeService';

const CATEGORY_EDITORIAL = {
  all: {
    title: 'The Pure 925 Silver Treasury',
    subtitle:
      'Hand-sculpted in Surat with certified 92.5% silver purity. Triple-dipped in mirror rhodium for water-resistant radiance that defies time.',
    eyebrow: 'Artisan Silversmithing Surat • 92.5% Purity',
    bgImage: '/promo-model.jpg',
  },
  rings: {
    title: 'Sculpted Silver Bands & Solitaires',
    subtitle:
      'From fluid molten wave bands to architectural moissanite solitaires, cast for everyday tactile weight and timeless grace.',
    eyebrow: 'Heirloom Hand Finishes',
    bgImage: '/ring.jpeg',
  },
  necklaces: {
    title: 'Liquid Chains & Luminous Pendants',
    subtitle:
      'Italian-engineered herringbone ribbons, paperclip links, and medallion talismans that reflect light with every gesture.',
    eyebrow: 'Platinum-Luster Chains',
    bgImage: '/nackalce.jpeg',
  },
  earrings: {
    title: 'Architectural Hoops & Sculptural Drops',
    subtitle:
      'Featherweight hollow teardrops and micro-pavé huggies designed for all-day comfort with hypoallergenic security.',
    eyebrow: 'Featherweight Atelier Grace',
    bgImage: '/earring.jpeg',
  },
  bracelets: {
    title: 'Fluid Cuffs & Bezel Tennis Silhouettes',
    subtitle:
      'Contoured open wrists and flawless bezel-articulated links finished with hand-burnished 925 hallmarks.',
    eyebrow: 'Molten Silver Silhouettes',
    bgImage: '/braclate.jpeg',
  },
  personalised: {
    title: 'Laser-Carved Bespoke Heirlooms',
    subtitle:
      'Custom nameplates, initial signets, and cherished dates laser-cut into heavy 925 silver for personal keepsakes.',
    eyebrow: 'Custom Atelier Craft',
    bgImage: '/atelier-hallmark.jpg',
  },
  anklets: {
    title: 'Waterproof Chains & Faceted Beads',
    subtitle:
      'Beach-safe, shower-safe silver chains featuring satellite beads and facet drops for effortless summer shimmer.',
    eyebrow: 'Ocean-Ready Durability',
    bgImage: '/category-bracelet.jpg',
  },
  wishlist: {
    title: 'Your Saved Atelier Creations',
    subtitle:
      'Pieces you have bookmarked for your personal collection or upcoming milestone celebrations.',
    eyebrow: 'Curated by You',
    bgImage: '/muse-rings.jpg',
  },
};

// Price filter buckets — deliberately start at ₹1,000 (no sub-₹100 ranges).
// Stored as data so the checkbox list, the live counts and the actual product
// filtering all read from one source of truth and can never drift apart.
const PRICE_FILTERS = [
  { id: 'under1000', label: 'Under ₹1,000', max: 1000 },
  { id: '1000-2000', label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { id: '2000-3000', label: '₹2,000 – ₹3,000', min: 2000, max: 3000 },
  { id: '3000-5000', label: '₹3,000 – ₹5,000', min: 3000, max: 5000 },
  { id: 'above5000', label: 'Above ₹5,000', min: 5000 },
];

const Shop = () => {
  const { categories } = useDynamicStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(4); // 4 or 3 columns on desktop
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [shopBanner, setShopBanner] = useState(null);
  const { wishlist } = useCart();

  const [collapsedSections, setCollapsedSections] = useState({
    sort: true,
    category: true,
    metal: true,
    price: true,
  });

  const toggleSection = (sec) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';
  const wishlistOnly = searchParams.get('wishlist') === 'true';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const selectedColorParam = searchParams.get('color') || 'all';

  useEffect(() => {
    let active = true;
    apiGetShopBanners(selectedCategory)
      .then((banners) => { if (active) setShopBanner(banners[0] || null); })
      .catch((error) => {
        if (active) {
          setShopBanner(null);
          console.error('Error fetching shop category banner:', error);
        }
      });
    return () => { active = false; };
  }, [selectedCategory, reloadTrigger]);

  useEffect(() => {
    const handleStoreUpdate = () => setReloadTrigger((prev) => prev + 1);
    window.addEventListener('shveraa_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('shveraa_store_updated', handleStoreUpdate);
  }, []);

  useEffect(() => {
    fetchProducts({})
      .then((allData) => {
        if (Array.isArray(allData) && allData.length > 0) {
          setAllProducts(allData);
        }
      })
      .catch((err) => console.error('Error fetching all products count:', err));
  }, [reloadTrigger]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedSort !== 'featured') params.sort = selectedSort;
        if (searchQuery) params.search = searchQuery;

        let data = await fetchProducts(params);

        // Fallback: If category was selected and API returned empty due to slug differences, try client-side category filter on allProducts
        if (selectedCategory !== 'all' && (!data || data.length === 0) && allProducts.length > 0) {
          const cat = selectedCategory.toLowerCase();
          data = allProducts.filter((p) => {
            const pCat = (p.category || '').toLowerCase();
            if (cat === 'necklaces') return pCat.includes('necklace') || pCat.includes('pendant');
            if (cat === 'rings') return pCat.includes('ring');
            if (cat === 'earrings') return pCat.includes('earring');
            if (cat === 'bracelets') return pCat.includes('bracelet');
            if (cat === 'anklets') return pCat.includes('anklet');
            return pCat === cat;
          });
        }

        if (wishlistOnly) {
          const wishlistIds = new Set(wishlist.map((w) => String(w._id || w.slug)));
          data = data.filter((p) => wishlistIds.has(String(p._id || p.slug)));
        }

        if (selectedColorParam && selectedColorParam !== 'all') {
          const col = selectedColorParam.toLowerCase();
          data = data.filter((p) => {
            const text = `${p.name || ''} ${p.finish || ''} ${p.description || ''} ${p.material || ''} ${p.metalType || ''}`.toLowerCase();
            const colorsArr = Array.isArray(p.colors) ? p.colors.map((c) => String(c).toLowerCase()) : [];
            const variantsColors = Array.isArray(p.variants) ? p.variants.map((v) => String(v.color || '').toLowerCase()) : [];
            const allColors = [...colorsArr, ...variantsColors];

            if (col === 'silver') {
              return text.includes('silver') || text.includes('rhodium') || allColors.some((c) => c.includes('silver')) || (!text.includes('gold') && !allColors.some((c) => c.includes('gold')));
            }
            if (col === 'gold') {
              return text.includes('gold') || text.includes('vermeil') || allColors.some((c) => c.includes('gold') && !c.includes('rose'));
            }
            if (col === 'rose-gold' || col === 'rosegold') {
              return text.includes('rose') || allColors.some((c) => c.includes('rose'));
            }
            if (col === 'oxidised' || col === 'oxidized') {
              return text.includes('oxid') || p.category === 'personalised' || allColors.some((c) => c.includes('oxid'));
            }
            return text.includes(col) || allColors.some((c) => c.includes(col));
          });
        }

        if (maxPriceParam) {
          const bucket = PRICE_FILTERS.find((pf) => pf.id === maxPriceParam);
          if (bucket) {
            data = data.filter((p) => {
              const price = Number(p.price) || 0;
              if (bucket.min != null && price < bucket.min) return false;
              if (bucket.max != null && price > bucket.max) return false;
              return true;
            });
          }
        }

        // Apply Client-side Sorting
        if (selectedSort === 'price-asc') {
          data.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        } else if (selectedSort === 'price-desc') {
          data.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        } else if (selectedSort === 'rating') {
          data.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        } else if (selectedSort === 'newest') {
          data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setProducts(data);
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, selectedSort, searchQuery, wishlistOnly, maxPriceParam, selectedColorParam, wishlist, reloadTrigger, allProducts]);

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

  const CATEGORY_HERO_MAP = {
    rings: '/ring.jpeg',
    ring: '/ring.jpeg',
    necklaces: '/nackalce.jpeg',
    necklace: '/nackalce.jpeg',
    earrings: '/earring.jpeg',
    earring: '/earring.jpeg',
    bracelets: '/braclate.jpeg',
    bracelet: '/braclate.jpeg',
  };

  const catKey = (selectedCategory || '').toLowerCase();
  const activeBannerBg =
    (shopBanner?.image ? getImageUrl(shopBanner.image) : null) ||
    CATEGORY_HERO_MAP[catKey] ||
    editorial?.bgImage ||
    (currentCategoryData?.image ? getImageUrl(currentCategoryData.image) : null) ||
    '/promo-model.jpg';

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSort !== 'featured' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (wishlistOnly ? 1 : 0) +
    (maxPriceParam ? 1 : 0) +
    (selectedColorParam !== 'all' ? 1 : 0);

  const priceOptions = PRICE_FILTERS;

  const getCategoryCount = (slug) => {
    const cat = (slug || '').toLowerCase();
    return allProducts.filter((p) => {
      const pCat = (p.category || '').toLowerCase();
      if (cat === 'necklaces') return pCat.includes('necklace') || pCat.includes('pendant');
      if (cat === 'rings') return pCat.includes('ring');
      if (cat === 'earrings') return pCat.includes('earring');
      if (cat === 'bracelets') return pCat.includes('bracelet');
      if (cat === 'anklets') return pCat.includes('anklet');
      return pCat === cat;
    }).length;
  };

  const getMetalCount = (metalId) => {
    const col = (metalId || '').toLowerCase();
    return allProducts.filter((p) => {
      const text = `${p.name || ''} ${p.finish || ''} ${p.description || ''} ${p.material || ''}`.toLowerCase();
      const colorsArr = Array.isArray(p.colors) ? p.colors.map((c) => String(c).toLowerCase()) : [];
      const variantsColors = Array.isArray(p.variants) ? p.variants.map((v) => String(v.color || '').toLowerCase()) : [];
      const allColors = [...colorsArr, ...variantsColors];

      if (col === 'silver') {
        return text.includes('silver') || text.includes('rhodium') || allColors.some((c) => c.includes('silver')) || (!text.includes('gold') && !allColors.some((c) => c.includes('gold')));
      }
      if (col === 'gold') {
        return text.includes('gold') || text.includes('vermeil') || allColors.some((c) => c.includes('gold') && !c.includes('rose'));
      }
      if (col === 'rose-gold' || col === 'rosegold') {
        return text.includes('rose') || allColors.some((c) => c.includes('rose'));
      }
      if (col === 'oxidised') {
        return text.includes('oxid') || p.category === 'personalised' || allColors.some((c) => c.includes('oxid'));
      }
      return text.includes(col);
    }).length;
  };

  const getPriceCount = (pr) => {
    return allProducts.filter((p) => {
      const price = Number(p.price) || 0;
      if (pr.min != null && price < pr.min) return false;
      if (pr.max != null && price > pr.max) return false;
      return true;
    }).length;
  };

  const renderFilterContent = () => (
    <div className="shv-ref-filter-wrap">
      {/* 0. SORT BY */}
      <div className="shv-ref-filter-group">
        <button
          type="button"
          className="shv-ref-group-header"
          onClick={() => toggleSection('sort')}
        >
          <span className="shv-ref-group-title">SORT BY</span>
          {collapsedSections.sort ? (
            <ChevronDown size={16} className="shv-ref-chevron collapsed" />
          ) : (
            <ChevronUp size={16} className="shv-ref-chevron" />
          )}
        </button>

        {!collapsedSections.sort && (
          <div className="shv-ref-options-list">
            {[
              { id: 'featured', label: 'Featured Curations' },
              { id: 'price-asc', label: 'Price: Low to High' },
              { id: 'price-desc', label: 'Price: High to Low' },
              { id: 'rating', label: 'Highest Rated' },
              { id: 'newest', label: 'Newest Additions' },
            ].map((opt) => {
              const isChecked = selectedSort === opt.id;
              return (
                <label key={opt.id} className="shv-ref-checkbox-row">
                  <input
                    type="radio"
                    name="shop_sort_options"
                    checked={isChecked}
                    onChange={() => updateFilter('sort', opt.id)}
                    className="shv-ref-hidden-checkbox"
                  />
                  <span className={`shv-ref-checkbox-box ${isChecked ? 'checked' : ''}`} style={{ borderRadius: '50%' }}>
                    {isChecked && <Check size={11} strokeWidth={2.6} />}
                  </span>
                  <span className="shv-ref-label-text">
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. CATEGORY */}
      <div className="shv-ref-filter-group">
        <button
          type="button"
          className="shv-ref-group-header"
          onClick={() => toggleSection('category')}
        >
          <span className="shv-ref-group-title">CATEGORY</span>
          {collapsedSections.category ? (
            <ChevronDown size={16} className="shv-ref-chevron collapsed" />
          ) : (
            <ChevronUp size={16} className="shv-ref-chevron" />
          )}
        </button>

        {!collapsedSections.category && (
          <div className="shv-ref-options-list">
            {categories.map((cat) => {
              const isChecked = selectedCategory === cat.slug;
              const count = getCategoryCount(cat.slug);
              return (
                <label key={cat.slug || cat.id} className="shv-ref-checkbox-row">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateFilter('category', isChecked ? 'all' : cat.slug)}
                    className="shv-ref-hidden-checkbox"
                  />
                  <span className={`shv-ref-checkbox-box ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} strokeWidth={2.6} />}
                  </span>
                  <span className="shv-ref-label-text">
                    {cat.name} <span className="shv-ref-count">({count})</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. METAL & FINISH */}
      <div className="shv-ref-filter-group">
        <button
          type="button"
          className="shv-ref-group-header"
          onClick={() => toggleSection('metal')}
        >
          <span className="shv-ref-group-title">METAL &amp; FINISH</span>
          {collapsedSections.metal ? (
            <ChevronDown size={16} className="shv-ref-chevron collapsed" />
          ) : (
            <ChevronUp size={16} className="shv-ref-chevron" />
          )}
        </button>

        {!collapsedSections.metal && (
          <div className="shv-ref-options-list">
            {JEWELRY_COLORS.map((metal) => {
              const isChecked = selectedColorParam === metal.id;
              const count = getMetalCount(metal.id);
              return (
                <label key={metal.id} className="shv-ref-checkbox-row">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateFilter('color', isChecked ? 'all' : metal.id)}
                    className="shv-ref-hidden-checkbox"
                  />
                  <span className={`shv-ref-checkbox-box ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} strokeWidth={2.6} />}
                  </span>
                  <span className="shv-ref-label-text">
                    {metal.name} <span className="shv-ref-count">({count})</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PRICE */}
      <div className="shv-ref-filter-group">
        <button
          type="button"
          className="shv-ref-group-header"
          onClick={() => toggleSection('price')}
        >
          <span className="shv-ref-group-title">PRICE</span>
          {collapsedSections.price ? (
            <ChevronDown size={16} className="shv-ref-chevron collapsed" />
          ) : (
            <ChevronUp size={16} className="shv-ref-chevron" />
          )}
        </button>

        {!collapsedSections.price && (
          <div className="shv-ref-options-list">
            {priceOptions.map((pr) => {
              const isChecked = maxPriceParam === pr.id;
              const count = getPriceCount(pr);
              return (
                <label key={pr.id} className="shv-ref-checkbox-row">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateFilter('maxPrice', isChecked ? '' : pr.id)}
                    className="shv-ref-hidden-checkbox"
                  />
                  <span className={`shv-ref-checkbox-box ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} strokeWidth={2.6} />}
                  </span>
                  <span className="shv-ref-label-text">
                    {pr.label} <span className="shv-ref-count">({count})</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="shv-shop-page" style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* 1. Shop Hero Header Banner (Image Only) */}
      <section
        className="shv-shop-hero-banner"
        style={{
          backgroundImage: `url(${activeBannerBg})`,
        }}
        role="img"
        aria-label="Jewellery Collection Banner"
      />

      <div className="container shv-shop-main-container">
        {/* Breadcrumb Navigation cleanly positioned below hero banner */}
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

        <div className="shv-shop-layout">
          {/* Main Product Area */}
          <main className="shv-shop-content">
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

              {/* Right: Advance Filter Button */}
              <div className="shv-toolbar-right">
                <button
                  type="button"
                  className="shv-advanced-filter-btn"
                  onClick={() => setFilterDrawerOpen(true)}
                  aria-label="Open Filters"
                >
                  <SlidersHorizontal size={15} />
                  <span>Advance Filter</span>
                  {activeFiltersCount > 0 && (
                    <span className="shv-filter-count-badge">{activeFiltersCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* 4. Active Filters Dismissible Tag Strip */}
            {(searchQuery || wishlistOnly || maxPriceParam || (selectedCategory !== 'all' && !wishlistOnly) || (selectedColorParam && selectedColorParam !== 'all')) && (
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

                {maxPriceParam && (
                  <div className="shv-active-tag">
                    <span>{priceOptions.find((p) => p.id === maxPriceParam)?.label || `Price: ₹${maxPriceParam}`}</span>
                    <button onClick={() => updateFilter('maxPrice', '')} aria-label="Remove price filter">
                      <X size={12} />
                    </button>
                  </div>
                )}

                {selectedColorParam !== 'all' && (
                  <div className="shv-active-tag">
                    <span>Metal: {JEWELRY_COLORS.find((c) => c.id === selectedColorParam)?.name || selectedColorParam}</span>
                    <button onClick={() => updateFilter('color', 'all')} aria-label="Remove metal filter">
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
          </main>
        </div>
      </div>

      {/* 6. Slide-Out Filter Drawer (For Mobile/Tablet screens) */}
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
                <SlidersHorizontal size={18} />
                <h3>Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="shv-filter-count-badge">{activeFiltersCount}</span>
                )}
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
              {renderFilterContent()}
            </div>

            <div className="shv-filter-drawer-footer">
              <button
                type="button"
                className="shv-filter-clear-btn"
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
                style={{ opacity: activeFiltersCount === 0 ? 0.45 : 1, cursor: activeFiltersCount === 0 ? 'not-allowed' : 'pointer' }}
              >
                Reset All
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

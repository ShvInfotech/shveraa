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
  ChevronUp,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { fetchProducts, FALLBACK_PRODUCTS } from '../services/api';
import { useCart } from '../context/CartContext';
import { useDynamicStore, JEWELRY_COLORS } from '../services/storeService';

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

const SUB_CATEGORIES = [
  { id: 'engagement', name: 'Engagement Rings', keywords: ['solitaire', 'halo', 'engagement', 'lumina', 'ring'] },
  { id: 'necklaces', name: 'Necklaces', keywords: ['necklace', 'chain', 'herringbone', 'paperclip'] },
  { id: 'pendants', name: 'Pendants With Chain', keywords: ['pendant', 'medallion', 'nameplate', 'talisman'] },
  { id: 'studs', name: 'Stud Earrings', keywords: ['stud', 'huggie', 'hoop', 'teardrop', 'earring'] },
  { id: 'tennis', name: 'Tennis Bracelets', keywords: ['tennis', 'cuff', 'bracelet', 'bangle'] },
  { id: 'wedding', name: 'Wedding Rings', keywords: ['band', 'wave', 'stacking', 'wedding'] },
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
  const { wishlist } = useCart();

  const [collapsedSections, setCollapsedSections] = useState({
    category: false,
    subCategory: false,
    metal: false,
    price: false,
  });

  const toggleSection = (sec) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSubCategory = searchParams.get('subCategory') || '';
  const selectedSort = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';
  const bestsellerOnly = searchParams.get('bestseller') === 'true';
  const wishlistOnly = searchParams.get('wishlist') === 'true';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const selectedColorParam = searchParams.get('color') || 'all';

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
        if (bestsellerOnly) params.bestseller = 'true';

        let data = await fetchProducts(params);

        if (wishlistOnly) {
          const wishlistIds = new Set(wishlist.map((w) => w._id || w.slug));
          data = data.filter((p) => wishlistIds.has(p._id || p.slug));
        }

        if (selectedSubCategory) {
          const targetSub = SUB_CATEGORIES.find((s) => s.id === selectedSubCategory);
          if (targetSub) {
            data = data.filter((p) => {
              const text = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
              return targetSub.keywords.some((kw) => text.includes(kw));
            });
          }
        }

        if (selectedColorParam && selectedColorParam !== 'all') {
          if (selectedColorParam === 'oxidised') {
            data = data.filter((p) => {
              const text = `${p.finish || ''} ${p.description || ''} ${p.material || ''}`.toLowerCase();
              return text.includes('oxid') || p.category === 'personalised' || (Array.isArray(p.colors) && p.colors.some((c) => String(c).toLowerCase().includes('oxid')));
            });
          }
        }

        if (maxPriceParam) {
          if (maxPriceParam === 'above3000') {
            data = data.filter((p) => (p.price || 0) >= 3000);
          } else {
            const maxVal = Number(maxPriceParam);
            if (!isNaN(maxVal)) {
              data = data.filter((p) => (p.price || 0) <= maxVal);
            }
          }
        }

        setProducts(data);
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, selectedSubCategory, selectedSort, searchQuery, bestsellerOnly, wishlistOnly, maxPriceParam, selectedColorParam, wishlist, reloadTrigger]);

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
    (selectedSubCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (bestsellerOnly ? 1 : 0) +
    (wishlistOnly ? 1 : 0) +
    (maxPriceParam ? 1 : 0) +
    (selectedColorParam !== 'all' ? 1 : 0);

  const getCategoryCount = (slug) => {
    return allProducts.filter((p) => p.category === slug).length || 0;
  };

  const getSubCategoryCount = (sub) => {
    return allProducts.filter((p) => {
      const text = `${p.name || ''} ${p.description || ''} ${p.category || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return sub.keywords.some((kw) => text.includes(kw));
    }).length || 0;
  };

  const getMetalCount = (metalId) => {
    if (metalId === 'silver') {
      return allProducts.filter((p) => {
        const text = `${p.finish || ''} ${p.description || ''} ${p.material || ''}`.toLowerCase();
        return text.includes('silver') || text.includes('rhodium') || !text.includes('gold');
      }).length || allProducts.length;
    }
    if (metalId === 'gold') {
      return allProducts.filter((p) => {
        const text = `${p.finish || ''} ${p.description || ''} ${p.name || ''}`.toLowerCase();
        return text.includes('gold') || text.includes('vermeil') || (Array.isArray(p.colors) && p.colors.includes('gold'));
      }).length || Math.max(3, Math.floor(allProducts.length * 0.6));
    }
    if (metalId === 'rose-gold') {
      return allProducts.filter((p) => {
        const text = `${p.finish || ''} ${p.description || ''} ${p.name || ''}`.toLowerCase();
        return text.includes('rose') || (Array.isArray(p.colors) && p.colors.includes('rose-gold'));
      }).length || Math.max(2, Math.floor(allProducts.length * 0.4));
    }
    if (metalId === 'oxidised') {
      return allProducts.filter((p) => {
        const text = `${p.finish || ''} ${p.description || ''} ${p.material || ''}`.toLowerCase();
        return text.includes('oxid') || p.category === 'personalised';
      }).length || Math.max(2, Math.floor(allProducts.length * 0.3));
    }
    return allProducts.length;
  };

  const getPriceCount = (pr) => {
    if (pr.min) return allProducts.filter((p) => (p.price || 0) >= pr.min).length;
    if (pr.max) return allProducts.filter((p) => (p.price || 0) <= pr.max).length;
    return allProducts.length;
  };

  const renderFilterContent = () => (
    <div className="shv-ref-filter-wrap">
      {/* Title Header with thin line */}
      <div className="shv-ref-filter-header">
        <h2 className="shv-ref-filter-title">FILTERS</h2>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="shv-ref-clear-btn"
          >
            CLEAR ALL
          </button>
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

      {/* 2. SUB CATEGORY */}
      <div className="shv-ref-filter-group">
        <button
          type="button"
          className="shv-ref-group-header"
          onClick={() => toggleSection('subCategory')}
        >
          <span className="shv-ref-group-title">SUB CATEGORY</span>
          {collapsedSections.subCategory ? (
            <ChevronDown size={16} className="shv-ref-chevron collapsed" />
          ) : (
            <ChevronUp size={16} className="shv-ref-chevron" />
          )}
        </button>

        {!collapsedSections.subCategory && (
          <div className="shv-ref-options-list">
            {SUB_CATEGORIES.map((sub) => {
              const isChecked = selectedSubCategory === sub.id;
              const count = getSubCategoryCount(sub);
              return (
                <label key={sub.id} className="shv-ref-checkbox-row">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => updateFilter('subCategory', isChecked ? '' : sub.id)}
                    className="shv-ref-hidden-checkbox"
                  />
                  <span className={`shv-ref-checkbox-box ${isChecked ? 'checked' : ''}`}>
                    {isChecked && <Check size={11} strokeWidth={2.6} />}
                  </span>
                  <span className="shv-ref-label-text">
                    {sub.name} <span className="shv-ref-count">({count})</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. METAL & FINISH */}
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

      {/* 4. PRICE */}
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
            {[
              { id: '1500', label: 'Under ₹1,500', max: 1500 },
              { id: '2000', label: 'Under ₹2,000', max: 2000 },
              { id: '3000', label: 'Under ₹3,000', max: 3000 },
              { id: 'above3000', label: 'Above ₹3,000', min: 3000 },
            ].map((pr) => {
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

      <div className="container shv-shop-main-container">
        <div className="shv-shop-layout">
          {/* Left: Minimalist Reference Sidebar Filter on Desktop */}
          <aside className="shv-shop-sidebar" aria-label="Filters">
            {renderFilterContent()}
          </aside>

          {/* Right: Toolbar, Active Filter Tags, and Product Grid */}
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

              {/* Right: Filter Drawer Trigger (Mobile/Tablet) & Custom Sort Select */}
              <div className="shv-toolbar-right">
                <button
                  type="button"
                  className="shv-filter-drawer-btn"
                  onClick={() => setFilterDrawerOpen(true)}
                  aria-label="Open Filters"
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
            {(searchQuery || wishlistOnly || bestsellerOnly || maxPriceParam || selectedSubCategory || (selectedCategory !== 'all' && !wishlistOnly)) && (
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

                {selectedSubCategory && (
                  <div className="shv-active-tag">
                    <span>Subcategory: {SUB_CATEGORIES.find((s) => s.id === selectedSubCategory)?.name || selectedSubCategory}</span>
                    <button onClick={() => updateFilter('subCategory', '')} aria-label="Remove subcategory filter">
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
                    <span>{maxPriceParam === 'above3000' ? 'Above ₹3,000' : `Under ₹${maxPriceParam}`}</span>
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
              {renderFilterContent()}
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

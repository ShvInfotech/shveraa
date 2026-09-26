import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchProducts } from '../services/api';
import { useDynamicStore } from '../services/storeService';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const TRENDING_TAGS = [
  'Solitaire Rings',
  'Liquid Chains',
  'Teardrop Hoops',
  'Tennis Bracelets',
  'Moissanite',
  'Personalised',
  'Silver Brooches',
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { categories } = useDynamicStore();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setAllProducts(data || []);
      } catch (err) {
        console.error('Error fetching products for search:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Synchronize state when URL changes
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    const urlCat = searchParams.get('category') || 'all';
    setQuery(urlQ);
    setSelectedCategory(urlCat);
  }, [searchParams]);

  const updateSearchUrl = (newQuery, newCat) => {
    const nextParams = {};
    if (newQuery && newQuery.trim()) nextParams.q = newQuery.trim();
    if (newCat && newCat !== 'all') nextParams.category = newCat;
    setSearchParams(nextParams);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    updateSearchUrl(val, selectedCategory);
  };

  const handleClear = () => {
    setQuery('');
    updateSearchUrl('', selectedCategory);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    updateSearchUrl(tag, selectedCategory);
  };

  const handleCategorySelect = (catSlug) => {
    setSelectedCategory(catSlug);
    updateSearchUrl(query, catSlug);
  };

  // Filter products by query and category
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProducts.filter((p) => {
      // Category match
      const matchCat =
        selectedCategory === 'all' ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchCat) return false;

      // Query match across name, description, category, tags, and material
      if (!q) return true;

      const inName = p.name?.toLowerCase().includes(q);
      const inDesc = p.description?.toLowerCase().includes(q);
      const inCat = p.category?.toLowerCase().includes(q);
      const inMat = p.material?.toLowerCase().includes(q);
      const inBadge = p.badge?.toLowerCase().includes(q);

      return inName || inDesc || inCat || inMat || inBadge;
    });
  }, [allProducts, query, selectedCategory]);

  const popularBestsellers = useMemo(() => {
    return allProducts.filter((p) => p.bestseller || p.featured).slice(0, 4);
  }, [allProducts]);

  return (
    <div className="shv-search-page">
      {/* 1. Search Header Banner */}
      <section className="shv-search-hero-banner">
        <div className="container">
          <nav className="shv-shop-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="shv-bc-sep">/</span>
            <span className="shv-bc-current">Search Treasury</span>
          </nav>

          <div className="shv-search-banner-content">
            <span className="shv-script-eyebrow">Precision Discovery</span>
            <h1 className="shv-search-title">Search The Silver Treasury</h1>
            <p className="shv-search-subtitle">
              Find handcrafted 925 sterling silver solitaires, liquid chains, sculptural hoops, and personalised keepsakes.
            </p>

            {/* Main Interactive Search Input */}
            <div className="shv-search-box-wrap">
              <div className="shv-search-input-box">
                <SearchIcon size={22} className="shv-search-icon-inside" />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search rings, necklaces, 925 silver, moissanite, pendants..."
                  className="shv-search-large-input"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="shv-search-clear-btn"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Trending Quick Search Chips */}
            <div className="shv-search-trending-row">
              <span className="shv-trending-label">Trending Now:</span>
              <div className="shv-trending-pills">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`shv-trending-pill ${query.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                  >
                    ✦ {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Filter Pills Bar */}
      <div className="shv-search-cat-bar">
        <div className="container">
          <div className="shv-search-cat-scroll">
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={`shv-search-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All 925 Silver
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug || cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`shv-search-cat-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Results Section */}
      <div className="container shv-search-results-container">
        {/* Results Counter & Active Filters Strip */}
        <div className="shv-search-results-meta">
          <span className="shv-search-results-count">
            Showing <strong>{filteredProducts.length}</strong> certified silver{' '}
            {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            {query.trim() && (
              <>
                {' '}
                for <span className="shv-search-query-tag">"{query.trim()}"</span>
              </>
            )}
            {selectedCategory !== 'all' && (
              <>
                {' '}
                in <strong style={{ textTransform: 'capitalize' }}>{selectedCategory}</strong>
              </>
            )}
          </span>

          {(query.trim() || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCategory('all');
                setSearchParams({});
              }}
              className="shv-search-reset-btn"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <Loader text="Searching handcrafted 925 silver masterpieces..." />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="shv-shop-products-grid col-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="shv-search-empty-box">
            <div className="shv-search-empty-icon">
              <SearchIcon size={38} color="#A07E52" />
            </div>
            <h3>No matching silver silhouettes found</h3>
            <p>
              We couldn't find any designs matching <strong>"{query}"</strong>. Try checking your spelling,
              exploring another category, or browse our most-loved bestsellers below.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                  setSearchParams({});
                }}
                className="btn btn-primary"
              >
                Clear Search &amp; View All
              </button>
              <Link to="/shop" className="btn btn-outline">
                Browse Full Catalog
              </Link>
            </div>

            {/* Recommended Bestsellers Fallback */}
            {popularBestsellers.length > 0 && (
              <div style={{ marginTop: '3.5rem', textAlign: 'left', borderTop: '1px solid rgba(160,126,82,0.2)', paddingTop: '2rem' }}>
                <span className="section-subtitle">Trending Highlights</span>
                <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.6rem', marginBottom: '1.5rem', color: '#1A1612' }}>
                  Popular Atelier Bestsellers
                </h4>
                <div className="shv-shop-products-grid col-4">
                  {popularBestsellers.map((rel) => (
                    <ProductCard key={rel._id || rel.slug} product={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import Loader from './Loader';
import { fetchProducts } from '../services/api';

const SIGNATURE_COLLECTIONS = [
  {
    id: 'rings',
    categoryKey: 'rings',
    badge: 'SIGNATURE EDIT',
    title: 'The Solitaire Treasury',
    shortName: 'Solitaire Rings',
    tagline: 'From ₹1,299 • 24 Silhouettes',
    description: 'Brilliant moissanite solitaires, molten wave bands, and micro-pavé halos.',
    image: '/hero-ring-banner.jpg',
    link: '/shop?category=rings',
  },
  {
    id: 'necklaces',
    categoryKey: 'necklaces',
    badge: 'NEW ARRIVAL',
    title: 'Liquid Mercury Chains',
    shortName: 'Chains & Pendants',
    tagline: 'From ₹1,899 • 18 Silhouettes',
    description: 'Italian-engineered herringbone ribbons and fluid snake links that drape like silk.',
    image: '/hero-necklace-banner.jpg',
    link: '/shop?category=necklaces',
  },
  {
    id: 'earrings',
    categoryKey: 'earrings',
    badge: 'BESTSELLER',
    title: 'Featherweight Atelier Drops',
    shortName: 'Sculptural Earrings',
    tagline: 'From ₹1,199 • 22 Silhouettes',
    description: 'Hollow-cast sculptural hoops and huggies crafted for weightless all-day radiance.',
    image: '/hero-earrings-banner.jpg',
    link: '/shop?category=earrings',
  },
  {
    id: 'bracelets',
    categoryKey: 'bracelets',
    badge: 'TIMELESS LUXURY',
    title: 'Mirage Tennis & Cuffs',
    shortName: 'Tennis & Cuffs',
    tagline: 'From ₹1,699 • 16 Silhouettes',
    description: 'Hand-articulated bezel-set tennis wristlets and contoured molten silver cuffs.',
    image: '/hero-bracelet-banner.jpg',
    link: '/shop?category=bracelets',
  },
];

const COLLECTION_TABS = [
  { id: 'all', categoryKey: 'all', name: 'All Curations', icon: '✦' },
  { id: 'rings', categoryKey: 'rings', name: 'The Solitaire Treasury', icon: '💍' },
  { id: 'necklaces', categoryKey: 'necklaces', name: 'Liquid Mercury Chains', icon: '✨' },
  { id: 'earrings', categoryKey: 'earrings', name: 'Featherweight Atelier Drops', icon: '💎' },
  { id: 'bracelets', categoryKey: 'bracelets', name: 'Mirage Tennis & Cuffs', icon: '⚡' },
];

const ShopByCollection = ({ products = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [catalog, setCatalog] = useState(products || []);
  const [fetching, setFetching] = useState(false);

  // If products prop updates from parent Home.jsx, sync catalog
  useEffect(() => {
    if (products && products.length > 0) {
      setCatalog(products);
    } else if (!catalog.length && !loading) {
      // Standalone fallback: fetch products if not provided
      setFetching(true);
      fetchProducts()
        .then((res) => {
          if (Array.isArray(res) && res.length) {
            setCatalog(res);
          }
        })
        .catch((err) => console.error('Error fetching collection products:', err))
        .finally(() => setFetching(false));
    }
  }, [products, loading]);

  // Filter products for the active collection
  const displayedProducts = useMemo(() => {
    if (!catalog || !catalog.length) return [];
    if (activeTab === 'all') return catalog.slice(0, 8);

    const key = activeTab.toLowerCase();

    // 1. Direct category match
    let matches = catalog.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      return cat === key || cat.includes(key);
    });

    // 2. Keyword fallback match if direct category count is low
    if (matches.length < 4) {
      const keywordMap = {
        rings: ['ring', 'band', 'solitaire', 'halo'],
        necklaces: ['necklace', 'chain', 'pendant', 'choker', 'herringbone'],
        earrings: ['earring', 'hoop', 'huggie', 'drop', 'stud'],
        bracelets: ['bracelet', 'cuff', 'bangle', 'tennis'],
      };
      const keywords = keywordMap[key] || [key];
      const keywordMatches = catalog.filter((p) => {
        const name = (p.name || p.title || '').toLowerCase();
        return keywords.some((kw) => name.includes(kw));
      });

      const seenIds = new Set(matches.map((m) => m._id || m.slug));
      keywordMatches.forEach((p) => {
        const id = p._id || p.slug;
        if (!seenIds.has(id)) {
          matches.push(p);
          seenIds.add(id);
        }
      });
    }

    // 3. Fallback to top products if category empty so UI is never blank
    if (matches.length === 0) {
      return catalog.slice(0, 8);
    }

    return matches.slice(0, 8);
  }, [catalog, activeTab]);

  // Active collection metadata
  const currentCollection = SIGNATURE_COLLECTIONS.find((c) => c.id === activeTab);
  const activeTitle = currentCollection ? currentCollection.title : 'All Atelier Pieces';
  const activeDesc = currentCollection
    ? currentCollection.description
    : 'Complete archive of certified solid 925 sterling silver heirlooms, hand-finished in Jaipur.';
  const activeShopLink = currentCollection ? currentCollection.link : '/shop';

  const isLoading = loading || fetching;

  return (
    <section className="section-collections shv-collections-section" id="shop-by-collection">
      <div className="container">
        {/* Editorial Centered Header */}
        <div className="shv-section-editorial-header">
          <span className="shv-script-eyebrow">Signature Curations</span>
          <h2 className="shv-section-heading">Shop by Collection</h2>
          <p className="shv-section-lead">
            Thematic silversmithing stories sculpted for everyday grace, milestone celebrations, and modern muses.
          </p>
          <div className="shv-header-flourish">
            <span className="shv-flourish-line" />
            <span className="shv-flourish-star">✦</span>
            <span className="shv-flourish-line" />
          </div>
        </div>

        {/* Collection Filter Tabs */}
        <div className="shv-collection-tabs-wrap">
          <div className="shv-collection-tabs-scroll">
            {COLLECTION_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shv-collection-tab-pill ${isActive ? 'active' : ''}`}
                >
                  <span className="shv-tab-pill-icon">{tab.icon}</span>
                  <span className="shv-tab-pill-name">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Collection Spotlight Strip */}
        <div className="shv-collection-spotlight-strip">
          <div className="shv-spotlight-info">
            <span className="shv-spotlight-badge">
              <Sparkles size={12} />
              CURATED COLLECTION
            </span>
            <h3 className="shv-spotlight-title">{activeTitle}</h3>
            <p className="shv-spotlight-desc">{activeDesc}</p>
          </div>
          <Link to={activeShopLink} className="shv-spotlight-link">
            <span>Explore All {activeTitle}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Live Product Cards Grid */}
        <div className="shv-collection-products-wrap">
          {isLoading ? (
            <Loader text="Curating collection pieces in pure 925 silver..." />
          ) : displayedProducts.length === 0 ? (
            <div className="shv-collection-empty">
              <p>Atelier craftsmen are currently forging new pieces for this collection.</p>
              <Link to="/shop" className="shv-btn-editorial-outline">
                <span>BROWSE ENTIRE VAULT</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="shv-shop-products-grid col-4">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={{
                    ...product,
                    badge: product.badge || (currentCollection?.badge ? currentCollection.badge : 'Collection'),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA Link to Shop Page */}
        <div className="shv-collections-footer-cta">
          <Link to={activeShopLink} className="shv-btn-editorial-outline">
            <span>VIEW COMPLETE {activeTitle.toUpperCase()} IN SHOP</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopByCollection;

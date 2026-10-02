import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import Loader from './Loader';
import { fetchProducts } from '../services/api';

const ShopByCollection = ({ products = [], loading = false }) => {
  const [catalog, setCatalog] = useState(products || []);
  const [fetching, setFetching] = useState(false);

  // If products prop updates from parent Home.jsx, sync catalog
  useEffect(() => {
    if (products && products.length > 0) {
      setCatalog(products);
    } else if (!catalog.length && !loading) {
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

  // Fixed 8 products in mixed categories (rings, necklaces, earrings, bracelets)
  const displayedProducts = useMemo(() => {
    if (!catalog || !catalog.length) return [];

    const categoryGroups = {};
    catalog.forEach((p) => {
      const cat = (p.category || 'curated').toLowerCase().trim();
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(p);
    });

    const categoryKeys = Object.keys(categoryGroups);
    const mixed = [];
    let round = 0;

    // Round-robin pick from each category to ensure an authentic category mix
    while (mixed.length < 8 && round < 20) {
      let addedInRound = false;
      for (const cat of categoryKeys) {
        if (categoryGroups[cat][round] && mixed.length < 8) {
          mixed.push(categoryGroups[cat][round]);
          addedInRound = true;
        }
      }
      if (!addedInRound) break;
      round++;
    }

    // If still less than 8, backfill from remaining catalog
    if (mixed.length < 8) {
      const existingIds = new Set(mixed.map((m) => m._id || m.slug));
      for (const p of catalog) {
        const pId = p._id || p.slug;
        if (!existingIds.has(pId)) {
          mixed.push(p);
          existingIds.add(pId);
          if (mixed.length === 8) break;
        }
      }
    }

    return mixed.slice(0, 8);
  }, [catalog]);

  const isLoading = loading || fetching;

  return (
    <section className="section-collections shv-collections-section" id="shop-by-collection">
      <div className="container">
        {/* Minimal Section Header */}
        <div className="shv-section-editorial-header" style={{ marginBottom: '2.5rem' }}>
          <h2 className="shv-section-heading">Signature Curations</h2>
          <div className="shv-header-flourish">
            <span className="shv-flourish-line" />
            <span className="shv-flourish-star">✦</span>
            <span className="shv-flourish-line" />
          </div>
        </div>

        {/* Live Product Cards Grid - Fixed 8 Mixed Products */}
        <div className="shv-collection-products-wrap">
          {isLoading ? (
            <Loader text="Curating 925 silver collection..." />
          ) : displayedProducts.length === 0 ? (
            <div className="shv-collection-empty">
              <p>Atelier craftsmen are currently forging new pieces.</p>
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
                  product={product}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA Link to Shop Page */}
        <div className="shv-collections-footer-cta" style={{ marginTop: '3rem' }}>
          <Link to="/shop" className="shv-btn-editorial-outline">
            <span>EXPLORE ALL PIECES</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopByCollection;

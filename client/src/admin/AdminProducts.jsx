import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Check, X, Sparkles, Filter, Eye, Package, ExternalLink } from 'lucide-react';
import { saveProduct, deleteProduct, toggleProductStock } from '../services/storeService';

const AdminProducts = ({ products, categories, searchQuery, onRefresh, onOpenEditor }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'inStock' | 'outOfStock'

  const handleDuplicate = (prod) => {
    const duplicated = {
      ...prod,
      _id: 'prod_dup_' + Date.now(),
      name: `${prod.name} (Copy)`,
      slug: `${prod.slug}-copy-${Date.now().toString().slice(-4)}`,
    };
    saveProduct(duplicated);
    onRefresh && onRefresh();
  };

  const handleDelete = (prod) => {
    if (window.confirm(`Are you sure you want to delete "${prod.name}" from the atelier catalog?`)) {
      deleteProduct(prod._id || prod.slug);
      onRefresh && onRefresh();
    }
  };

  const handleToggleStock = (prod) => {
    toggleProductStock(prod._id || prod.slug);
    onRefresh && onRefresh();
  };

  // Filter products by category, stock status & search query
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategoryFilter === 'all' ||
      p.category?.toLowerCase() === selectedCategoryFilter?.toLowerCase();

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'inStock' && p.inStock !== false) ||
      (stockFilter === 'outOfStock' && p.inStock === false);

    const q = (searchQuery || '').toLowerCase();
    const matchesQuery =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      (p.material && p.material.toLowerCase().includes(q));

    return matchesCat && matchesStock && matchesQuery;
  });

  return (
    <div className="shv-admin-products-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Pure 925 Silver Inventory &amp; Catalog ({filteredProducts.length} pieces)
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Real-time synchronization: Added, updated or toggled pieces appear immediately in Shop, Home &amp; Cart.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="shv-table-filter-btn"
            style={{ fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.slug || c.id} value={(c.slug || c.id).toLowerCase()}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="shv-table-filter-btn"
            style={{ fontWeight: 600, padding: '0.5rem 0.9rem' }}
          >
            <option value="all">All Stock Status</option>
            <option value="inStock">In Stock Only</option>
            <option value="outOfStock">Sold Out Only</option>
          </select>

          {/* Dedicated Full Page Add Piece Button */}
          <button
            type="button"
            onClick={() => onOpenEditor && onOpenEditor(null)}
            className="shv-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={17} />
            <span>Sculpt New 925 Piece</span>
          </button>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Piece &amp; Silhouette</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Purity &amp; Stone</th>
                <th>Flags</th>
                <th>Stock Control</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--admin-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <Package size={36} style={{ opacity: 0.3 }} />
                      <div>No jewellery pieces found matching your current filter.</div>
                      <button
                        type="button"
                        onClick={() => onOpenEditor && onOpenEditor(null)}
                        className="shv-table-filter-btn"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Plus size={14} />
                        <span>Add First Piece</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const imgUrl = (prod.images && prod.images[0]) || prod.image;
                  const secondImg = (prod.images && prod.images[1]) || prod.secondaryImage;
                  return (
                    <tr key={prod._id || prod.slug}>
                      <td>
                        <div className="shv-table-item-cell">
                          <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                            <img
                              src={imgUrl}
                              alt={prod.name}
                              className="shv-table-item-thumb"
                              style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }}
                            />
                            {secondImg && (
                              <span
                                title="Has secondary hover image"
                                style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  right: '2px',
                                  background: 'rgba(19, 22, 29, 0.85)',
                                  color: '#C5A880',
                                  fontSize: '0.62rem',
                                  padding: '1px 3px',
                                  borderRadius: '3px',
                                  fontWeight: 700,
                                }}
                              >
                                2P
                              </span>
                            )}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.88rem', color: '#1E2229' }}>{prod.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
                              <span>SKU: {prod.sku || prod.slug?.substring(0, 16)}</span>
                              {prod.images && prod.images.length > 1 && (
                                <span>• {prod.images.length} photos</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            textTransform: 'capitalize',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            color: '#1E2229',
                            background: '#F1F5F9',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                          }}
                        >
                          {prod.category}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ fontSize: '0.92rem' }}>
                            ₹{Number(prod.price || 0).toLocaleString('en-IN')}
                          </strong>
                          {prod.originalPrice > prod.price && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                color: 'var(--admin-text-muted)',
                                textDecoration: 'line-through',
                                marginLeft: '0.4rem',
                              }}
                            >
                              ₹{Number(prod.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#A07E52', fontWeight: 600 }}>
                          ✦ {prod.metalPurity || '925 Pure Silver'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                          {prod.stone || 'Solitaire'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {prod.bestseller && (
                            <span
                              style={{
                                background: '#FEF3C7',
                                color: '#B45309',
                                fontSize: '0.66rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontWeight: 700,
                              }}
                            >
                              BESTSELLER
                            </span>
                          )}
                          {prod.featured && (
                            <span
                              style={{
                                background: '#E0E7FF',
                                color: '#3730A3',
                                fontSize: '0.66rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontWeight: 700,
                              }}
                            >
                              NEW
                            </span>
                          )}
                          {!prod.bestseller && !prod.featured && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Standard</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(prod)}
                          className={`shv-status-pill ${prod.inStock !== false ? 'delivered' : 'cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle In-Stock / Sold-Out"
                        >
                          {prod.inStock !== false ? <Check size={12} /> : <X size={12} />}
                          <span>{prod.inStock !== false ? 'In Stock' : 'Sold Out'}</span>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {/* Dedicated Full Page Editor Trigger */}
                          <button
                            type="button"
                            onClick={() => onOpenEditor && onOpenEditor(prod)}
                            className="shv-table-filter-btn"
                            title="Open Full Jewellery Studio"
                            style={{ padding: '0.4rem 0.65rem', color: '#1E2229' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod)}
                            className="shv-table-filter-btn"
                            title="Duplicate Piece"
                            style={{ padding: '0.4rem 0.65rem' }}
                          >
                            <Copy size={14} />
                          </button>
                          <a
                            href={`/product/${prod.slug || prod._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shv-table-filter-btn"
                            title="View on Public Website"
                            style={{ padding: '0.4rem 0.65rem' }}
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod)}
                            className="shv-table-filter-btn"
                            title="Delete Piece"
                            style={{
                              padding: '0.4rem 0.65rem',
                              color: 'var(--admin-red)',
                              borderColor: 'rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

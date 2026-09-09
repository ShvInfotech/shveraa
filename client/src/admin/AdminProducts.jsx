import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Check, X, Sparkles, Filter, Eye } from 'lucide-react';
import { saveProduct, deleteProduct, toggleProductStock } from '../services/storeService';

const AdminProducts = ({ products, categories, searchQuery, onRefresh }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const initialForm = {
    name: '',
    slug: '',
    category: categories[0]?.slug || 'rings',
    price: '',
    originalPrice: '',
    description: 'Cast in certified 925 sterling silver with high-luster rhodium plating.',
    material: '925 Sterling Silver & Platinum Rhodium',
    stone: 'AAAAA Moissanite',
    finish: 'Mirror Platinum Polish',
    sizes: 'US 5, US 6, US 7, US 8, US 9',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
    secondaryImage: '',
    inStock: true,
    featured: false,
    bestseller: false,
  };

  const [formData, setFormData] = useState(initialForm);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category: categories[0]?.slug || 'rings',
    });
    setShowModal(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      category: prod.category || 'rings',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      description: prod.description || '',
      material: prod.material || '925 Sterling Silver',
      stone: prod.stone || 'None',
      finish: prod.finish || 'Mirror Polish',
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || ''),
      image: (prod.images && prod.images[0]) || prod.image || '',
      secondaryImage: (prod.images && prod.images[1]) || '',
      inStock: prod.inStock !== false,
      featured: Boolean(prod.featured),
      bestseller: Boolean(prod.bestseller),
    });
    setShowModal(true);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    const sizesArr = formData.sizes
      ? formData.sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Standard'];

    const imagesArr = [formData.image];
    if (formData.secondaryImage?.trim()) {
      imagesArr.push(formData.secondaryImage.trim());
    }

    const payload = {
      ...formData,
      _id: editingProduct?._id || ('prod_shv_' + Date.now()),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || formData.price * 1.3),
      sizes: sizesArr,
      images: imagesArr,
    };

    saveProduct(payload);
    setShowModal(false);
    onRefresh && onRefresh();
  };

  // Filter products by category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategoryFilter === 'all' ||
      p.category?.toLowerCase() === selectedCategoryFilter?.toLowerCase();

    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      (p.material && p.material.toLowerCase().includes(q));

    return matchesCat && matchesQuery;
  });

  return (
    <div className="shv-admin-products-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Pure 925 Silver Catalog &amp; Inventory ({filteredProducts.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Real-time synchronization: Added, updated or toggled pieces appear immediately in Shop, Home &amp; Cart.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category Filter Pills */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="shv-table-filter-btn"
            style={{ fontWeight: 600, padding: '0.5rem 1rem' }}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openAddModal}
            className="shv-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
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
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    No products found matching your current filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const imgUrl = (prod.images && prod.images[0]) || prod.image;
                  return (
                    <tr key={prod._id || prod.slug}>
                      <td>
                        <div className="shv-table-item-cell">
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            className="shv-table-item-thumb"
                            style={{ width: '48px', height: '48px', borderRadius: '10px' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.88rem' }}>{prod.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                              SKU: {prod.slug?.substring(0, 18) || prod._id}
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
                          }}
                        >
                          {prod.category}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>₹{Number(prod.price).toLocaleString('en-IN')}</strong>
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
                          ✦ 925 Pure Silver
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
                                fontSize: '0.68rem',
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
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontWeight: 700,
                              }}
                            >
                              FEATURED
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStock(prod)}
                          className={`shv-status-pill ${prod.inStock ? 'delivered' : 'cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle In-Stock / Sold-Out"
                        >
                          {prod.inStock ? <Check size={12} /> : <X size={12} />}
                          <span>{prod.inStock ? 'In Stock' : 'Sold Out'}</span>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="shv-table-filter-btn"
                            title="Edit Product"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(prod)}
                            className="shv-table-filter-btn"
                            title="Duplicate Product"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod)}
                            className="shv-table-filter-btn"
                            title="Delete Product"
                            style={{
                              padding: '0.35rem 0.65rem',
                              color: 'var(--admin-red)',
                              borderColor: 'rgba(239, 68, 68, 0.2)',
                            }}
                          >
                            <Trash2 size={13} />
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="shv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="shv-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="shv-modal-header">
              <h3 className="shv-modal-title">
                {editingProduct ? `Edit Piece: ${editingProduct.name}` : 'Sculpt New Certified 925 Silver Piece'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="shv-modal-close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="shv-form-group">
                <label className="shv-form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumina 925 Silver Solitaire Ring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="shv-form-group">
                  <label className="shv-form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="shv-form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">Selling Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1899"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="shv-form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="shv-form-group">
                  <label className="shv-form-label">Original Strikethrough Price (₹)</label>
                  <input
                    type="number"
                    placeholder="2499"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="shv-form-input"
                  />
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">Available Sizes (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="US 5, US 6, US 7, US 8, US 9"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="shv-form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="shv-form-group">
                  <label className="shv-form-label">Metal Purity &amp; Composition</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="shv-form-input"
                  />
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">Gemstone / Accent</label>
                  <input
                    type="text"
                    value={formData.stone}
                    onChange={(e) => setFormData({ ...formData, stone: e.target.value })}
                    className="shv-form-input"
                  />
                </div>
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Primary Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Secondary / Back Angle Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.secondaryImage}
                  onChange={(e) => setFormData({ ...formData, secondaryImage: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Atelier Story &amp; Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="shv-form-textarea"
                />
              </div>

              {/* Badges & Flags */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1rem',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--admin-border)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.84rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <span>In Stock</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.84rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.84rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>Feature on Home</span>
                </label>
              </div>

              <div className="shv-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="shv-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="shv-btn-primary">
                  {editingProduct ? 'Save Changes' : 'Publish Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

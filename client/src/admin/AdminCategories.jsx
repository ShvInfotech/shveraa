import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Layers, Sparkles, Image, Check, AlertCircle, Upload } from 'lucide-react';
import { saveCategory, deleteCategory } from '../services/storeService';
import { apiAdminAddCategory, apiAdminUpdateCategory, apiAdminDeleteCategory } from '../services/api';
import { compressImageFile } from '../utils/imageUpload';

const AdminCategories = ({ categories, products, onRefresh }) => {
  const catFileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const showMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subtitle: '',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
  });

  const handleCategoryFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const dataUrl = await compressImageFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      console.error('Category image upload error:', err);
      alert('Failed to process image. Please choose another photo.');
    } finally {
      setUploadingImage(false);
      if (catFileInputRef.current) catFileInputRef.current.value = '';
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      subtitle: '925 Silver Adornments',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
    });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      subtitle: cat.subtitle || '',
      image: cat.image || '',
    });
    setShowModal(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingCategory) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingCategory?._id) {
        await apiAdminUpdateCategory(editingCategory._id, formData);
        showMsg('Category updated successfully!');
      } else {
        await apiAdminAddCategory(formData);
        showMsg('Category added successfully!');
      }
      // Also update localStorage for immediate reactivity
      saveCategory({
        ...formData,
        id: formData.slug,
        _id: editingCategory?._id,
        itemCount: `${products.filter((p) => p.category?.toLowerCase() === formData.slug?.toLowerCase()).length} designs`,
      });
      setShowModal(false);
      onRefresh && onRefresh();
    } catch (err) {
      showMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const productCount = products.filter(
      (p) => p.category?.toLowerCase() === cat.slug?.toLowerCase()
    ).length;

    if (
      window.confirm(
        `Are you sure you want to delete the category "${cat.name}"? ${
          productCount > 0 ? `It currently contains ${productCount} products.` : ''
        }`
      )
    ) {
      try {
        if (cat._id) await apiAdminDeleteCategory(cat._id);
        deleteCategory(cat.slug);
        showMsg('Category deleted.');
        onRefresh && onRefresh();
      } catch (err) {
        showMsg(err.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="shv-admin-categories-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Category Taxonomy &amp; Collections ({categories.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Live sync: Added, edited, or deleted categories immediately update Navbar mega-menus, Shop filters, and Homepage grids.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="shv-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Banner / Media</th>
                <th>Category Name</th>
                <th>Slug (URL Path)</th>
                <th>Editorial Subtitle</th>
                <th>Active Silhouettes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.category?.toLowerCase() === cat.slug?.toLowerCase()
                ).length;

                return (
                  <tr key={cat.slug || cat.id}>
                    <td>
                      <img
                        src={cat.image}
                        alt={cat.name}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          background: '#F1F5F9',
                          border: '1px solid var(--admin-border)',
                        }}
                      />
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{cat.name}</strong>
                      <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                        ID: {cat.id}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          background: '#F1F5F9',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                        }}
                      >
                        /shop?category={cat.slug}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>
                        {cat.subtitle || '925 Silver Adornments'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="shv-status-pill ontheway"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.76rem' }}
                      >
                        {count} {count === 1 ? 'Piece' : 'Pieces'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="shv-table-filter-btn"
                          title="Edit Category"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="shv-table-filter-btn"
                          title="Delete Category"
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="shv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="shv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shv-modal-header">
              <h3 className="shv-modal-title">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Sculpt New Category Collection'}
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
                <label className="shv-form-label">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silver Solitaire Rings"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Category Slug (URL identifier) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rings"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  className="shv-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Editorial Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Bands, Solitaires & Stacks"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Category Banner Photo (Upload from Device)</label>
                <div
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => catFileInputRef.current?.click()}
                >
                  <input
                    ref={catFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCategoryFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <Upload size={24} color="#1E2229" />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1E2229' }}>
                      {uploadingImage ? 'Optimizing photo...' : 'Click to select photo from device'}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                      Supports JPG, PNG, WEBP from your computer or phone
                    </span>
                  </div>
                </div>

                {formData.image && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      style={{ height: '70px', width: '100px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E2229' }}>Photo Selected</div>
                      <button
                        type="button"
                        onClick={() => catFileInputRef.current?.click()}
                        className="shv-table-filter-btn"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.76rem', marginTop: '0.3rem' }}
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                )}
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
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

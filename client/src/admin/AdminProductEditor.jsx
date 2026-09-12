import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Check,
  Star,
  Shield,
  Eye,
  Plus,
  X,
  AlertCircle,
  Layers,
  Tag,
  DollarSign,
  Info,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { saveProduct, deleteProduct, JEWELRY_COLORS } from '../services/storeService';
import { apiAdminAddProduct, apiAdminUpdateProduct, apiAdminDeleteProduct } from '../services/api';
import { processMultipleImageFiles } from '../utils/imageUpload';

const METAL_TYPES = [
  '925 Sterling Silver & Platinum Rhodium',
  'Pure 925 Sterling Silver',
  '14K Gold Vermeil over 925 Silver',
  'Rose Gold Vermeil over 925 Silver',
  'Oxidized Antique 925 Silver',
  'Two-Tone Silver & Gold',
];

const GEMSTONE_TYPES = [
  'AAAAA Moissanite (VVS1 Brilliant)',
  'Certified Lab-Grown Diamond',
  'Swiss Cubic Zirconia',
  'Natural Emerald & 925 Silver',
  'Freshwater Cultured Pearl',
  'Black Onyx & Silver',
  'None (Pure Solid Silver)',
];

const FINISH_TYPES = [
  'Mirror Platinum Polish',
  'Anti-Tarnish Protective E-Coat',
  'High-Gloss Rhodium Lustre',
  'Satin Matte Brushed Polish',
  'Vintage Oxidized Patina',
];

const PRESET_SIZES = ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'Adjustable', 'Free Size'];

const SAMPLE_JEWELRY_IMAGES = [
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85',
];

const AdminProductEditor = ({ product, categories, onBack, onSaveSuccess }) => {
  const isEditing = Boolean(product && product._id);
  const fileInputRef = useRef(null);

  // Normalize initial images
  const getInitialImages = () => {
    if (!product) return [SAMPLE_JEWELRY_IMAGES[0]];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) return [product.image];
    return [SAMPLE_JEWELRY_IMAGES[0]];
  };

  const getInitialSizes = () => {
    if (!product || !product.sizes) return ['US 6', 'US 7', 'US 8'];
    if (Array.isArray(product.sizes)) return product.sizes;
    return String(product.sizes).split(',').map((s) => s.trim()).filter(Boolean);
  };

  const getInitialColors = () => {
    if (!product || !product.colors || !Array.isArray(product.colors) || product.colors.length === 0) {
      return ['Pure 925 Silver', '18K Yellow Gold', '18K Rose Gold'];
    }
    return product.colors.map((c) => (typeof c === 'string' ? c : c.name));
  };

  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || `SHV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    slug: product?.slug || '',
    category: (product?.category || categories[0]?.slug || 'rings').toLowerCase(),
    collection: product?.collection || 'Atelier Signature',
    price: product?.price || '',
    originalPrice: product?.originalPrice || '',
    makingCharges: product?.makingCharges || 450,
    metalType: product?.metalType || product?.material || METAL_TYPES[0],
    metalPurity: product?.metalPurity || 'BIS Hallmarked 925 Pure Silver',
    metalWeight: product?.metalWeight || '4.85 g',
    stone: product?.stone || GEMSTONE_TYPES[0],
    stoneCarat: product?.stoneCarat || '1.50 CT DEW',
    finish: product?.finish || FINISH_TYPES[0],
    dimensions: product?.dimensions || 'Motif: 12mm x 8mm • Band: 2.2mm',
    description: product?.description || 'Individually cast in certified 925 sterling silver and finished with mirror platinum rhodium plating.',
    careInstructions: product?.careInstructions || 'Keep away from moisture, chlorine, and perfumes. Wipe with complimentary microfibre cloth.',
    inStock: product ? product.inStock !== false : true,
    stockCount: product?.stockCount || 24,
    bestseller: Boolean(product?.bestseller),
    featured: Boolean(product?.featured),
    badge: product?.badge || (product?.bestseller ? 'Bestseller' : 'Atelier Edit'),
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  // Variant state: array of { color, images, sizes: [{ size, sku, price, stock }] }
  const getInitialVariants = () => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    return [];
  };

  const [images, setImages] = useState(getInitialImages());
  const [sizes, setSizes] = useState(getInitialSizes());
  const [colors, setColors] = useState(getInitialColors());
  const [variants, setVariants] = useState(getInitialVariants());
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [previewHover, setPreviewHover] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  // Add a new variant
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: `Color ${prev.length + 1}`, images: [], sizes: [{ size: '7', sku: '', price: Number(formData.price) || 0, stock: 10 }] },
    ]);
    setActiveVariantIdx(variants.length);
  };

  const handleRemoveVariant = (idx) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    setActiveVariantIdx(Math.max(0, idx - 1));
  };

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const handleVariantSizeChange = (varIdx, sizeIdx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== varIdx) return v;
        const newSizes = v.sizes.map((s, si) => (si === sizeIdx ? { ...s, [field]: value } : s));
        return { ...v, sizes: newSizes };
      })
    );
  };

  const handleAddVariantSize = (varIdx) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== varIdx) return v;
        return { ...v, sizes: [...v.sizes, { size: '', sku: '', price: Number(formData.price) || 0, stock: 10 }] };
      })
    );
  };

  const handleRemoveVariantSize = (varIdx, sizeIdx) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== varIdx) return v;
        return { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIdx) };
      })
    );
  };

  const handleAddVariantImage = (varIdx, url) => {
    if (!url.trim()) return;
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== varIdx) return v;
        return { ...v, images: [...v.images, url.trim()] };
      })
    );
  };

  const handleRemoveVariantImage = (varIdx, imgIdx) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== varIdx) return v;
        return { ...v, images: v.images.filter((_, ii) => ii !== imgIdx) };
      })
    );
  };

  const handleVariantDeviceFiles = async (varIdx, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const compressedUrls = await processMultipleImageFiles(files, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
      });
      if (compressedUrls.length > 0) {
        setVariants((prev) =>
          prev.map((v, i) => {
            if (i !== varIdx) return v;
            return { ...v, images: [...(v.images || []), ...compressedUrls] };
          })
        );
      }
    } catch (err) {
      console.error('Variant device image upload error:', err);
    }
  };

  // Auto generate slug if empty
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      metaTitle: prev.metaTitle || `${name} | Shveraa 925 Silver`,
    }));
  };

  // Device File Upload Handler (Multiple Images + Canvas Compression)
  const handleDeviceFiles = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingUpload(true);
    setUploadMessage(`Processing & optimizing ${files.length} photo(s) from device...`);

    try {
      const compressedUrls = await processMultipleImageFiles(files, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
      });

      if (compressedUrls.length > 0) {
        setImages((prev) => [...prev, ...compressedUrls]);
        setUploadMessage(`Successfully imported ${compressedUrls.length} image(s).`);
        setTimeout(() => setUploadMessage(''), 4000);
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadMessage('Error processing device images. Please try again.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsProcessingUpload(true);
      setUploadMessage(`Optimizing ${e.dataTransfer.files.length} dropped photo(s)...`);
      try {
        const compressedUrls = await processMultipleImageFiles(e.dataTransfer.files, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85,
        });
        if (compressedUrls.length > 0) {
          setImages((prev) => [...prev, ...compressedUrls]);
          setUploadMessage(`Successfully added ${compressedUrls.length} photo(s).`);
          setTimeout(() => setUploadMessage(''), 4000);
        }
      } catch (err) {
        console.error('Drop upload error:', err);
      } finally {
        setIsProcessingUpload(false);
      }
    }
  };

  // Image actions: Set as Primary (index 0), Set as Hover (index 1), Remove
  const setAsPrimaryImage = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const setAsHoverImage = (index) => {
    if (index === 1 || prevImagesLength() < 2) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      // insert at index 1
      copy.splice(1, 0, item);
      return copy;
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const prevImagesLength = () => images.length;

  const autoGenerateVariantsFromSelections = (currentColors, currentSizes) => {
    const defaultPrice = Number(formData.price) || 0;
    const defaultStock = Number(formData.stockCount) || 10;
    const baseSku = formData.sku || 'SHV';

    setVariants((prevVariants) => {
      return currentColors.map((colorName) => {
        const existingVar = prevVariants.find((v) => v.color?.toLowerCase() === colorName.toLowerCase());
        const sizeObjs = currentSizes.map((sz) => {
          const existingSz = existingVar?.sizes?.find((s) => (typeof s === 'object' ? s.size : s) === sz);
          if (existingSz && typeof existingSz === 'object') {
            return existingSz;
          }
          const colorChar = colorName.charAt(0).toUpperCase();
          return {
            size: sz,
            sku: `${baseSku}-${colorChar}-${sz}`,
            price: defaultPrice,
            stock: defaultStock,
          };
        });

        return {
          color: colorName,
          images: existingVar?.images || [],
          sizes: sizeObjs,
        };
      });
    });
  };

  // Toggle Size selection with auto-variant update
  const toggleSize = (size) => {
    const nextSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    setSizes(nextSizes);
    autoGenerateVariantsFromSelections(colors, nextSizes);
  };

  const handleAddCustomSize = (e) => {
    e.preventDefault();
    if (customSizeInput.trim() && !sizes.includes(customSizeInput.trim())) {
      const nextSizes = [...sizes, customSizeInput.trim()];
      setSizes(nextSizes);
      setCustomSizeInput('');
      autoGenerateVariantsFromSelections(colors, nextSizes);
    }
  };

  // Toggle Color Variation selection with auto-variant update
  const toggleColor = (colorName) => {
    if (colors.includes(colorName)) {
      if (colors.length === 1) {
        alert('Product must have at least one metal color variation.');
        return;
      }
      const nextColors = colors.filter((c) => c !== colorName);
      setColors(nextColors);
      autoGenerateVariantsFromSelections(nextColors, sizes);
    } else {
      const nextColors = [...colors, colorName];
      setColors(nextColors);
      autoGenerateVariantsFromSelections(nextColors, sizes);
    }
  };


  // Save product - calls real API
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in Product Name and Selling Price.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: formData.description,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || (Number(formData.price) * 1.3).toFixed(0)),
      category: formData.category,
      material: formData.metalType,
      stone: formData.stone,
      finish: formData.finish,
      badge: formData.badge,
      images: images.length > 0 ? images : [SAMPLE_JEWELRY_IMAGES[0]],
      featured: Boolean(formData.featured),
      bestseller: Boolean(formData.bestseller),
      inStock: Boolean(formData.inStock),
      variants: variants,
      // Legacy support for old UI
      sizes: sizes.length > 0 ? sizes : ['Standard'],
      colors: colors.length > 0 ? colors : ['Pure 925 Silver'],
    };

    try {
      let savedProduct;
      if (product?._id) {
        const res = await apiAdminUpdateProduct(product._id, payload);
        savedProduct = res.product;
      } else {
        const res = await apiAdminAddProduct(payload);
        savedProduct = res.product;
      }
      // Also update localStorage for immediate reactivity
      saveProduct({ ...payload, _id: savedProduct?._id || product?._id || ('prod_shv_' + Date.now()) });
      setSaveSuccess(true);
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess(savedProduct || payload);
        else if (onBack) onBack();
      }, 600);
    } catch (err) {
      setApiError(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (product && window.confirm(`Permanently delete "${product.name}" from the atelier catalog?`)) {
      try {
        if (product._id) await apiAdminDeleteProduct(product._id);
        deleteProduct(product._id || product.slug);
        if (onBack) onBack();
      } catch (err) {
        setApiError(err.message || 'Delete failed');
      }
    }
  };

  // Computed discount
  const discountPercent =
    formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
      ? Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)
      : null;

  return (
    <div className="shv-product-editor-page">
      {/* Top Action & Breadcrumb Header */}
      <div className="shv-editor-header">
        <div className="shv-editor-header-left">
          <button
            type="button"
            onClick={onBack}
            className="shv-editor-back-btn"
            title="Back to Product Inventory"
          >
            <ArrowLeft size={17} />
            <span>Back to Products</span>
          </button>
          <div className="shv-editor-title-group">
            <h1 className="shv-editor-main-title">
              {isEditing ? `Edit Piece: ${formData.name || 'Untitled'}` : 'New 925 Silver Masterpiece'}
            </h1>
            <span className="shv-editor-badge-mode">
              {isEditing ? 'Editing Mode' : 'Atelier Creation Studio'}
            </span>
          </div>
        </div>

        <div className="shv-editor-header-actions">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="shv-editor-delete-btn"
              title="Delete this piece"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="shv-editor-discard-btn"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={saveSuccess}
            className="shv-editor-save-btn"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={18} />
                <span>Piece Published!</span>
              </>
            ) : (
              <>
                <Save size={17} />
                <span>Save &amp; Publish Piece</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <form onSubmit={handleFormSubmit} className="shv-editor-layout-grid">
        {/* Left Form Area */}
        <div className="shv-editor-form-col">
          {/* SECTION 1: CORE IDENTIFICATION */}
          <div className="shv-editor-card">
            <div className="shv-editor-card-header">
              <div className="shv-editor-card-icon">
                <Sparkles size={17} />
              </div>
              <div>
                <h2 className="shv-editor-card-title">Piece Identification &amp; Merchandising</h2>
                <p className="shv-editor-card-subtitle">General details visible in the boutique collection.</p>
              </div>
            </div>

            <div className="shv-editor-fields-grid">
              <div className="shv-field full-width">
                <label>Jewellery Piece Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Lumina Solitaire Moissanite Ring 925"
                  required
                />
              </div>

              <div className="shv-field half-width">
                <label>SKU / Atelier Reference</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SHV-RNG-925-01"
                />
              </div>

              <div className="shv-field half-width">
                <label>URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="lumina-solitaire-moissanite-ring-925"
                />
              </div>

              <div className="shv-field half-width">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat.slug || cat.id} value={(cat.slug || cat.id).toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="shv-field half-width">
                <label>Collection / Theme</label>
                <input
                  type="text"
                  value={formData.collection}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  placeholder="Bridal 2026 / Signature Muses"
                />
              </div>

              <div className="shv-field half-width">
                <label>Promotional Badge</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Bestseller / Atelier Edit / New"
                />
              </div>

              <div className="shv-field half-width" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingTop: '1.4rem' }}>
                <label className="shv-editor-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.bestseller}
                    onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
                  />
                  <span>Feature in Bestsellers</span>
                </label>

                <label className="shv-editor-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>
              </div>
            </div>
          </div>



          {/* SECTION 3: JEWELLERY METALLURGY & CRAFTSMANSHIP SPECIFICATIONS */}
          <div className="shv-editor-card">
            <div className="shv-editor-card-header">
              <div className="shv-editor-card-icon">
                <Shield size={17} />
              </div>
              <div>
                <h2 className="shv-editor-card-title">Silver Metallurgy &amp; Gemstone Specs</h2>
                <p className="shv-editor-card-subtitle">
                  Critical details for pure 925 silver certification and luxury customer trust.
                </p>
              </div>
            </div>

            <div className="shv-editor-fields-grid">
              <div className="shv-field half-width">
                <label>Precious Metal Type</label>
                <select
                  value={formData.metalType}
                  onChange={(e) => setFormData({ ...formData, metalType: e.target.value })}
                >
                  {METAL_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="shv-field half-width">
                <label>Hallmark &amp; Purity Stamp</label>
                <input
                  type="text"
                  value={formData.metalPurity}
                  onChange={(e) => setFormData({ ...formData, metalPurity: e.target.value })}
                  placeholder="BIS Hallmarked 925 Pure Silver"
                />
              </div>

              <div className="shv-field half-width">
                <label>Net Metal Weight</label>
                <input
                  type="text"
                  value={formData.metalWeight}
                  onChange={(e) => setFormData({ ...formData, metalWeight: e.target.value })}
                  placeholder="e.g. 4.85 g"
                />
              </div>

              <div className="shv-field half-width">
                <label>Plating &amp; Protective Finish</label>
                <select
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                >
                  {FINISH_TYPES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="shv-field half-width">
                <label>Gemstone / Diamond Type</label>
                <select
                  value={formData.stone}
                  onChange={(e) => setFormData({ ...formData, stone: e.target.value })}
                >
                  {GEMSTONE_TYPES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="shv-field half-width">
                <label>Gemstone Carat / Dimensions</label>
                <input
                  type="text"
                  value={formData.stoneCarat}
                  onChange={(e) => setFormData({ ...formData, stoneCarat: e.target.value })}
                  placeholder="1.50 CT DEW • VVS1 Round Cut"
                />
              </div>

              <div className="shv-field full-width">
                <label>Physical Dimensions &amp; Fit</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="Chain: 16 inches + 2 inch extension • Pendant: 14mm x 9mm"
                />
              </div>

              {/* Sizes Available */}
              <div className="shv-field full-width">
                <label>Available Sizes &amp; Fit Options</label>
                <div className="shv-editor-chips-wrap">
                  {PRESET_SIZES.map((sz) => {
                    const isSelected = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`shv-size-chip ${isSelected ? 'active' : ''}`}
                      >
                        {isSelected && <Check size={13} />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="shv-editor-custom-size-group">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Custom size (e.g. 2.4 Bangle, 18cm Bracelet)"
                  />
                  <button type="button" onClick={handleAddCustomSize} className="shv-size-add-btn">
                    <Plus size={14} />
                    <span>Add Size</span>
                  </button>
                </div>
              </div>

              {/* Metal / Color Variations Available */}
              <div className="shv-field full-width">
                <label>Available Metal &amp; Color Variations</label>
                <div className="shv-editor-chips-wrap">
                  {JEWELRY_COLORS.map((col) => {
                    const isSelected = colors.includes(col.name);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleColor(col.name)}
                        className={`shv-size-chip ${isSelected ? 'active' : ''}`}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: col.gradient || col.hex,
                            border: `1px solid ${col.border || '#ccc'}`,
                            marginRight: '6px',
                            verticalAlign: 'middle',
                          }}
                        />
                        {isSelected && <Check size={13} />}
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Select all finishes available for this piece. Customers can toggle between these on both the card and detail page.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: PRICING, MAKING CHARGES & INVENTORY */}
          <div className="shv-editor-card">
            <div className="shv-editor-card-header">
              <div className="shv-editor-card-icon">
                <DollarSign size={17} />
              </div>
              <div>
                <h2 className="shv-editor-card-title">Commercials &amp; Inventory</h2>
                <p className="shv-editor-card-subtitle">Selling prices, compare-at MRP and stock controls.</p>
              </div>
            </div>

            <div className="shv-editor-fields-grid">
              <div className="shv-field half-width">
                <label>Selling Price (₹) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="3499"
                  required
                />
              </div>

              <div className="shv-field half-width">
                <label>Compare-at MRP (₹)</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="4999"
                />
                {discountPercent && (
                  <span className="shv-field-helper success">
                    {discountPercent}% Off badge will be displayed
                  </span>
                )}
              </div>

              <div className="shv-field half-width">
                <label>Artisan Making Charges (₹ included)</label>
                <input
                  type="number"
                  value={formData.makingCharges}
                  onChange={(e) => setFormData({ ...formData, makingCharges: e.target.value })}
                  placeholder="450"
                />
              </div>

              <div className="shv-field half-width">
                <label>Stock Count (units)</label>
                <input
                  type="number"
                  value={formData.stockCount}
                  onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                  placeholder="24"
                />
              </div>

              <div className="shv-field full-width">
                <label className="shv-editor-checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <div>
                    <span className="toggle-title">Piece Available for Purchase (In Stock)</span>
                    <span className="toggle-desc">When disabled, customer sees 'Sold Out / Made to Order' badge.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 4B: COLOR & SIZE VARIANTS STUDIO (DYNAMIC VARIANTS) */}
          <div className="shv-editor-card" style={{ border: '2px solid #E5C158' }}>
            <div className="shv-editor-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="shv-editor-card-icon" style={{ background: '#FFF9E6', color: '#B8860B' }}>
                  <Layers size={17} />
                </div>
                <div>
                  <h2 className="shv-editor-card-title">Color &amp; Size Variants Studio (Dynamic Variants)</h2>
                  <p className="shv-editor-card-subtitle">
                    Configure per-color images, size SKUs, dynamic pricing and inventory per color finish (Gold, Rose Gold, Silver).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="shv-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>Add Color Variant</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#FAF9F6', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                <Layers size={32} color="#94A3B8" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>No Color Variants Created Yet</p>
                <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1rem' }}>
                  Click below to create color variants like "Gold", "Rose Gold", or "Silver" with specific photos, sizes, SKUs, and dynamic prices.
                </p>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="shv-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={15} />
                  <span>Create First Color Variant</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Variant Tabs Header */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                  {variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveVariantIdx(idx)}
                      style={{
                        padding: '0.5rem 1rem',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: activeVariantIdx === idx ? '2px solid #1E293B' : '1px solid #CBD5E1',
                        background: activeVariantIdx === idx ? '#1E293B' : '#FFF',
                        color: activeVariantIdx === idx ? '#FFF' : '#334155',
                      }}
                    >
                      🎨 {v.color || `Variant #${idx + 1}`} ({v.images?.length || 0} photos, {v.sizes?.length || 0} sizes)
                    </button>
                  ))}
                </div>

                {/* Active Variant Editor */}
                {variants[activeVariantIdx] && (
                  <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '400px' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', whiteSpace: 'nowrap' }}>
                          Color Name:
                        </label>
                        <input
                          type="text"
                          value={variants[activeVariantIdx].color}
                          onChange={(e) => handleVariantChange(activeVariantIdx, 'color', e.target.value)}
                          placeholder="e.g. Gold, Rose Gold, Pure Silver"
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.9rem', width: '100%' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(activeVariantIdx)}
                        style={{ color: '#EF4444', background: '#FEE2E2', border: 'none', padding: '0.45rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Trash2 size={14} />
                        <span>Delete Variant</span>
                      </button>
                    </div>

                    {/* PER-COLOR IMAGES (DEVICE UPLOAD ONLY) */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ImageIcon size={16} color="#A07E52" />
                          <span>Photos for "{variants[activeVariantIdx].color}" Finish</span>
                        </label>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {(variants[activeVariantIdx].images || []).length} photo(s) uploaded
                        </span>
                      </div>

                      {/* Device Photo Upload Dropzone */}
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '1.25rem 1rem',
                          border: '2px dashed #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          cursor: 'pointer',
                          marginBottom: '1rem',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Upload size={22} color="#0F172A" />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                          Click to Select &amp; Upload Device Photos for "{variants[activeVariantIdx].color}"
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                          Select JPG, PNG, WEBP files from your computer or phone. Photos optimize automatically.
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleVariantDeviceFiles(activeVariantIdx, e)}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {/* Live Thumbnail Previews for Active Variant */}
                      {(variants[activeVariantIdx].images || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', background: '#FFF9E6', borderRadius: '6px', border: '1px solid #FEF08A' }}>
                          <p style={{ fontSize: '0.82rem', color: '#854D0E', margin: 0 }}>
                            📷 No photos uploaded yet for <strong>{variants[activeVariantIdx].color}</strong>. Click above to upload from your device.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {(variants[activeVariantIdx].images || []).map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              style={{
                                position: 'relative',
                                width: '90px',
                                height: '90px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid #CBD5E1',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Variant ${variants[activeVariantIdx].color} Photo ${imgIdx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  background: imgIdx === 0 ? 'rgba(15,23,42,0.85)' : 'rgba(100,116,139,0.85)',
                                  color: '#FFF',
                                  fontSize: '0.62rem',
                                  padding: '2px 4px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                {imgIdx === 0 ? 'Main Hero' : imgIdx === 1 ? 'Hover Flip' : `#${imgIdx + 1}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantImage(activeVariantIdx, imgIdx)}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  background: 'rgba(239,68,68,0.9)',
                                  color: '#FFF',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                                title="Remove photo"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* PER-COLOR SIZES & DYNAMIC PRICING TABLE */}
                    <div style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <DollarSign size={15} color="#10B981" />
                          <span>Sizes, SKUs, Dynamic Prices &amp; Stock for "{variants[activeVariantIdx].color}"</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddVariantSize(activeVariantIdx)}
                          className="shv-size-add-btn"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                        >
                          <Plus size={13} />
                          <span>Add Size Option</span>
                        </button>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#F1F5F9', textAlign: 'left', color: '#475569' }}>
                              <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #CBD5E1' }}>Size</th>
                              <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #CBD5E1' }}>SKU Code</th>
                              <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #CBD5E1' }}>Price (₹)</th>
                              <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #CBD5E1' }}>Stock Units</th>
                              <th style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #CBD5E1', width: '50px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(variants[activeVariantIdx].sizes || []).map((szObj, sizeIdx) => (
                              <tr key={sizeIdx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <td style={{ padding: '0.4rem 0.75rem' }}>
                                  <input
                                    type="text"
                                    value={szObj.size}
                                    onChange={(e) => handleVariantSizeChange(activeVariantIdx, sizeIdx, 'size', e.target.value)}
                                    placeholder="e.g. 6, 7, 8"
                                    style={{ width: '80px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                  />
                                </td>
                                <td style={{ padding: '0.4rem 0.75rem' }}>
                                  <input
                                    type="text"
                                    value={szObj.sku}
                                    onChange={(e) => handleVariantSizeChange(activeVariantIdx, sizeIdx, 'sku', e.target.value)}
                                    placeholder="RING-G-6"
                                    style={{ width: '130px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                  />
                                </td>
                                <td style={{ padding: '0.4rem 0.75rem' }}>
                                  <input
                                    type="number"
                                    value={szObj.price}
                                    onChange={(e) => handleVariantSizeChange(activeVariantIdx, sizeIdx, 'price', Number(e.target.value))}
                                    placeholder="1999"
                                    style={{ width: '100px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                  />
                                </td>
                                <td style={{ padding: '0.4rem 0.75rem' }}>
                                  <input
                                    type="number"
                                    value={szObj.stock}
                                    onChange={(e) => handleVariantSizeChange(activeVariantIdx, sizeIdx, 'stock', Number(e.target.value))}
                                    placeholder="5"
                                    style={{ width: '80px', padding: '0.35rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                                  />
                                </td>
                                <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantSize(activeVariantIdx, sizeIdx)}
                                    style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="Remove size"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 5: STORY, CARE & SEO */}
          <div className="shv-editor-card">
            <div className="shv-editor-card-header">
              <div className="shv-editor-card-icon">
                <Info size={17} />
              </div>
              <div>
                <h2 className="shv-editor-card-title">Atelier Story &amp; Care Guidance</h2>
                <p className="shv-editor-card-subtitle">Descriptive copy for product detail page and Google search.</p>
              </div>
            </div>

            <div className="shv-editor-fields-grid">
              <div className="shv-field full-width">
                <label>Craftsmanship Story &amp; Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="The inspiration, silversmithing process, and tactile feeling of this piece..."
                />
              </div>

              <div className="shv-field full-width">
                <label>Silver Care Instructions</label>
                <input
                  type="text"
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  placeholder="Avoid direct spray of perfumes. Store in the complimentary airtight velvet box."
                />
              </div>

              <div className="shv-field half-width">
                <label>SEO Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="Lumina Solitaire Ring | Pure 925 Silver Jewellery"
                />
              </div>

              <div className="shv-field half-width">
                <label>SEO Meta Description</label>
                <input
                  type="text"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Handcrafted in certified 925 sterling silver with mirror rhodium lustre..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Preview Column */}
        <div className="shv-editor-preview-col">
          <div className="shv-editor-sticky-card">
            <div className="shv-preview-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={16} />
                <span className="shv-preview-label">Live Storefront Card Preview</span>
              </div>
              <span className="shv-preview-hint">Hover mouse to test 2nd image flip!</span>
            </div>

            {/* Realistic Product Card Preview */}
            <div
              className="shv-preview-product-card"
              onMouseEnter={() => setPreviewHover(true)}
              onMouseLeave={() => setPreviewHover(false)}
            >
              {/* Image Container with hover flip */}
              <div className="shv-preview-image-wrap">
                <img
                  src={
                    previewHover && (variants[activeVariantIdx]?.images?.[1] || images[1])
                      ? (variants[activeVariantIdx]?.images?.[1] || images[1])
                      : (variants[activeVariantIdx]?.images?.[0] || images[0] || SAMPLE_JEWELRY_IMAGES[0])
                  }
                  alt={formData.name || 'Product Preview'}
                  className="shv-preview-img"
                />

                {/* Badges */}
                <div className="shv-preview-badges">
                  {formData.badge && (
                    <span className="shv-preview-badge-gold">{formData.badge}</span>
                  )}
                  {discountPercent && (
                    <span className="shv-preview-badge-disc">-{discountPercent}%</span>
                  )}
                  {!formData.inStock && (
                    <span className="shv-preview-badge-sold">Sold Out</span>
                  )}
                </div>

                <div className="shv-preview-hallmark-tag">
                  <Shield size={11} />
                  <span>925 Hallmarked</span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="shv-preview-meta">
                <div className="shv-preview-category">
                  {formData.category?.toUpperCase()} • {formData.metalWeight || '4.8g'}
                </div>
                <h3 className="shv-preview-name">
                  {formData.name || 'Untitled Silver Masterpiece'}
                </h3>
                <div className="shv-preview-material">
                  {formData.metalType}
                </div>

                <div className="shv-preview-pricing">
                  <span className="shv-preview-price">
                    ₹{Number(formData.price || 0).toLocaleString('en-IN')}
                  </span>
                  {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                    <span className="shv-preview-mrp">
                      ₹{Number(formData.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Available Color Swatches in Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '8px 0' }}>
                  {colors.map((cName) => {
                    const colObj = JEWELRY_COLORS.find((jc) => jc.name === cName) || { hex: '#DDE2E8' };
                    return (
                      <span
                        key={cName}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: colObj.gradient || colObj.hex,
                          border: `1px solid ${colObj.border || '#cbd5e1'}`,
                          display: 'inline-block',
                        }}
                        title={cName}
                      />
                    );
                  })}
                  <span style={{ fontSize: '0.74rem', color: '#64748B', marginLeft: '4px' }}>
                    {colors.length} Metal{colors.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="shv-preview-sizes">
                  <span>Sizes:</span>
                  {sizes.slice(0, 4).map((s) => (
                    <span key={s} className="shv-preview-size-tag">{s}</span>
                  ))}
                  {sizes.length > 4 && <span className="shv-preview-size-tag">+{sizes.length - 4}</span>}
                </div>
              </div>
            </div>

            {/* Quick Helper Summary Box */}
            <div className="shv-preview-summary-box">
              <div className="shv-summary-row">
                <span>SKU:</span>
                <strong>{formData.sku}</strong>
              </div>
              <div className="shv-summary-row">
                <span>Total Photos:</span>
                <strong>{images.length} images</strong>
              </div>
              <div className="shv-summary-row">
                <span>Inventory:</span>
                <strong className={formData.inStock ? 'text-green' : 'text-red'}>
                  {formData.inStock ? `${formData.stockCount} in stock` : 'Out of Stock'}
                </strong>
              </div>
              <div className="shv-summary-row">
                <span>Gemstone:</span>
                <strong style={{ maxWidth: '180px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formData.stone}
                </strong>
              </div>
            </div>

            {/* Bottom Save Action in Preview Column */}
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={saveSuccess}
              className="shv-preview-save-btn"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Published to Storefront!</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Masterpiece</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEditor;

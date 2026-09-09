// Central Reactive Store Engine for Shveraa Fine Jewellery
// Coordinates Categories, Products, Coupons, Orders, and CMS Settings between Admin & Storefront
import { useState, useEffect } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES, ALL_CATEGORIES, FALLBACK_PRODUCTS } from './api';
import { DEFAULT_ADMIN_ORDERS } from '../admin/adminData';

const STORAGE_KEYS = {
  CATEGORIES: 'shveraa_dyn_categories',
  PRODUCTS: 'shveraa_dyn_products',
  COUPONS: 'shveraa_dyn_coupons',
  SETTINGS: 'shveraa_dyn_settings',
  ORDERS: 'shveraa_orders',
};

const STORE_EVENT = 'shveraa_store_updated';

// Helper: Dispatch global update event
const notifyStoreUpdated = (type, payload) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { type, payload } }));
  }
};

// Initial default coupons
const INITIAL_COUPONS = [
  {
    code: 'SHVERAA20',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 999,
    description: '20% off on your debut 925 silver heirloom piece',
    isActive: true,
  },
  {
    code: 'ATELIER500',
    discountType: 'flat',
    discountValue: 500,
    minSpend: 2999,
    description: 'Flat ₹500 off on festive orders above ₹2,999',
    isActive: true,
  },
  {
    code: 'FREESHIP',
    discountType: 'shipping',
    discountValue: 100,
    minSpend: 0,
    description: 'Complimentary Insured Air Express delivery',
    isActive: true,
  },
];

// Initial default CMS settings
const INITIAL_SETTINGS = {
  announcementText: 'Code SHVERAA20 for 20% off your debut atelier piece • Complimentary Insured Air Express > ₹999',
  announcementEnabled: true,
  hallmarkStampText: 'Laser Tested 100% Pure 925 Sterling Silver & BIS Certified',
  conciergePhone: '+91 98765 43210',
  conciergeEmail: 'concierge@shveraa.luxury',
  currency: '₹',
  freeShippingMin: 999,
};

/* ==========================================================================
   CATEGORIES CRUD
   ========================================================================== */
export const getCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(ALL_CATEGORIES));
      return ALL_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(ALL_CATEGORIES));
      return ALL_CATEGORIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading categories from store:', err);
    return ALL_CATEGORIES;
  }
};

export const saveCategory = (categoryData) => {
  try {
    const current = getCategories();
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingIdx = current.findIndex((c) => c.slug === slug || c.id === categoryData.id);

    let updated;
    if (existingIdx !== -1) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...categoryData, slug };
    } else {
      const newCat = {
        id: slug,
        slug,
        name: categoryData.name,
        subtitle: categoryData.subtitle || '925 Silver Adornments',
        image: categoryData.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
        itemCount: '0 designs',
        ...categoryData,
      };
      updated = [newCat, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    notifyStoreUpdated('CATEGORIES_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error saving category:', err);
    return getCategories();
  }
};

export const deleteCategory = (slugOrId) => {
  try {
    const current = getCategories();
    const updated = current.filter((c) => c.slug !== slugOrId && c.id !== slugOrId);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    notifyStoreUpdated('CATEGORIES_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error deleting category:', err);
    return getCategories();
  }
};

/* ==========================================================================
   PRODUCTS CRUD
   ========================================================================== */
export const getProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(FALLBACK_PRODUCTS));
      return FALLBACK_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(FALLBACK_PRODUCTS));
      return FALLBACK_PRODUCTS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading products from store:', err);
    return FALLBACK_PRODUCTS;
  }
};

export const getProductByIdOrSlug = (idOrSlug) => {
  const all = getProducts();
  return (
    all.find((p) => p._id === idOrSlug || p.slug === idOrSlug) ||
    all[0]
  );
};

export const saveProduct = (productData) => {
  try {
    const current = getProducts();
    const id = productData._id || 'prod_shv_' + Date.now();
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const existingIdx = current.findIndex((p) => p._id === id || p.slug === slug);

    let updated;
    if (existingIdx !== -1) {
      updated = [...current];
      updated[existingIdx] = {
        ...updated[existingIdx],
        ...productData,
        _id: id,
        slug,
      };
    } else {
      const newProduct = {
        _id: id,
        slug,
        name: productData.name,
        description: productData.description || 'Cast in certified 925 sterling silver with high-luster rhodium plating.',
        price: Number(productData.price),
        originalPrice: Number(productData.originalPrice || productData.price * 1.3),
        category: (productData.category || 'rings').toLowerCase(),
        images: productData.images || [productData.image],
        material: productData.material || '925 Sterling Silver & Platinum Rhodium',
        stone: productData.stone || 'AAAAA Moissanite',
        finish: productData.finish || 'Mirror Platinum Polish',
        sizes: productData.sizes || ['US 5', 'US 6', 'US 7', 'US 8', 'US 9'],
        inStock: productData.inStock !== false,
        featured: Boolean(productData.featured),
        bestseller: Boolean(productData.bestseller),
        rating: productData.rating || 4.9,
        reviewsCount: productData.reviewsCount || 12,
        badge: productData.badge || (productData.bestseller ? 'Bestseller' : 'Atelier Edit'),
      };
      updated = [newProduct, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    notifyStoreUpdated('PRODUCTS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error saving product:', err);
    return getProducts();
  }
};

export const deleteProduct = (idOrSlug) => {
  try {
    const current = getProducts();
    const updated = current.filter((p) => p._id !== idOrSlug && p.slug !== idOrSlug);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    notifyStoreUpdated('PRODUCTS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error deleting product:', err);
    return getProducts();
  }
};

export const toggleProductStock = (idOrSlug) => {
  try {
    const current = getProducts();
    const updated = current.map((p) => {
      if (p._id === idOrSlug || p.slug === idOrSlug) {
        return { ...p, inStock: !p.inStock };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    notifyStoreUpdated('PRODUCTS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error toggling product stock:', err);
    return getProducts();
  }
};

/* ==========================================================================
   COUPONS & PROMOTIONS CRUD
   ========================================================================== */
export const getCoupons = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading coupons:', err);
    return INITIAL_COUPONS;
  }
};

export const saveCoupon = (couponData) => {
  try {
    const current = getCoupons();
    const code = couponData.code.trim().toUpperCase();
    const idx = current.findIndex((c) => c.code === code);

    let updated;
    if (idx !== -1) {
      updated = [...current];
      updated[idx] = { ...updated[idx], ...couponData, code };
    } else {
      updated = [{ ...couponData, code, isActive: true }, ...current];
    }

    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated));
    notifyStoreUpdated('COUPONS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error saving coupon:', err);
    return getCoupons();
  }
};

export const deleteCoupon = (code) => {
  try {
    const current = getCoupons();
    const updated = current.filter((c) => c.code !== code.toUpperCase());
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(updated));
    notifyStoreUpdated('COUPONS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error deleting coupon:', err);
    return getCoupons();
  }
};

export const validateCoupon = (code, cartSubtotal) => {
  const coupons = getCoupons();
  const found = coupons.find((c) => c.code.toUpperCase() === code?.trim()?.toUpperCase());

  if (!found) {
    return { valid: false, message: 'Invalid or unrecognized atelier coupon code.' };
  }
  if (!found.isActive) {
    return { valid: false, message: 'This promotion code has expired or is inactive.' };
  }
  if (found.minSpend && cartSubtotal < found.minSpend) {
    return {
      valid: false,
      message: `Requires minimum spend of ₹${found.minSpend.toLocaleString('en-IN')}. (Current: ₹${cartSubtotal.toLocaleString('en-IN')})`,
    };
  }

  let discountAmount = 0;
  if (found.discountType === 'percentage') {
    discountAmount = Math.round((cartSubtotal * found.discountValue) / 100);
  } else if (found.discountType === 'flat') {
    discountAmount = Math.min(found.discountValue, cartSubtotal);
  }

  return {
    valid: true,
    code: found.code,
    discountAmount,
    description: found.description,
    message: `Promotion code ${found.code} successfully applied!`,
  };
};

/* ==========================================================================
   CMS SETTINGS CRUD
   ========================================================================== */
export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading settings:', err);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  try {
    const updated = { ...getSettings(), ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyStoreUpdated('SETTINGS_UPDATED', updated);
    return updated;
  } catch (err) {
    console.error('Error saving settings:', err);
    return getSettings();
  }
};

/* ==========================================================================
   CUSTOM REACT HOOK: useDynamicStore
   Subscribes to global store updates & re-renders components reactively
   ========================================================================== */
export const useDynamicStore = () => {
  const [categories, setCategories] = useState(getCategories);
  const [products, setProducts] = useState(getProducts);
  const [coupons, setCoupons] = useState(getCoupons);
  const [settings, setSettings] = useState(getSettings);

  const refreshStore = () => {
    setCategories(getCategories());
    setProducts(getProducts());
    setCoupons(getCoupons());
    setSettings(getSettings());
  };

  useEffect(() => {
    const handleUpdate = () => refreshStore();
    window.addEventListener(STORE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(STORE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    categories,
    products,
    coupons,
    settings,
    refreshStore,
  };
};

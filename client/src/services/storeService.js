// Central Reactive Store Engine for Shveraa Fine Jewellery
// Coordinates Categories, Products, Coupons, Orders, and CMS Settings between Admin & Storefront
import { useState, useEffect } from 'react';
import {
  CATEGORIES as INITIAL_CATEGORIES, ALL_CATEGORIES, FALLBACK_PRODUCTS,
  apiAdminLogin, apiAdminLogout,
  apiAdminGetCategories, apiAdminGetProducts, apiAdminGetCoupons,
  apiGetCategories, apiGetProducts,
} from './api';

import { DEFAULT_ADMIN_ORDERS } from '../admin/adminData';

if (typeof window !== 'undefined') {
  localStorage.removeItem('shveraa_dyn_products');
  // Coupon data must be sourced from the database, never an old browser cache.
  localStorage.removeItem('shveraa_dyn_coupons');
}

const STORAGE_KEYS = {
  CATEGORIES: 'shveraa_dyn_categories',
  COUPONS: 'shveraa_dyn_coupons',
  SETTINGS: 'shveraa_dyn_settings',
  ORDERS: 'shveraa_orders',
  ADMIN_AUTH: 'shveraa_admin_session',
};

const STORE_EVENT = 'shveraa_store_updated';

// Helper: Dispatch global update event
const notifyStoreUpdated = (type, payload) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { type, payload } }));
  }
};

// Universal Fine 925 Sterling Silver Color & Metal Variation Specifications
export const JEWELRY_COLORS = [
  {
    id: 'silver',
    name: 'Pure 925 Silver',
    shortName: 'Silver',
    hex: '#DDE2E8',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #D4D9E2 50%, #9DA6B2 100%)',
    border: '#CBD5E1',
    badge: 'Mirror Rhodium',
    purity: 'Solid 92.5% Sterling Silver',
    description: 'Triple-dipped platinum-rhodium mirror polish over solid 925 sterling silver for everyday tarnish immunity.',
  },
  {
    id: 'gold',
    name: '18K Yellow Gold',
    shortName: '18K Gold',
    hex: '#E5C158',
    gradient: 'linear-gradient(135deg, #FFF0B3 0%, #E5C158 50%, #B8860B 100%)',
    border: '#D4AF37',
    badge: '18K Vermeil',
    purity: '18K Gold Plated over 925 Silver',
    description: 'Thick 2.5 micron 18K yellow gold vermeil electroplated over solid 925 sterling silver.',
  },
  {
    id: 'rose-gold',
    name: '18K Rose Gold',
    shortName: 'Rose Gold',
    hex: '#E8A598',
    gradient: 'linear-gradient(135deg, #FFE4DE 0%, #E8A598 50%, #B76E79 100%)',
    border: '#C57E70',
    badge: 'Rose Vermeil',
    purity: '18K Rose Gold over 925 Silver',
    description: 'Warm, blush-pink 18K copper-gold alloy vermeil finished with protective anti-tarnish glaze.',
  },
  {
    id: 'oxidised',
    name: 'Vintage Oxidised',
    shortName: 'Oxidised',
    hex: '#4A4E57',
    gradient: 'linear-gradient(135deg, #64748B 0%, #334155 50%, #0F172A 100%)',
    border: '#333A44',
    badge: 'Antique Patina',
    purity: 'Blackened 925 Silver',
    description: 'Hand-burnished antique gunmetal patina crafted to highlight hand-chiseled artisan engravings.',
  },
];

export const getProductColors = (product) => {
  if (!product) return JEWELRY_COLORS.slice(0, 3);
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return product.colors.map((c) => {
      if (typeof c === 'string') {
        const found = JEWELRY_COLORS.find(
          (jc) =>
            jc.id === c.toLowerCase() ||
            jc.name.toLowerCase() === c.toLowerCase() ||
            jc.shortName.toLowerCase() === c.toLowerCase()
        );
        return (
          found || {
            id: c.toLowerCase().replace(/\s+/g, '-'),
            name: c,
            shortName: c,
            hex: '#C5CBD3',
            gradient: 'linear-gradient(135deg, #FFFFFF 0%, #D4D9E2 100%)',
            border: '#CBD5E1',
            badge: 'Custom Finish',
            purity: 'Certified 925 Silver Base',
            description: `${c} finish on certified 925 sterling silver.`,
          }
        );
      }
      return c;
    });
  }
  const textToCheck = `${product.finish || ''} ${product.description || ''} ${product.material || ''}`.toLowerCase();
  if (textToCheck.includes('oxid') || product.category === 'personalised') {
    return JEWELRY_COLORS;
  }
  return JEWELRY_COLORS.slice(0, 3);
};

// Initial default CMS settings
const INITIAL_SETTINGS = {
  announcementText: 'Code SHVERAA20 for 20% off your debut atelier piece • Complimentary Insured Air Express > ₹999',
  announcements: [
    '✦ Complimentary Insured Express Shipping on Orders Over ₹999',
    '✦ 20% Off Your First Silver Order • Use Code: SHVERAA20',
    '✦ Certified Pure 925 Sterling Silver • Anti-Tarnish Lifetime Warranty',
  ],
  announcementEnabled: true,
  hallmarkStampText: 'Laser Tested 100% Pure 925 Sterling Silver & BIS Certified',
  conciergePhone: '+91 98765 43210',
  conciergeWhatsApp: '+91 98765 43210',
  conciergeEmail: 'concierge@shveraa.luxury',
  atelierAddress: 'Shveraa Heritage Atelier, Luxury Arcade, Mumbai 400001',
  currency: '₹',
  freeShippingMin: 999,
  shippingStandardFee: 100,
  codEnabled: true,
  heroBanner: {
    badge: 'NEW ATELIER COLLECTION 2026',
    title: 'Pure 925 Silver. Pure Emotion.',
    subtitle: 'Handcrafted in BIS certified sterling silver, mirror platinum rhodium and pure light.',
    ctaText: 'Explore Atelier Creations',
    ctaLink: '/shop',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85',
  },
};

/* ==========================================================================
   CATEGORIES CRUD
   ========================================================================== */
export const getCategories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading categories from store:', err);
    return [];
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
   PRODUCTS CRUD (Direct MongoDB DB Driven - No localStorage cache)
   ========================================================================== */
export const getProducts = () => {
  return [];
};

export const getProductByIdOrSlug = (idOrSlug) => {
  return null;
};

export const saveProduct = (productData) => {
  notifyStoreUpdated('PRODUCTS_UPDATED', productData);
  return [];
};

export const deleteProduct = (idOrSlug) => {
  notifyStoreUpdated('PRODUCTS_UPDATED', idOrSlug);
  return [];
};

export const toggleProductStock = (idOrSlug) => {
  notifyStoreUpdated('PRODUCTS_UPDATED', idOrSlug);
  return [];
};

/* ==========================================================================
   COUPONS & PROMOTIONS CRUD
   ========================================================================== */
export const getCoupons = () => {
  // Coupons are loaded from MongoDB by useDynamicStore.
  return [];
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
    discountType: found.discountType,
    discountValue: found.discountValue,
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

  const fetchBackendProducts = async () => {
    try {
      let data = null;
      try {
        data = await apiAdminGetProducts();
      } catch (e) {
        data = await apiGetProducts();
      }
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
        return data.products;
      }
    } catch (err) {
      console.error('Error loading products from DB:', err);
    }
    return [];
  };

  const fetchBackendCoupons = async () => {
    try {
      const data = await apiAdminGetCoupons();
      const dbCoupons = Array.isArray(data?.coupons) ? data.coupons : [];
      setCoupons(dbCoupons);
      return dbCoupons;
    } catch (err) {
      console.error('Error loading coupons from DB:', err);
      setCoupons([]);
      return [];
    }
  };

  const refreshStore = () => {
    setCategories(getCategories());
    setSettings(getSettings());
    fetchBackendProducts();
    fetchBackendCoupons();
  };

  // Fetch from backend API on mount and refresh localStorage cache
  useEffect(() => {
    // Fetch categories from backend
    apiAdminGetCategories()
      .then((data) => {
        if (data?.categories?.length > 0) {
          const cats = data.categories.map((c) => ({
            ...c,
            id: c.slug || c._id,
            slug: c.slug,
          }));
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
          setCategories(cats);
        }
      })
      .catch(() => {
        // Fallback to localStorage / defaults
        apiGetCategories()
          .then((d) => {
            if (d?.categories?.length > 0) {
              setCategories(d.categories.map((c) => ({ ...c, id: c.slug || c._id })));
            }
          })
          .catch(() => {});
      });

    // Fetch products from backend
    fetchBackendProducts();

    // Fetch coupons from backend
    fetchBackendCoupons();
  }, []);

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


/* ==========================================================================
   ADMIN AUTHENTICATION & ACCESS CONTROL
   ========================================================================== */
export const getAdminAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const res = await apiAdminLogin({ email, password });
    if (res?.admin) {
      const adminUser = res.admin;
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(adminUser));
      notifyStoreUpdated('ADMIN_AUTH_CHANGED', adminUser);
      return { success: true, user: adminUser };
    }
    return { success: false, message: res?.message || 'Invalid admin credentials.' };
  } catch (err) {
    return { success: false, message: err.message || 'Admin login failed.' };
  }
};

export const logoutAdmin = async () => {
  await apiAdminLogout();
  localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  notifyStoreUpdated('ADMIN_AUTH_CHANGED', null);
};

export const updateAdminPassword = (newPassword) => {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }
  localStorage.setItem('shveraa_admin_pwd', newPassword);
  return { success: true, message: 'Admin master passphrase successfully updated.' };
};

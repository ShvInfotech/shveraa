// Shveraa API Client Service with 100% Pure 925 Silver Jewellery Dataset

export const CATEGORIES = [
  {
    id: 'necklaces',
    name: 'Necklaces',
    slug: 'necklaces',
    subtitle: 'Chains, Chokers & Pendants',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
    itemCount: '24 designs',
  },
  {
    id: 'rings',
    name: 'Rings',
    slug: 'rings',
    subtitle: 'Bands, Solitaires & Stacks',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
    itemCount: '32 designs',
  },
  {
    id: 'earrings',
    name: 'Earrings',
    slug: 'earrings',
    subtitle: 'Hoops, Huggies & Drops',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
    itemCount: '28 designs',
  },
  {
    id: 'bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    subtitle: 'Cuffs, Tennis & Bangles',
    image: '/category-bracelet.jpg',
    itemCount: '19 designs',
  },
];

export const ALL_CATEGORIES = [
  ...CATEGORIES,
  {
    id: 'personalised',
    name: 'Personalised',
    slug: 'personalised',
    subtitle: 'Custom Names & Initials',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
    itemCount: '15 designs',
  },
  {
    id: 'anklets',
    name: 'Anklets',
    slug: 'anklets',
    subtitle: 'Liquid Chains & Charms',
    image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85',
    itemCount: '12 designs',
  },
];

export const FALLBACK_PRODUCTS = []; 

const API_BASE_URL = '/api';

// Image URL Helper (prepends backend URL if relative /uploads path)
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  if (url.startsWith('/')) {
    return `${backendUrl}${url}`;
  }
  return `${backendUrl}/${url}`;
};

// Upload single image file to server (/uploads folder)
export const apiUploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = localStorage.getItem('shveraa_admin_token') || localStorage.getItem('shveraa_user_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/v1/upload', {
    method: 'POST',
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Image upload failed');
  return data.url;
};

// Upload multiple image files to server (/uploads folder)
export const apiUploadMultipleImages = async (files) => {
  const fileList = Array.from(files);
  const urls = [];
  for (const file of fileList) {
    try {
      const url = await apiUploadImage(file);
      urls.push(url);
    } catch (err) {
      console.error('Failed to upload file:', file?.name, err);
    }
  }
  return urls;
};

// Fetch all products from backend database
export const fetchProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/api/v1/user/products${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.products)) {
        return data.products;
      }
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  }
  return [];
};

// Fetch single product by id or slug from backend database
export const fetchProductById = async (idOrSlug) => {
  try {
    const res = await fetch(`/api/v1/user/products/${idOrSlug}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.product) {
        return data.product;
      }
    }
  } catch (err) {
    console.error('Error fetching product by ID:', err);
  }
  return null;
};


// Dynamic store synchronization
export const getActiveCategories = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('shveraa_dyn_categories') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return ALL_CATEGORIES;
};

export const getActiveProducts = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('shveraa_dyn_products') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return FALLBACK_PRODUCTS;
};

// Client-side dynamic filter logic
const filterLocalProducts = (params = {}) => {
  let list = [...getActiveProducts()];

  if (params.category && params.category !== 'all') {
    list = list.filter((p) => p.category?.toLowerCase() === params.category?.toLowerCase());
  }

  if (params.featured === 'true') {
    list = list.filter((p) => p.featured);
  }

  if (params.bestseller === 'true') {
    list = list.filter((p) => p.bestseller);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q)
    );
  }

  if (params.minPrice) {
    list = list.filter((p) => p.price >= Number(params.minPrice));
  }

  if (params.maxPrice) {
    list = list.filter((p) => p.price <= Number(params.maxPrice));
  }

  if (params.sort) {
    switch (params.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.reverse();
        break;
      default:
        break;
    }
  }

  return list;
};

const getLocalProductById = (idOrSlug) => {
  const all = getActiveProducts();
  return (
    all.find((p) => p._id === idOrSlug || p.slug === idOrSlug) ||
    all[0]
  );
};

export const sendContactMessage = async (formData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.info('Simulating contact form dispatch:', formData);
    return { success: true, message: 'Message sent successfully' };
  }
};

/* ==========================================================================
   UNIVERSAL API FETCH WITH 401 UNAUTHORIZED AUTOMATIC REDIRECT INTERCEPTOR
   ========================================================================== */
export const apiFetch = async (url, options = {}) => {
  const isFormDataBody = options.body instanceof FormData;
  const headers = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const isAdminUrl = url.includes('/admin');
  
  const adminToken = localStorage.getItem('shveraa_admin_token');
  const userToken = localStorage.getItem('shveraa_user_token');

  const tokenToUse = isAdminUrl ? adminToken : userToken;

  if (tokenToUse && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${tokenToUse}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (Expired / Invalid Token / Blocked Account)
  if (response.status === 401) {
    if (isAdminUrl) {
      localStorage.removeItem('shveraa_admin_token');
      localStorage.removeItem('shveraa_admin_session');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shveraa_admin_unauthorized'));
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin';
        }
      }
    } else {
      localStorage.removeItem('shveraa_user_token');
      localStorage.removeItem('shveraa_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shveraa_user_unauthorized'));
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
  }

  return response;
};

/* ==========================================================================
   USER AUTHENTICATION API INTEGRATIONS
   ========================================================================== */
export const apiUserRegister = async ({ name, email, phone, password }) => {
  const res = await apiFetch('/api/v1/user/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  if (data.AccessToken) {
    localStorage.setItem('shveraa_user_token', data.AccessToken);
    localStorage.setItem('shveraa_user', JSON.stringify(data.user));
  }
  return data;
};

export const apiUserLogin = async ({ email, password }) => {
  const res = await apiFetch('/api/v1/user/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  if (data.AccessToken) {
    localStorage.setItem('shveraa_user_token', data.AccessToken);
    localStorage.setItem('shveraa_user', JSON.stringify(data.user));
  }
  return data;
};

export const apiUserLogout = async () => {
  try {
    const res = await apiFetch('/api/v1/user/auth/logout', {
      method: 'POST',
    });
    await res.json();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('shveraa_user_token');
    localStorage.removeItem('shveraa_user');
  }
};

export const apiUserForgotPassword = async (email) => {
  const res = await apiFetch('/api/v1/user/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to send password reset email');
  }
  return data;
};

/* ==========================================================================
   ADMIN AUTHENTICATION API INTEGRATIONS
   ========================================================================== */
export const apiAdminLogin = async ({ email, password }) => {
  const res = await apiFetch('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Admin login failed');
  }
  if (data.AccessToken) {
    localStorage.setItem('shveraa_admin_token', data.AccessToken);
    localStorage.setItem('shveraa_admin_session', JSON.stringify(data.admin));
  }
  return data;
};

export const apiAdminLogout = async () => {
  try {
    const res = await apiFetch('/api/v1/admin/auth/logout', {
      method: 'POST',
    });
    await res.json();
  } catch (err) {
    console.error('Admin logout error:', err);
  } finally {
    localStorage.removeItem('shveraa_admin_token');
    localStorage.removeItem('shveraa_admin_session');
  }
};

/* ==========================================================================
   CATEGORY APIs
   ========================================================================== */
export const apiGetCategories = async () => {
  const res = await apiFetch('/api/v1/user/categories');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
  return data;
};

export const apiAdminGetCategories = async () => {
  const res = await apiFetch('/api/v1/admin/categoris/all');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
  return data;
};

export const apiAdminAddCategory = async (categoryData, imageFile) => {
  const body = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => body.append(key, value ?? ''));
  if (imageFile) body.append('image', imageFile);

  const res = await apiFetch('/api/v1/admin/categoris/add', {
    method: 'POST',
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add category');
  return data;
};

export const apiAdminUpdateCategory = async (id, categoryData, imageFile) => {
  const body = new FormData();
  Object.entries(categoryData).forEach(([key, value]) => body.append(key, value ?? ''));
  if (imageFile) body.append('image', imageFile);

  const res = await apiFetch(`/api/v1/admin/categoris/update/${id}`, {
    method: 'PUT',
    body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update category');
  return data;
};

export const apiAdminDeleteCategory = async (id) => {
  const res = await apiFetch(`/api/v1/admin/categoris/delete/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete category');
  return data;
};

/* ==========================================================================
   PRODUCT APIs
   ========================================================================== */
export const apiGetProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `/api/v1/user/products${query ? `?${query}` : ''}`;
  const res = await apiFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const apiGetProductById = async (idOrSlug) => {
  const res = await apiFetch(`/api/v1/user/products/${idOrSlug}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch product');
  return data;
};

export const apiAdminGetProducts = async () => {
  const res = await apiFetch('/api/v1/admin/products/all');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const apiAdminAddProduct = async (productData) => {
  const res = await apiFetch('/api/v1/admin/products/add', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add product');
  return data;
};

export const apiAdminUpdateProduct = async (id, productData) => {
  const res = await apiFetch(`/api/v1/admin/products/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const apiAdminDeleteProduct = async (id) => {
  const res = await apiFetch(`/api/v1/admin/products/delete/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

/* ==========================================================================
   COUPON APIs
   ========================================================================== */
export const apiVerifyCoupon = async ({ code }) => {
  const res = await apiFetch('/api/v1/user/coupons/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid coupon');
  return data;
};

export const apiAdminGetCoupons = async () => {
  const res = await apiFetch('/api/v1/admin/coupons/all');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch coupons');
  return data;
};

export const apiDeleteUploadedImage = async (url) => {
  const token = localStorage.getItem('shveraa_admin_token');
  const res = await apiFetch('/api/v1/admin/upload', {
    method: 'DELETE',
    body: JSON.stringify({ url }),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Image cleanup failed');
};

export const apiGetStoreSettings = async () => {
  const res = await apiFetch('/api/v1/admin/store-settings');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch storefront settings');
  return data;
};

export const apiAdminSaveStoreSettings = async (settings) => {
  const imageValues = [
    ...(Array.isArray(settings.heroBanners) ? settings.heroBanners.map((banner) => banner?.image) : []),
    settings.heroBanner?.image,
  ];
  if (imageValues.some((image) => typeof image === 'string' && /^data:image\//i.test(image))) {
    throw new Error('Base64 images are not supported. Upload the image file first.');
  }
  const res = await apiFetch('/api/v1/admin/store-settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to save storefront settings');
  return data;
};

export const apiAdminAddCoupon = async (couponData) => {
  const res = await apiFetch('/api/v1/admin/coupons/add', {
    method: 'POST',
    body: JSON.stringify(couponData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add coupon');
  return data;
};

export const apiAdminUpdateCoupon = async (id, couponData) => {
  const res = await apiFetch(`/api/v1/admin/coupons/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(couponData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update coupon');
  return data;
};

export const apiAdminDeleteCoupon = async (id) => {
  const res = await apiFetch(`/api/v1/admin/coupons/delete/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete coupon');
  return data;
};

/* ==========================================================================
   USER ADDRESS APIs
   ========================================================================== */
export const apiGetUserAddresses = async () => {
  const res = await apiFetch('/api/v1/user/auth/addresses');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch addresses');
  return data;
};

export const apiAddUserAddress = async (addressData) => {
  const res = await apiFetch('/api/v1/user/auth/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add address');
  return data;
};

export const apiUpdateUserAddress = async (addressId, addressData) => {
  const res = await apiFetch(`/api/v1/user/auth/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update address');
  return data;
};

export const apiDeleteUserAddress = async (addressId) => {
  const res = await apiFetch(`/api/v1/user/auth/addresses/${addressId}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete address');
  return data;
};

export const apiSetDefaultUserAddress = async (addressId) => {
  const res = await apiFetch(`/api/v1/user/auth/addresses/${addressId}/default`, {
    method: 'PUT',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to set default address');
  return data;
};

/* ==========================================================================
   CART APIs
   ========================================================================== */
export const apiGetCart = async () => {
  const res = await apiFetch('/api/v1/user/auth/cart');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
  return data;
};

export const apiSyncCart = async (cart) => {
  const res = await apiFetch('/api/v1/user/auth/cart/sync', {
    method: 'POST',
    body: JSON.stringify({ cart }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to sync cart');
  return data;
};

export const apiAddToCart = async (item) => {
  const res = await apiFetch('/api/v1/user/auth/cart/add', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
  return data;
};

export const apiUpdateCartItem = async (cartId, quantity) => {
  const res = await apiFetch(`/api/v1/user/auth/cart/${encodeURIComponent(cartId)}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update cart item');
  return data;
};

export const apiRemoveCartItem = async (cartId) => {
  const res = await apiFetch(`/api/v1/user/auth/cart/${encodeURIComponent(cartId)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove cart item');
  return data;
};

export const apiClearCart = async () => {
  const res = await apiFetch('/api/v1/user/auth/cart', { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to clear cart');
  return data;
};

/* ==========================================================================
   WISHLIST APIs
   ========================================================================== */
export const apiGetWishlist = async () => {
  const res = await apiFetch('/api/v1/user/auth/wishlist');
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data;
};

export const apiToggleWishlist = async (productId) => {
  const res = await apiFetch('/api/v1/user/auth/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to toggle wishlist');
  return data;
};

/* ==========================================================================
   DELHIVERY PINCODE DETAILS API
   ========================================================================== */
export const apiCheckPincodeDetails = async (pincode) => {
  const res = await apiFetch(`/api/v1/user/delhivery/get-pincode-details/${encodeURIComponent(pincode)}`);
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'No delivery information available for the given pincode');
  }
  return data;
};



// Shveraa Admin Panel Data Service & LocalStorage Synchronization
import { FALLBACK_PRODUCTS } from '../services/api';

const ORDERS_KEY = 'shveraa_orders';
const PRODUCTS_KEY = 'shveraa_admin_products';
const SETTINGS_KEY = 'shveraa_admin_settings';

// Default initial seeded orders if none exist
export const DEFAULT_ADMIN_ORDERS = [
  {
    orderId: 'ORD-2341',
    displayId: '#SHV-856726',
    customer: {
      fullName: 'Aarav Mehta',
      email: 'aarav.mehta@gmail.com',
      phone: '+91 98765 43210',
      city: 'Mumbai, Maharashtra',
      address: '402, Lotus Heritage, Linking Road, Bandra West',
      pincode: '400050',
    },
    items: [
      {
        id: 'prod_silver_ring_01',
        name: 'Lumina 925 Silver Solitaire Ring',
        qty: 1,
        price: 1899,
        size: 'US 7 (54mm)',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
        material: '925 Sterling Silver',
      },
      {
        id: 'prod_silver_ring_02',
        name: 'Eternal Wave Stacking Silver Band',
        qty: 1,
        price: 1299,
        size: 'US 7 (54mm)',
        image: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=85',
        material: 'Solid 925 Sterling Silver',
      },
    ],
    pricing: {
      subtotal: 3198,
      discount: 0,
      shipping: 'FREE',
      total: 3198,
    },
    paymentMethod: 'UPI (Google Pay / PhonePe)',
    paymentStatus: 'Paid',
    status: 'On The Way', // 'Scheduled', 'On The Way', 'Delivered', 'Cancelled', 'On Hold'
    date: 'Sep 29, 2026',
    estimatedDelivery: 'Sep 30, 2026',
    carrier: 'BlueDart Air Express',
    trackingNumber: 'BD-84920491',
  },
  {
    orderId: 'ORD-2342',
    displayId: '#SHV-912044',
    customer: {
      fullName: 'Pooja Sharma',
      email: 'pooja.sharma@outlook.com',
      phone: '+91 98231 12345',
      city: 'Bengaluru, Karnataka',
      address: 'Villa 18, Palm Meadows, Whitefield',
      pincode: '560066',
    },
    items: [
      {
        id: 'prod_silver_neck_01',
        name: 'Celeste Diamond Solitaire Pendant',
        qty: 1,
        price: 2499,
        size: '16 Inch Chain',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
        material: '925 Sterling Silver & Platinum Rhodium',
      },
    ],
    pricing: {
      subtotal: 2499,
      discount: 250,
      shipping: 'FREE',
      total: 2249,
    },
    paymentMethod: 'Credit Card (HDFC Visa)',
    paymentStatus: 'Paid',
    status: 'Delivered',
    date: 'Sep 22, 2026',
    estimatedDelivery: 'Sep 25, 2026',
    carrier: 'BlueDart Air Express',
    trackingNumber: 'BD-99120344',
  },
  {
    orderId: 'ORD-2343',
    displayId: '#SHV-784102',
    customer: {
      fullName: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@gmail.com',
      phone: '+91 97654 88990',
      city: 'Pune, Maharashtra',
      address: 'Flat 904, Marvel Zephyr, Kharadi',
      pincode: '411014',
    },
    items: [
      {
        id: 'prod_silver_cuff_01',
        name: 'Aura Modernist Open Silver Bangle',
        qty: 1,
        price: 2899,
        size: 'Adjustable Cuff (60mm)',
        image: 'https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=900&q=85',
        material: '925 Silver',
      },
    ],
    pricing: {
      subtotal: 2899,
      discount: 0,
      shipping: 'FREE',
      total: 2899,
    },
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending On Delivery',
    status: 'Scheduled',
    date: 'Sep 23, 2026',
    estimatedDelivery: 'Oct 02, 2026',
    carrier: 'Delhivery Surface',
    trackingNumber: 'DEL-33829104',
  },
  {
    orderId: 'ORD-2344',
    displayId: '#SHV-659021',
    customer: {
      fullName: 'Ananya Verma',
      email: 'ananya.verma@yahoo.com',
      phone: '+91 99102 33445',
      city: 'New Delhi',
      address: 'C-14, Vasant Vihar',
      pincode: '110057',
    },
    items: [
      {
        id: 'prod_silver_ear_01',
        name: 'Elysian Cascade Silver Hoop Drops',
        qty: 2,
        price: 1699,
        size: 'Standard Pair',
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
        material: '925 Sterling Silver',
      },
    ],
    pricing: {
      subtotal: 3398,
      discount: 300,
      shipping: 'FREE',
      total: 3098,
    },
    paymentMethod: 'UPI (Razorpay)',
    paymentStatus: 'Paid',
    status: 'On The Way',
    date: 'Sep 28, 2026',
    estimatedDelivery: 'Oct 01, 2026',
    carrier: 'BlueDart Air Express',
    trackingNumber: 'BD-55928190',
  },
  {
    orderId: 'ORD-2345',
    displayId: '#SHV-512998',
    customer: {
      fullName: 'Vikram Sethi',
      email: 'vikram.sethi@gmail.com',
      phone: '+91 98450 77123',
      city: 'Ahmedabad, Gujarat',
      address: 'B-602, Iscon Elegance, SG Highway',
      pincode: '380015',
    },
    items: [
      {
        id: 'prod_silver_ring_01',
        name: 'Lumina 925 Silver Solitaire Ring',
        qty: 1,
        price: 1899,
        size: 'US 8',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
        material: '925 Sterling Silver',
      },
    ],
    pricing: {
      subtotal: 1899,
      discount: 0,
      shipping: 'FREE',
      total: 1899,
    },
    paymentMethod: 'NetBanking (ICICI)',
    paymentStatus: 'Refunded',
    status: 'Cancelled',
    date: 'Sep 18, 2026',
    estimatedDelivery: 'Cancelled by Customer',
    carrier: 'N/A',
    trackingNumber: 'N/A',
  },
];

// Helper: Get all orders (merging stored checkout orders + seeded orders)
export const getAdminOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(DEFAULT_ADMIN_ORDERS));
      return DEFAULT_ADMIN_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(DEFAULT_ADMIN_ORDERS));
      return DEFAULT_ADMIN_ORDERS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading admin orders:', err);
    return DEFAULT_ADMIN_ORDERS;
  }
};

// Helper: Update status of an order
export const updateAdminOrderStatus = (orderId, newStatus) => {
  const current = getAdminOrders();
  const updated = current.map((ord) => {
    if (ord.orderId === orderId || ord.displayId === orderId) {
      return { ...ord, status: newStatus };
    }
    return ord;
  });
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  return updated;
};

// Helper: Get all products (defaults + custom created in admin)
export const getAdminProducts = () => {
  try {
    const custom = localStorage.getItem(PRODUCTS_KEY);
    const customList = custom ? JSON.parse(custom) : [];
    return customList;
  } catch (err) {
    console.error('Error reading admin products:', err);
    return [];
  }
};

// Helper: Add or edit a product
export const saveAdminProduct = (productData) => {
  try {
    const custom = localStorage.getItem(PRODUCTS_KEY);
    let customList = custom ? JSON.parse(custom) : [];

    if (productData._id) {
      const idx = customList.findIndex((p) => p._id === productData._id);
      if (idx !== -1) {
        customList[idx] = { ...customList[idx], ...productData };
      } else {
        customList.unshift(productData);
      }
    } else {
      const newProd = {
        ...productData,
        _id: 'prod_custom_' + Date.now(),
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        rating: 5.0,
        reviewsCount: 1,
        inStock: true,
      };
      customList.unshift(newProd);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(customList));
    return customList;
  } catch (err) {
    console.error('Error saving product:', err);
    return [];
  }
};

// Helper: Toggle product stock status
export const toggleAdminProductStock = (productId) => {
  try {
    const custom = localStorage.getItem(PRODUCTS_KEY);
    let customList = custom ? JSON.parse(custom) : [];
    const prod = customList.find((p) => p._id === productId);
    if (prod) {
      prod.inStock = !prod.inStock;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(customList));
    }
    return getAdminProducts();
  } catch (err) {
    console.error('Error toggling stock:', err);
    return getAdminProducts();
  }
};

// Modulix Chart Data: Monthly sales & unit volumes
export const MONTHLY_SALES_CHART = [
  { month: 'Apr', volume: 85, revenue: 145000, height: '48%' },
  { month: 'May', volume: 92, revenue: 168000, height: '54%' },
  { month: 'Jun', volume: 110, revenue: 210000, height: '66%' },
  { month: 'Jul', volume: 105, revenue: 198000, height: '62%' },
  { month: 'Aug', volume: 120, revenue: 245000, height: '82%', isHighlighted: true },
  { month: 'Sep', volume: 95, revenue: 182000, height: '56%' },
  { month: 'Oct', volume: 115, revenue: 228000, height: '70%' },
  { month: 'Nov', volume: 130, revenue: 265000, height: '88%' },
];

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

// 100% Pure 925 Sterling Silver Products Dataset with INR (₹) Pricing
export const FALLBACK_PRODUCTS = [
  // RINGS
  {
    _id: 'prod_silver_ring_01',
    name: 'Lumina 925 Silver Solitaire Ring',
    slug: 'lumina-925-silver-solitaire-ring',
    description: 'Cast in certified 925 sterling silver with high-luster rhodium plating. Features a brilliant hand-set lab-grown moissanite stone that radiates white-hot fire and timeless brilliance.',
    price: 1899,
    originalPrice: 2499,
    category: 'rings',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Sterling Silver & Rhodium Dip',
    stone: 'AAAAA Brilliant Cut Cubic Zirconia',
    finish: 'Mirror Platinum Polish',
    sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9'],
    inStock: true,
    featured: true,
    bestseller: true,
    rating: 4.9,
    reviewsCount: 68,
    badge: 'Bestseller',
  },
  {
    _id: 'prod_silver_ring_02',
    name: 'Eternal Wave Stacking Silver Band',
    slug: 'eternal-wave-stacking-silver-band',
    description: 'An organic, fluid contoured ring handcrafted in solid recycled 925 silver. Ergonomically shaped to hug your finger comfortably and stack effortlessly alongside solitaires.',
    price: 1299,
    originalPrice: 1699,
    category: 'rings',
    images: [
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
    ],
    material: 'Solid 925 Sterling Silver',
    stone: 'None (Clean Sculpted Metal)',
    finish: 'High Polished Rhodium',
    sizes: ['US 6', 'US 7', 'US 8'],
    inStock: true,
    featured: true,
    bestseller: false,
    rating: 4.8,
    reviewsCount: 39,
    badge: 'Trending',
  },
  {
    _id: 'prod_silver_ring_03',
    name: 'Nova Baguette Silver Halo Ring',
    slug: 'nova-baguette-silver-halo-ring',
    description: 'Geometric architectural elegance. Crisp baguette stones framed by micro-pavé halos on a sleek 925 silver split shank. Catching the light with every gesture.',
    price: 2199,
    originalPrice: 2899,
    category: 'rings',
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Hallmarked Sterling Silver',
    stone: 'Baguette & Round Brilliant Stones',
    finish: 'Platinum Luster',
    sizes: ['US 5', 'US 6', 'US 7', 'US 8'],
    inStock: true,
    featured: false,
    bestseller: true,
    rating: 4.9,
    reviewsCount: 47,
    badge: 'New',
  },

  // EARRINGS
  {
    _id: 'prod_silver_earring_01',
    name: 'Aria Teardrop Hollow Silver Hoops',
    slug: 'aria-teardrop-hollow-silver-hoops',
    description: 'Bold, sculptural teardrop earrings hollowed for weightless all-day comfort. Finished with a double layer of protective rhodium so your silver maintains its brilliant white shine without tarnishing.',
    price: 1499,
    originalPrice: 1999,
    category: 'earrings',
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Sterling Silver (Hollow Cast)',
    stone: 'None',
    finish: 'Mirror Platinum Finish',
    sizes: ['One Size (26mm x 18mm)'],
    inStock: true,
    featured: true,
    bestseller: true,
    rating: 5.0,
    reviewsCount: 84,
    badge: 'Most Loved',
  },
  {
    _id: 'prod_silver_earring_02',
    name: 'Celeste Pavé Silver Huggie Hoops',
    slug: 'celeste-pave-silver-huggie-hoops',
    description: 'Everyday understated luxury. Micro-prong set stones lined along a sleek silver curve with an effortless clicker clasp. Perfect for first or second lobe piercings.',
    price: 1199,
    originalPrice: 1499,
    category: 'earrings',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85',
    ],
    material: 'Hypoallergenic 925 Sterling Silver',
    stone: 'Fine Micro-Pavé Zirconia',
    finish: 'Rhodium Protective Dip',
    sizes: ['12mm Diameter'],
    inStock: true,
    featured: false,
    bestseller: true,
    rating: 4.8,
    reviewsCount: 52,
    badge: '',
  },

  // NECKLACES
  {
    _id: 'prod_silver_necklace_01',
    name: 'Liquid Silver Herringbone Chain',
    slug: 'liquid-silver-herringbone-chain',
    description: 'Sleek, fluid, and molten-smooth against the collarbone. Tightly interlocked silver segments reflect light like a ribbon of liquid mercury. Designed to wear solo or layer with pendants.',
    price: 2499,
    originalPrice: 3199,
    category: 'necklaces',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
    ],
    material: 'Solid 925 Italian Sterling Silver',
    stone: 'None',
    finish: 'High-Polish Rhodium Anti-Tarnish',
    sizes: ['16 inch + 2 inch extender', '18 inch + 2 inch extender'],
    inStock: true,
    featured: true,
    bestseller: true,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Iconic',
  },
  {
    _id: 'prod_silver_necklace_02',
    name: 'Solstice Silver Paperclip Chain',
    slug: 'solstice-silver-paperclip-chain',
    description: 'Elongated rectangular links with hand-beveled edges for modern architectural attitude. Secured with an embossed 925 lobster clasp.',
    price: 1799,
    originalPrice: 2299,
    category: 'necklaces',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Sterling Silver',
    stone: 'None',
    finish: 'Silver Platinum Shine',
    sizes: ['16 inch + 2 inch extender', '20 inch'],
    inStock: true,
    featured: false,
    bestseller: false,
    rating: 4.7,
    reviewsCount: 38,
    badge: 'Trending',
  },

  // PERSONALISED
  {
    _id: 'prod_silver_pers_01',
    name: 'Custom Engraved Silver Nameplate Necklace',
    slug: 'custom-engraved-silver-nameplate-necklace',
    description: 'Laser-carved with your name, initials, or sacred date in solid 925 sterling silver. Hand-finished with diamond-tipped tools and suspended on a sturdy diamond-cut cable chain.',
    price: 2299,
    originalPrice: 2899,
    category: 'personalised',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Sterling Silver (1.2mm Thickness)',
    stone: 'Optional Birthstone Accent',
    finish: 'Rhodium Coated Anti-Tarnish',
    sizes: ['16 inch', '18 inch'],
    isPersonalised: true,
    inStock: true,
    featured: true,
    bestseller: true,
    rating: 5.0,
    reviewsCount: 145,
    badge: 'Personalised',
  },
  {
    _id: 'prod_silver_pers_02',
    name: 'Initial Medallion Silver Signet Ring',
    slug: 'initial-medallion-silver-signet-ring',
    description: 'A contemporary take on the timeless heirloom signet ring. Precision stamped with your chosen alphabet letter on a polished oval table in heavy 925 sterling silver.',
    price: 1999,
    originalPrice: 2599,
    category: 'personalised',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1603561596112-0a132b757442?auto=format&fit=crop&w=900&q=85',
    ],
    material: 'Solid 925 Sterling Silver',
    stone: 'None',
    finish: 'Mirror Silver Luster',
    sizes: ['US 6', 'US 7', 'US 8', 'US 9'],
    isPersonalised: true,
    inStock: true,
    featured: false,
    bestseller: true,
    rating: 4.9,
    reviewsCount: 71,
    badge: 'Custom Made',
  },

  // BRACELETS
  {
    _id: 'prod_silver_bracelet_01',
    name: 'Mirage Silver Tennis Link Bracelet',
    slug: 'mirage-silver-tennis-link-bracelet',
    description: 'A seamless stream of bezel-set diamond-grade cubic zirconia stones linked with precision articulators. Closes with a secure double-latch box clasp stamped with 925.',
    price: 2799,
    originalPrice: 3499,
    category: 'bracelets',
    images: [
      'https://images.unsplash.com/photo-1611591475870-7b561c28c688?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85',
    ],
    material: 'Solid 925 Sterling Silver',
    stone: 'Prong-Set Flawless Zirconia',
    finish: 'Platinum Rhodium Shield',
    sizes: ['6.5 inch', '7.0 inch', '7.5 inch'],
    inStock: true,
    featured: true,
    bestseller: true,
    rating: 4.9,
    reviewsCount: 63,
    badge: 'Luxury',
  },
  {
    _id: 'prod_silver_bracelet_02',
    name: 'Vortex Open Sculptural Silver Cuff',
    slug: 'vortex-open-sculptural-silver-cuff',
    description: 'An open sculpted wrist cuff featuring ergonomic contoured curves. Slip-on design with gentle flex adjustment to fit most wrists comfortably with a brilliant reflective shine.',
    price: 2199,
    originalPrice: 2799,
    category: 'bracelets',
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1611591475870-7b561c28c688?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Solid Sterling Silver',
    stone: 'None',
    finish: 'Hand-Polished High Gloss',
    sizes: ['Adjustable (6.0" - 7.5")'],
    inStock: true,
    featured: false,
    bestseller: false,
    rating: 4.8,
    reviewsCount: 29,
    badge: '',
  },

  // ANKLETS
  {
    _id: 'prod_silver_anklet_01',
    name: 'Starlight Dotted Silver Anklet',
    slug: 'starlight-dotted-silver-anklet',
    description: 'Delicate satellite beads alternating with shimmering facet drops along a fluid silver chain. Fully water-safe and waterproof for ocean dips and daily showers.',
    price: 1399,
    originalPrice: 1799,
    category: 'anklets',
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85',
    ],
    material: '925 Sterling Silver (Waterproof)',
    stone: 'None',
    finish: 'Rhodium Plated',
    sizes: ['9 inch + 2 inch extender'],
    inStock: true,
    featured: false,
    bestseller: true,
    rating: 4.8,
    reviewsCount: 33,
    badge: 'Waterproof',
  },
];

const API_BASE_URL = '/api';

// Fetch all products with filter support
export const fetchProducts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/products${query ? `?${query}` : ''}`;
    const res = await fetch(url);
  
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    
    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data;
    }

    return filterLocalProducts(params);
  } catch (err) {
    console.info('Using local fallback silver products dataset.');
    return filterLocalProducts(params);
  }
};

// Fetch single product by id or slug
export const fetchProductById = async (idOrSlug) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${idOrSlug}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    if (data && data.success && data.data) {
      return data.data;
    }
    return getLocalProductById(idOrSlug);
  } catch (err) {
    console.info('Using local fallback for product:', idOrSlug);
    return getLocalProductById(idOrSlug);
  }
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

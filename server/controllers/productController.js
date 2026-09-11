import Product from '../models/Product.js';
import { initialProducts } from '../data/productsData.js';
// import { getIsConnected } from '../config/db.js';

// In-memory products store fallback
let memoryProducts = [...initialProducts];

export const getProducts = async (req, res) => {
  try {


    const { category, sort, search, featured, bestseller } = req.query;

    // if (getIsConnected()) {
    const query = {};

    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (bestseller === 'true') {
      query.bestseller = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name-asc') sortOption = { name: 1 };


    const products = await Product.find(query).sort(sortOption);
    if (products && products.length > 0) {
      return res.json({ success: true, count: products.length, data: products });
    }
    // }

    // Fallback to in-memory filter
    let results = [...memoryProducts];

    if (category && category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      results = results.filter((p) => p.featured);
    }

    if (bestseller === 'true') {
      results = results.filter((p) => p.bestseller);
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'name-asc') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    if (getIsConnected()) {
      const featured = await Product.find({ featured: true }).limit(8);
      if (featured && featured.length > 0) {
        return res.json({ success: true, data: featured });
      }
    }
    const featured = memoryProducts.filter((p) => p.featured);
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBestsellers = async (req, res) => {
  try {
    if (getIsConnected()) {
      const bestsellers = await Product.find({ bestseller: true }).limit(8);
      if (bestsellers && bestsellers.length > 0) {
        return res.json({ success: true, data: bestsellers });
      }
    }
    const bestsellers = memoryProducts.filter((p) => p.bestseller);
    res.json({ success: true, data: bestsellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsConnected()) {
      // Check both MongoDB _id or custom id
      let product = null;
      try {
        product = await Product.findById(id);
      } catch (err) {
        // Not a standard ObjectId
      }
      if (!product) {
        product = await Product.findOne({ $or: [{ slug: id }, { _id: id }] });
      }
      if (product) {
        return res.json({ success: true, data: product });
      }
    }

    const item = memoryProducts.find((p) => p._id === id || p.slug === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

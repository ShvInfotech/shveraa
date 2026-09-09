import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  if (!product) return null;

  const id = product._id || product.slug;
  const primaryImage = (product.images && product.images[0]) || '';
  const secondaryImage = (product.images && product.images[1]) || primaryImage;
  const isWishlisted = isInWishlist(id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.sizes ? product.sizes[0] : 'Standard', 1);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${id}`} className="product-card-link">
        {/* Image Container with Second Image Hover Toggle */}
        <div className="product-image-container">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="product-main-img"
          />

          {/* Badge */}
          <div className="product-badges-stack">
            {product.badge && (
              <span className="product-badge product-badge-silver">
                {product.badge}
              </span>
            )}
            <span className="product-hallmark-tag">925 BIS</span>
          </div>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            className={`product-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              size={16}
              fill={isWishlisted ? '#E11D48' : 'none'}
              color={isWishlisted ? '#E11D48' : '#18181B'}
            />
          </button>

          {/* Slide-Up Quick Add Overlay Button */}
          <div className="product-quick-add-overlay">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="product-quick-add-btn"
            >
              <ShoppingBag size={14} />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="product-info">
          <div className="product-meta-row">
            <span className="product-category-tag">{product.category}</span>
            {product.rating && (
              <span className="product-rating-tag">
                <Star size={11} fill="#B8BCC2" color="#B8BCC2" />
                <span>{product.rating}</span>
              </span>
            )}
          </div>

          <h3 className="product-title">{product.name}</h3>

          <div className="product-price-row">
            <span className="product-price">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-original-price">₹{product.originalPrice}</span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-save-percent">
                Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

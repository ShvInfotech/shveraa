import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductColors } from '../services/storeService';

const getColorVisuals = (colorName) => {
  const c = (colorName || '').toLowerCase().trim();
  if (c.includes('green') || c.includes('emerald')) {
    return {
      hex: '#059669',
      gradient: 'linear-gradient(135deg, #34D399 0%, #059669 50%, #065F46 100%)',
      border: '#047857',
    };
  }
  if (c.includes('ruby') || c.includes('red') || c.includes('maroon') || c.includes('garnet')) {
    return {
      hex: '#DC2626',
      gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 50%, #991B1B 100%)',
      border: '#B91C1C',
    };
  }
  if (c.includes('blue') || c.includes('sapphire')) {
    return {
      hex: '#2563EB',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #1E40AF 100%)',
      border: '#1D4ED8',
    };
  }
  if (c.includes('pink') || c.includes('tourmaline')) {
    return {
      hex: '#EC4899',
      gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 50%, #BE185D 100%)',
      border: '#DB2777',
    };
  }
  if (c.includes('gold') && !c.includes('rose')) {
    return {
      hex: '#E5C158',
      gradient: 'linear-gradient(135deg, #FFF0B3 0%, #E5C158 50%, #B8860B 100%)',
      border: '#D4AF37',
    };
  }
  if (c.includes('rose')) {
    return {
      hex: '#E8A598',
      gradient: 'linear-gradient(135deg, #FFE4DE 0%, #E8A598 50%, #B76E79 100%)',
      border: '#C57E70',
    };
  }
  if (c.includes('oxid') || c.includes('black') || c.includes('dark')) {
    return {
      hex: '#334155',
      gradient: 'linear-gradient(135deg, #64748B 0%, #334155 50%, #0F172A 100%)',
      border: '#1E293B',
    };
  }
  return {
    hex: '#DDE2E8',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #D4D9E2 50%, #9DA6B2 100%)',
    border: '#CBD5E1',
  };
};

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSwatchHovering, setIsSwatchHovering] = useState(false);
  const touchMovedRef = useRef(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  if (!product) return null;

  const id = product._id || product.slug;
  const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
  
  const availableColors = hasVariants
    ? product.variants.map((v) => {
        const visuals = getColorVisuals(v.color);
        return {
          id: (v.color || 'variant').toLowerCase().replace(/\s+/g, '-'),
          name: v.color,
          shortName: v.color,
          hex: visuals.hex,
          gradient: visuals.gradient,
          border: visuals.border,
        };
      })
    : getProductColors(product);

  const [selectedColor, setSelectedColor] = useState(availableColors[0]?.name || 'Pure 925 Silver');

  const activeVariant = hasVariants
    ? product.variants.find((v) => v.color?.toLowerCase() === selectedColor?.toLowerCase()) || product.variants[0]
    : null;

  const primaryImage = (activeVariant?.images || product.images || []).filter(Boolean)[0] || product.image || '';
  const secondaryImage = hasVariants
    ? (activeVariant?.images || []).filter(Boolean)[1] || ''
    : (product.images || []).filter(Boolean)[1] || product.secondaryImage || '';

  // Compute price if variant size has dynamic price
  const displayPrice = activeVariant?.sizes?.[0]?.price || product.price;

  const isWishlisted = isInWishlist(id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstSize = activeVariant?.sizes?.[0] ? (typeof activeVariant.sizes[0] === 'object' ? activeVariant.sizes[0].size : activeVariant.sizes[0]) : (product.sizes ? product.sizes[0] : 'Standard');
    addToCart({ ...product, price: displayPrice }, firstSize, 1, {
      color: selectedColor,
      sku: activeVariant?.sizes?.[0]?.sku || product.sku,
    });
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleVariantHover = (colorName) => {
    setSelectedColor(colorName);
  };

  const handleVariantSelect = (e, colorName) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedColor(colorName);
  };

  return (
    <div
      className={`product-card ${isSwatchHovering ? 'swatch-hovering' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsSwatchHovering(false);
      }}
    >
      <Link
        to={`/product/${id}?color=${encodeURIComponent(selectedColor)}`}
        state={{ selectedColor }}
        className="product-card-link"
      >
        {/* Image Container with Second Image Hover Crossfade */}
        <div className="product-image-container">
          <div className="product-image-stack">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                loading="lazy"
                className="product-main-img product-img-primary"
              />
            ) : (
              <div className="product-image-empty" aria-label="Product image unavailable" />
            )}
            {secondaryImage && secondaryImage !== primaryImage && !isSwatchHovering && (
              <img
                src={secondaryImage}
                alt={`${product.name} Alternate View`}
                loading="lazy"
                className="product-main-img product-img-secondary"
              />
            )}
          </div>

          {/* Badge: Remove Atelier Edit badge per user request */}
          <div className="product-badges-stack">
            {product.badge && !/atelier/i.test(product.badge) && (
              <span className="product-badge product-badge-silver">
                {product.badge}
              </span>
            )}
            {product.freeShipping !== false && (
              <span className="product-hallmark-tag" style={{ background: '#10B981', color: '#FFF' }}>Free Delivery</span>
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

          {/* Color Variation Swatches */}
          <div
            className="product-card-colors-row"
            onMouseEnter={() => setIsSwatchHovering(true)}
            onMouseLeave={() => setIsSwatchHovering(false)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="product-card-swatches-wrap">
              {availableColors.map((color) => {
                const isActive = selectedColor === color.name;
                return (
                  <button
                    key={color.id || color.name}
                    type="button"
                    onMouseEnter={() => handleVariantHover(color.name)}
                    onClick={(e) => handleVariantSelect(e, color.name)}
                    onTouchStart={() => {
                      touchMovedRef.current = false;
                    }}
                    onTouchMove={() => {
                      touchMovedRef.current = true;
                    }}
                    onTouchEnd={(e) => {
                      if (!touchMovedRef.current) {
                        handleVariantSelect(e, color.name);
                      }
                    }}
                    className={`product-color-swatch-dot ${isActive ? 'active' : ''}`}
                    style={{
                      background: color.gradient || color.hex,
                      borderColor: color.border || '#CBD5E1',
                    }}
                    title={`${color.name} (${color.badge || '925 Silver'})`}
                    aria-label={`Select ${color.name}`}
                  >
                    {isActive && <span className="product-color-swatch-center-dot" />}
                  </button>
                );
              })}
            </div>
            <span className="product-color-active-label">
              {availableColors.find((c) => c.name === selectedColor)?.shortName || selectedColor}
            </span>
          </div>

          <div className="product-price-row">
            <span className="product-price">₹{Number(displayPrice || 0).toLocaleString('en-IN')}</span>
            {Boolean(product.originalPrice && Number(product.originalPrice) > Number(displayPrice)) ? (
              <>
                <span className="product-original-price">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
                <span className="product-save-percent">
                  Save {Math.round(((Number(product.originalPrice) - Number(displayPrice)) / Number(product.originalPrice)) * 100)}%
                </span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

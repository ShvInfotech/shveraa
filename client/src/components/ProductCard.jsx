import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductColors } from '../services/storeService';
import { getImageUrl } from '../services/api';

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
  const [imgLoaded, setImgLoaded] = useState(false);
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

  const allImages = useMemo(() => {
    const list = hasVariants
      ? (activeVariant?.images || []).filter(Boolean)
      : (product.images || []).filter(Boolean);
    if (list.length > 0) return list.map(getImageUrl);
    const fallbacks = [product.image, product.secondaryImage].filter(Boolean);
    return fallbacks.length > 0 ? fallbacks.map(getImageUrl) : [];
  }, [hasVariants, activeVariant, product]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedColor]);

  const currentImage = allImages[activeImageIdx] || allImages[0] || '';
  const secondaryImage = allImages.length > 1
    ? allImages[(activeImageIdx + 1) % allImages.length]
    : getImageUrl(product.secondaryImage) || '';

  const handleCardPrevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setActiveImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleCardNextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % allImages.length);
  };

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
        <div className={`product-image-container ${imgLoaded ? 'loaded' : ''}`}>
          <div className="product-image-stack">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                className={`product-main-img product-img-primary ${imgLoaded ? 'loaded' : ''}`}
              />
            ) : (
              <div className="product-image-empty" aria-label="Product image unavailable" />
            )}
            {secondaryImage && secondaryImage !== currentImage && !isSwatchHovering && (
              <img
                src={secondaryImage}
                alt={`${product.name} Alternate View`}
                loading="lazy"
                decoding="async"
                className="product-main-img product-img-secondary"
              />
            )}
          </div>

          {/* Mobile Product Card Change Arrows */}
          {allImages.length > 1 && (
            <div className="product-card-mobile-arrows">
              <button
                type="button"
                className="product-card-nav-arrow product-card-nav-prev"
                onClick={handleCardPrevImg}
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="product-card-nav-arrow product-card-nav-next"
                onClick={handleCardNextImg}
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
              <div className="product-card-mobile-indicator">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`product-card-dot ${i === activeImageIdx ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}


          

          {/* Floating Color Variations Overlay on Image */}
          {availableColors && availableColors.length > 1 && (
            <div
              className="product-card-floating-swatches"
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
              {availableColors.map((color) => {
                const isActive = selectedColor?.toLowerCase() === color.name?.toLowerCase();
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
                    title={`${color.name}`}
                    aria-label={`Select ${color.name}`}
                  >
                    {isActive && <span className="product-color-swatch-center-dot" />}
                  </button>
                );
              })}
            </div>
          )}

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

        {/* Product Details (Strictly Only Name & Price - Small Font Focus) */}
        <div className="product-info">
          <h3 className="product-title" title={product.name}>{product.name}</h3>
          <div className="product-price-row">
            <span className="product-price">₹{Number(displayPrice || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

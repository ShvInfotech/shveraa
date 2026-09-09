import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

const CATEGORY_TAGS = {
  rings: { badge: 'Trending', priceHint: 'From ₹1,299' },
  earrings: { badge: 'Bestseller', priceHint: 'From ₹1,199' },
  necklaces: { badge: 'Statement', priceHint: 'From ₹1,899' },
  bracelets: { badge: 'Iconic', priceHint: 'From ₹1,699' },
  personalised: { badge: 'Bespoke', priceHint: 'From ₹1,999' },
};

const CategoryCard = ({ category }) => {
  const meta = CATEGORY_TAGS[category.slug] || { badge: '925 Silver', priceHint: 'From ₹999' };

  return (
    <Link to={`/shop?category=${category.slug}`} className="category-tile-card">
      <div className="category-tile-media">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="category-tile-img"
        />
        <div className="category-tile-overlay" />
        <div className="category-tile-shine" />
      </div>

      {/* Floating Category Badge */}
      <div className="category-tile-badge">
        <Sparkles size={11} className="category-badge-sparkle" />
        <span>{meta.badge}</span>
      </div>

      <div className="category-tile-content">
        <div className="category-tile-info">
          <span className="category-tile-subtitle">{category.subtitle}</span>
          <h3 className="category-tile-title">{category.name}</h3>
          <span className="category-tile-price-hint">{meta.priceHint}</span>
        </div>

        <div className="category-tile-btn" aria-hidden="true">
          <ArrowUpRight size={18} />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;

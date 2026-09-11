import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="cart-page-item">
      {/* Thumbnail */}
      <Link to={`/product/${item.productId}`} className="cart-page-item-img-link">
        <img src={item.image} alt={item.name} />
      </Link>

      {/* Info */}
      <div className="cart-page-item-info">
        <Link to={`/product/${item.productId}`} className="cart-page-item-title">
          {item.name}
        </Link>

        <div className="cart-page-item-meta">
          <span className="cart-page-color-badge">{item.color || 'Pure 925 Silver'}</span>
          <span className="cart-page-meta-divider">•</span>
          <span>Size: {item.size}</span>
          {item.customText && (
            <span className="cart-page-item-engraved">
              Engraved: "{item.customText}"
            </span>
          )}
        </div>

        <div className="cart-page-item-price">
          ₹{item.price}
          {item.originalPrice > item.price && (
            <span className="cart-page-item-orig-price">₹{item.originalPrice}</span>
          )}
        </div>
      </div>

      {/* Quantity Controls & Line Total */}
      <div className="cart-page-item-actions">
        <div className="cart-qty-controller">
          <button
            type="button"
            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span>{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        <div className="cart-page-item-line-total">
          ₹{item.price * item.quantity}
        </div>

        <button
          type="button"
          onClick={() => removeFromCart(item.cartItemId)}
          className="cart-page-item-remove-btn"
          aria-label="Remove item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const { addToCart, setQuickViewProduct, wishlist, toggleWishlist } = useCart();

  const isWishlisted = wishlist.includes(product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
  };

  const handleCardClick = () => {
    if (!compact && product.handle) {
      navigate(`/product/${product.handle}`);
    } else {
      setQuickViewProduct(product);
    }
  };

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="product-card-image">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          /* Empty placeholder for image */
          <div className="product-card-placeholder">
            <span className="product-card-placeholder-text">
              {product.name}
            </span>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span
            className="product-card-badge"
            style={{
              backgroundColor: product.badge === 'Sold out'
                ? 'var(--destructive)'
                : 'var(--accent)',
              color: product.badge === 'Sold out'
                ? '#ffffff'
                : 'var(--foreground)'
            }}
          >
            {product.badge === 'Sold out' ? 'SOLD OUT' : 'NEW'}
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          className="product-card-heart"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label="Add to wishlist"
        >
          <Heart
            size={16}
            fill={isWishlisted ? '#A93933' : 'none'}
            color={isWishlisted ? '#A93933' : 'var(--foreground)'}
          />
        </button>

        {/* Quick Add Button – slides up on hover */}
        <div className="product-card-actions">
          <button
            className="product-card-quick-add"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
          >
            <ShoppingBag size={14} />
            {product.inStock ? 'QUICK ADD' : 'SOLD OUT'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-card-info">
        {/* Row 1: Name + Price */}
        <div className="product-card-row">
          <h3 className="product-card-name">{product.name}</h3>
          <span className="product-card-price">{product.price}</span>
        </div>

        {/* Row 2: Subtitle */}
        {!compact && product.subtitle && (
          <p className="product-card-subtitle">{product.subtitle}</p>
        )}

        {/* Row 3: Color Swatches + Category */}
        <div className="product-card-row product-card-meta">
          <div className="product-card-swatches">
            {product.colors && product.colors.map((c) => (
              <span
                key={c.name}
                className="product-card-swatch"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
          <span className="product-card-category">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

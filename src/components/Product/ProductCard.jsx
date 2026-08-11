import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const { addToCart, setQuickViewProduct, wishlist, toggleWishlist } = useCart();

  const isWishlisted = wishlist.includes(product.id);
  const [selectedSize, setSelectedSize] = useState(null);
  const primaryImage = product.image || (product.images && product.images[0]) || null;
  const secondaryImage = (product.images && product.images.length > 1 && product.images[1] !== primaryImage) 
    ? product.images[1] 
    : null;

  const hasComparePrice = Boolean(product.compareAtPrice && product.compareAtPriceValue && product.compareAtPriceValue > (product.priceValue || 0));
  const discountPercent = hasComparePrice 
    ? Math.round(((product.compareAtPriceValue - product.priceValue) / product.compareAtPriceValue) * 100) 
    : null;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart({
      ...product,
      selectedSize: selectedSize || (product.sizes && product.sizes[0]) || null
    });
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
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className="product-card-img product-card-img-primary"
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} alternate angle`}
                className="product-card-img product-card-img-secondary"
                loading="lazy"
              />
            )}
          </>
        ) : (
          /* Empty placeholder for image */
          <div className="product-card-placeholder">
            <span className="product-card-placeholder-text">
              {product.name}
            </span>
          </div>
        )}

        {/* Badge */}
        {product.badge ? (
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
            {product.badge === 'Sold out' ? 'SOLD OUT' : product.badge.toUpperCase()}
          </span>
        ) : (discountPercent && discountPercent > 0) ? (
          <span className="product-card-badge product-card-badge-sale">
            {discountPercent}% OFF
          </span>
        ) : null}

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

        {/* Actions Overlay */}
        <div className="product-card-actions">
          {/* Quick Size Selection Chips */}
          {product.sizes && product.sizes.length > 0 && product.inStock && (
            <div className="product-card-sizes">
              <span className="product-card-sizes-title">SELECT SIZE:</span>
              <div className="product-card-size-chips">
                {product.sizes.slice(0, 6).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`product-card-size-chip ${selectedSize === size ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                      addToCart({ ...product, selectedSize: size });
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Button */}
          <button
            className="product-card-quick-add"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
          >
            <ShoppingBag size={14} />
            {product.inStock ? (selectedSize ? `ADD SIZE ${selectedSize}` : 'QUICK ADD') : 'SOLD OUT'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-card-info">
        {/* Row 1: Name + Price */}
        <div className="product-card-row">
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price-group">
            <span className="product-card-price">{product.price}</span>
            {hasComparePrice && (
              <span className="product-card-compare-price">{product.compareAtPrice}</span>
            )}
          </div>
        </div>

        {/* Row 2: Color Swatches + Category */}
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

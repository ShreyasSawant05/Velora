import React, { useState } from 'react';
import { X, Heart, Check, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './QuickViewModal.css';

export const QuickViewModal = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    showToast
  } = useCart();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    if (!selectedSize && product.sizes?.length) {
      showToast("Please select a size");
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    setQuickViewProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
  };

  const handleClose = () => {
    setQuickViewProduct(null);
    setSelectedSize(null);
    setSelectedColor(null);
  };

  return (
    <div className="qv-overlay">
      {/* Backdrop */}
      <div onClick={handleClose} className="qv-backdrop" />

      {/* Modal */}
      <div className="qv-modal">
        {/* Close button */}
        <button onClick={handleClose} className="qv-close" aria-label="Close">
          <X size={20} />
        </button>

        <div className="qv-content">
          {/* Image */}
          <div className="qv-image">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span className="qv-image-text">{product.name}</span>
            )}
            {product.badge && (
              <span
                className="qv-badge"
                style={{
                  backgroundColor: product.badge === 'Sold out' ? 'var(--destructive)' : 'var(--accent)',
                  color: product.badge === 'Sold out' ? '#fff' : 'var(--foreground)'
                }}
              >
                {product.badge === 'Sold out' ? 'SOLD OUT' : 'NEW'}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="qv-details">
            <div className="qv-header">
              <div>
                <span className="qv-category">{product.category}</span>
                <h2 className="qv-name">{product.name}</h2>
                <p className="qv-subtitle">{product.subtitle}</p>
              </div>
              <span className="qv-price">{product.price}</span>
            </div>

            <p className="qv-description">{product.description}</p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="qv-option-group">
                <span className="qv-option-label">
                  COLOR{selectedColor ? `: ${selectedColor}` : ''}
                </span>
                <div className="qv-swatches">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`qv-swatch ${selectedColor === c.name ? 'qv-swatch-active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check size={12} style={{ color: c.hex === '#241F1B' ? '#fff' : '#231F1C' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="qv-option-group">
                <span className="qv-option-label">SIZE (EU)</span>
                <div className="qv-sizes">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`qv-size ${selectedSize === size ? 'qv-size-active' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="qv-actions">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="qv-add-btn"
              >
                <ShoppingBag size={16} />
                {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`qv-wishlist-btn ${isWishlisted ? 'qv-wishlist-btn-active' : ''}`}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#A93933' : 'none'}
                  color={isWishlisted ? '#A93933' : 'var(--foreground)'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

export const CartDrawer = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    checkoutUrl,
    cartLoading,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    isFreeShipping,
    amountAwayFromFreeShipping,
    freeShippingThreshold
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  return (
    <div className="cart-overlay">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="cart-backdrop"
      />

      {/* Drawer Panel */}
      <div className="cart-drawer">

        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-header-left">
            <ShoppingBag size={20} />
            <h2 className="cart-drawer-title">Your Bag ({cartCount})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="cart-drawer-close"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping */}
        <div className="cart-shipping-bar">
          <p className="cart-shipping-text">
            {isFreeShipping ? (
              <span style={{ color: '#065f46', fontWeight: 600 }}>
                ✓ You've earned complimentary shipping!
              </span>
            ) : (
              <>You're <strong>₹{amountAwayFromFreeShipping.toLocaleString()}</strong> away from free shipping</>
            )}
          </p>
          <div className="cart-shipping-track">
            <div
              className="cart-shipping-progress"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-drawer-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={40} style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }} />
              <p className="cart-empty-title">Your bag is empty</p>
              <p className="cart-empty-sub">Discover our collection and find your perfect pair.</p>
              <Link
                to="/collection"
                onClick={() => setIsCartOpen(false)}
                className="cart-empty-btn"
              >
                SHOP COLLECTION <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="cart-item">
                {/* Image placeholder or product image */}
                <div className="cart-item-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <span className="cart-item-image-text">{item.name?.charAt(0)}</span>
                  )}
                </div>

                {/* Item details */}
                <div className="cart-item-details">
                  <div className="cart-item-top">
                    <div>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-meta">
                        {item.selectedSize && `Size ${item.selectedSize}`}
                        {item.selectedColor && ` · ${item.selectedColor}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="cart-item-remove"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="cart-item-qty">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="cart-item-qty-btn"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="cart-item-qty-num">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="cart-item-qty-btn"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="cart-item-price">
                      ₹{(item.priceValue * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-footer-subtotal">
              <span>Subtotal</span>
              <span className="cart-footer-price">₹{cartSubtotal.toLocaleString()}</span>
            </div>
            <p className="cart-footer-note">Shipping & taxes calculated at checkout</p>
            <button
              className="cart-footer-checkout"
              disabled={cartLoading}
              onClick={() => {
                if (checkoutUrl) {
                  window.location.href = checkoutUrl;
                } else {
                  alert("Checkout is currently unavailable. Please try again.");
                }
              }}
            >
              {cartLoading ? 'SYNCING BAG...' : <>CHECKOUT <ArrowRight size={14} /></>}
            </button>
            <Link
              to="/collection"
              onClick={() => setIsCartOpen(false)}
              className="cart-footer-continue"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

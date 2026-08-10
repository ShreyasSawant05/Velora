import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchShopifyCart,
  addItemToShopifyCart,
  updateShopifyCartLine,
  removeShopifyCartLine
} from '../lib/shopify/cart.js';

const CartContext = createContext();

const CART_ID_KEY = 'velora_shopify_cart_id';
const WISHLIST_KEY = 'velora_wishlist';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(() => localStorage.getItem(CART_ID_KEY) || null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper to update local cart state from Shopify cart response
  const syncCartState = (shopifyCart) => {
    if (!shopifyCart) {
      setCart([]);
      setCartCount(0);
      setCartSubtotal(0);
      setCheckoutUrl(null);
      setCartId(null);
      localStorage.removeItem(CART_ID_KEY);
      return;
    }

    setCart(shopifyCart.items || []);
    setCartCount(shopifyCart.cartCount || 0);
    setCartSubtotal(shopifyCart.cartSubtotal || 0);
    setCheckoutUrl(shopifyCart.checkoutUrl || null);
    if (shopifyCart.id) {
      setCartId(shopifyCart.id);
      localStorage.setItem(CART_ID_KEY, shopifyCart.id);
    }
  };

  // Restore cart on mount
  useEffect(() => {
    if (cartId) {
      setCartLoading(true);
      fetchShopifyCart(cartId)
        .then(shopifyCart => {
          if (shopifyCart) {
            syncCartState(shopifyCart);
          } else {
            // Cart expired or invalid
            localStorage.removeItem(CART_ID_KEY);
            setCartId(null);
            setCart([]);
          }
        })
        .catch(err => {
          console.warn('Shopify cart restore warning:', err.message);
          localStorage.removeItem(CART_ID_KEY);
          setCartId(null);
          setCart([]);
        })
        .finally(() => setCartLoading(false));
    }
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Determine variant ID for product
  const getVariantId = (product, selectedSize, selectedColor) => {
    if (!product) return null;

    // If product is already a variant node with id starting with ProductVariant
    if (typeof product.id === 'string' && product.id.includes('ProductVariant')) {
      return product.id;
    }

    const variants = product.variants || [];
    if (variants.length === 0) return product.shopifyId || product.id;

    if (variants.length === 1) return variants[0].id;

    // Match variant by selected options
    const found = variants.find(v => {
      const opts = v.selectedOptions || [];
      const matchSize = selectedSize ? opts.some(o => o.value.toString() === selectedSize.toString()) : true;
      const matchColor = selectedColor ? opts.some(o => o.value.toLowerCase() === selectedColor.toLowerCase()) : true;
      return matchSize && matchColor;
    });

    return found ? found.id : variants[0].id;
  };

  const addToCart = async (product, selectedSize = null, selectedColor = null, quantity = 1) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || null;
    const color = selectedColor || (product.colors && product.colors[0]?.name) || null;
    const merchandiseId = getVariantId(product, size, color);

    if (!merchandiseId) {
      showToast("Unable to add item: missing variant.");
      return;
    }

    setCartLoading(true);
    try {
      const updatedCart = await addItemToShopifyCart(cartId, merchandiseId, quantity);
      syncCartState(updatedCart);
      setIsCartOpen(true);
      showToast(`Added ${product.name || 'item'} to your bag`);
    } catch (err) {
      console.error('Add to cart error:', err);
      showToast(`Cart error: ${err.message || 'Unable to add to bag'}`);
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (lineId) => {
    if (!cartId || !lineId) return;
    setCartLoading(true);
    try {
      const updatedCart = await removeShopifyCartLine(cartId, lineId);
      syncCartState(updatedCart);
    } catch (err) {
      console.error('Remove from cart error:', err);
      showToast("Failed to remove item from bag");
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (lineId, newQuantity) => {
    if (!cartId || !lineId) return;
    if (newQuantity <= 0) {
      return removeFromCart(lineId);
    }

    setCartLoading(true);
    try {
      const updatedCart = await updateShopifyCartLine(cartId, lineId, newQuantity);
      syncCartState(updatedCart);
    } catch (err) {
      console.error('Update quantity error:', err);
      showToast("Failed to update item quantity");
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setCartSubtotal(0);
    setCheckoutUrl(null);
    setCartId(null);
    localStorage.removeItem(CART_ID_KEY);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Removed from wishlist");
        return prev.filter(id => id !== productId);
      } else {
        showToast("Saved to wishlist");
        return [...prev, productId];
      }
    });
  };

  const freeShippingThreshold = 5000;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;
  const amountAwayFromFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        checkoutUrl,
        cartCount,
        cartSubtotal,
        cartLoading,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isAccountOpen,
        setIsAccountOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        quickViewProduct,
        setQuickViewProduct,
        wishlist,
        toggleWishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isFreeShipping,
        amountAwayFromFreeShipping,
        freeShippingThreshold,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

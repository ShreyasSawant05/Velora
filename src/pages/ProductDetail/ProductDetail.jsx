import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Check,
  Minus,
  Plus,
  ChevronRight,
  ArrowLeft,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Leaf,
  Star,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { getProductByHandle } from '../../lib/shopify/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { ProductCard } from '../../components/Product/ProductCard.jsx';
import { useProducts } from '../../context/ProductContext.jsx';
import { SizeGuideModal } from '../../components/Product/SizeGuideModal.jsx';
import { ImageLightbox } from '../../components/Product/ImageLightbox.jsx';
import './ProductDetail.css';

export const ProductDetail = () => {
  const { handle } = useParams();
  const { addToCart, wishlist, toggleWishlist, showToast } = useCart();
  const { products: allProducts } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Modals & Interactive States
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState({ details: true, care: false, shipping: false });
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Image Hover Zoom state
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, active: false });
  const mainBuyBtnRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Look up in allProducts first for instant display
    const cached = allProducts.find(p => p.handle === handle);
    if (cached) {
      setProduct(cached);
      setSelectedImage(cached.image);
      setSelectedSize(cached.sizes?.length ? cached.sizes[0] : '40');
      if (cached.colors?.length) setSelectedColor(cached.colors[0].name);
      setLoading(false);
    }

    // Fetch full product details by handle from Shopify
    getProductByHandle(handle)
      .then(fetched => {
        if (isMounted) {
          if (fetched) {
            setProduct(fetched);
            setSelectedImage(fetched.image);
            setSelectedSize(fetched.sizes?.length ? fetched.sizes[0] : '40');
            if (fetched.colors?.length && !selectedColor) setSelectedColor(fetched.colors[0].name);
          } else if (!cached) {
            setError("Product not found");
          }
        }
      })
      .catch(err => {
        if (isMounted && !cached) {
          setError(err.message || "Failed to load product");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [handle]);

  // Scroll listener for Sticky Buy Dock
  useEffect(() => {
    const handleScroll = () => {
      if (mainBuyBtnRef.current) {
        const rect = mainBuyBtnRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading && !product) {
    return (
      <div className="pd-page">
        <div className="pd-container" style={{ textAlign: 'center', padding: '120px 24px' }}>
          <div className="pd-spinner" />
          <p className="pd-loading-text">CRAFTING SILHOUETTE...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-container" style={{ textAlign: 'center', padding: '100px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginBottom: '12px' }}>
            Product Unavailable
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '28px' }}>
            The requested product could not be located.
          </p>
          <Link to="/collection" className="pd-add-btn" style={{ display: 'inline-flex', width: 'auto', padding: '0 28px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> BACK TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const images = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      showToast("Please select a size");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleImageMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, active: true });
  };

  const handleImageMouseLeave = () => {
    setZoomPos(prev => ({ ...prev, active: false }));
  };

  const openLightboxAt = (imgUrl) => {
    const idx = images.indexOf(imgUrl);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setIsLightboxOpen(true);
  };

  const toggleAccordion = (key) => {
    setActiveAccordion(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const relatedProducts = allProducts.filter(p => p.handle !== product.handle).slice(0, 4);

  // Installment price calculation
  const numericPrice = parseFloat((product.price || '').replace(/[^0-9.]/g, '')) || 0;
  const installmentAmount = numericPrice > 0 ? (numericPrice / 4).toFixed(2) : null;
  const currencySymbol = (product.price || '').replace(/[0-9.,\s]/g, '') || '$';

  return (
    <div className="pd-page">
      <div className="pd-container">

        {/* Breadcrumb Navigation */}
        <div className="pd-breadcrumb">
          <Link to="/">HOME</Link>
          <ChevronRight size={12} />
          <Link to="/collection">COLLECTION</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </div>

        {/* Main Grid: Gallery + Info */}
        <div className="pd-grid">

          {/* Left Column: Gallery */}
          <div className="pd-gallery">
            <div
              className={`pd-main-image-wrapper ${zoomPos.active ? 'is-zooming' : ''}`}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              onClick={() => openLightboxAt(selectedImage || images[0])}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="pd-main-img"
                  style={zoomPos.active ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(1.8)'
                  } : {}}
                />
              ) : (
                <div className="pd-placeholder">
                  <span>{product.name}</span>
                </div>
              )}

              {/* Badge Overlay */}
              {product.badge && (
                <span
                  className="pd-badge-floating"
                  style={{
                    backgroundColor: product.badge === 'Sold out' ? 'var(--destructive)' : 'var(--accent)',
                    color: product.badge === 'Sold out' ? '#fff' : 'var(--foreground)'
                  }}
                >
                  {product.badge.toUpperCase()}
                </span>
              )}

              {/* Hover Zoom Hint */}
              <div className="pd-zoom-hint">
                <ZoomIn size={14} />
                <span>Click to Expand</span>
              </div>
            </div>

            {/* Thumbnails Rail */}
            {images.length > 1 && (
              <div className="pd-thumbnails">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`pd-thumb-btn ${selectedImage === imgUrl ? 'pd-thumb-btn-active' : ''}`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${idx + 1}`} className="pd-thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="pd-info">

            {/* Header Info & Ratings */}
            <div className="pd-header">
              <div className="pd-rating-row">
                <div className="pd-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" />
                  ))}
                </div>
                <span className="pd-rating-text">4.9 · 128 Reviews</span>
                <span className="pd-divider">•</span>
                <span className="pd-category">{product.category}</span>
              </div>

              <h1 className="pd-title">{product.name}</h1>
              {product.subtitle && <p className="pd-subtitle">{product.subtitle}</p>}
            </div>

            {/* Price & Stock Row */}
            <div className="pd-price-block">
              <div className="pd-price-row">
                <span className="pd-price">{product.price}</span>
                {product.compareAtPrice && (
                  <span className="pd-compare-price">{product.compareAtPrice}</span>
                )}
              </div>

              {/* Stock Status Pill */}
              <div className="pd-stock-status">
                <span className={`pd-stock-dot ${product.inStock ? 'in-stock' : 'out-of-stock'}`} />
                <span className="pd-stock-text">
                  {product.inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                </span>
              </div>
            </div>

            {/* Klarna / Afterpay Installment Teaser */}
            {installmentAmount && (
              <div className="pd-installment-banner">
                <CreditCard size={15} />
                <span>
                  Or 4 interest-free payments of <strong>{currencySymbol}{installmentAmount}</strong> with Afterpay / Klarna
                </span>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="pd-option-group">
                <div className="pd-option-header">
                  <span className="pd-option-label">COLOR:</span>
                  <span className="pd-option-val">{selectedColor}</span>
                </div>
                <div className="pd-colors">
                  {product.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`pd-color-btn ${selectedColor === c.name ? 'pd-color-btn-active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {selectedColor === c.name && (
                        <Check size={14} style={{ color: c.hex === '#241F1B' ? '#fff' : '#231F1C' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector with Size Guide Link */}
            {(() => {
              const displaySizes = (product.sizes && product.sizes.length > 0)
                ? product.sizes
                : ['38', '39', '40', '41', '42', '43', '44'];

              return (
                <div className="pd-option-group">
                  <div className="pd-option-header">
                    <span className="pd-option-label">SIZE (EU)</span>
                    <button
                      className="pd-size-guide-btn"
                      onClick={() => setIsSizeGuideOpen(true)}
                    >
                      <Ruler size={13} />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="pd-sizes">
                    {displaySizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`pd-size-btn ${selectedSize === size ? 'pd-size-btn-active' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Quantity Selector & Add to Bag Buttons */}
            <div className="pd-actions-row" ref={mainBuyBtnRef}>
              <div className="pd-qty-picker">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="pd-qty-btn"
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="pd-qty-num">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="pd-qty-btn"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="pd-add-btn"
              >
                <ShoppingBag size={16} />
                {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="pd-wishlist-btn"
                aria-label="Wishlist"
              >
                <Heart
                  size={18}
                  fill={isWishlisted ? '#A93933' : 'none'}
                  color={isWishlisted ? '#A93933' : 'var(--foreground)'}
                />
              </button>
            </div>

            {/* Value Perks Grid */}
            <div className="pd-perks-grid">
              <div className="pd-perk-card">
                <Truck size={18} className="pd-perk-icon" />
                <div className="pd-perk-text">
                  <strong>Free Express Shipping</strong>
                  <span>On all orders over $150</span>
                </div>
              </div>

              <div className="pd-perk-card">
                <RotateCcw size={18} className="pd-perk-icon" />
                <div className="pd-perk-text">
                  <strong>30-Day Returns</strong>
                  <span>Hassle-free worldwide exchanges</span>
                </div>
              </div>

              <div className="pd-perk-card">
                <Leaf size={18} className="pd-perk-icon" />
                <div className="pd-perk-text">
                  <strong>Sustainably Crafted</strong>
                  <span>Ethically sourced luxury materials</span>
                </div>
              </div>

              <div className="pd-perk-card">
                <ShieldCheck size={18} className="pd-perk-icon" />
                <div className="pd-perk-text">
                  <strong>Guaranteed Quality</strong>
                  <span>2-year warranty included</span>
                </div>
              </div>
            </div>

            {/* Collapsible Accordions for Details, Care & Shipping */}
            <div className="pd-accordions">

              {/* Accordion 1: Details */}
              <div className="pd-accordion-item">
                <button
                  className="pd-accordion-header"
                  onClick={() => toggleAccordion('details')}
                >
                  <span className="pd-accordion-title">
                    <Sparkles size={16} /> DETAILS & CRAFTSMANSHIP
                  </span>
                  {activeAccordion.details ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion.details && (
                  <div className="pd-accordion-content">
                    <p className="pd-description-body">
                      {product.description || "Designed with architectural precision, this piece combines structural sophistication with effortless everyday comfort. Each seam is tailored for fluid movement."}
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Materials & Care */}
              <div className="pd-accordion-item">
                <button
                  className="pd-accordion-header"
                  onClick={() => toggleAccordion('care')}
                >
                  <span className="pd-accordion-title">
                    <Leaf size={16} /> COMPOSITION & CARE GUIDE
                  </span>
                  {activeAccordion.care ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion.care && (
                  <div className="pd-accordion-content">
                    <ul className="pd-care-list">
                      <li>• 100% Organic Heavyweight Cotton / Italian Wool Blend</li>
                      <li>• Machine wash cold on delicate cycle (30°C)</li>
                      <li>• Do not bleach or tumble dry</li>
                      <li>• Iron inside out at low temperature</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="pd-accordion-item">
                <button
                  className="pd-accordion-header"
                  onClick={() => toggleAccordion('shipping')}
                >
                  <span className="pd-accordion-title">
                    <Truck size={16} /> SHIPPING & EXPRESS DELIVERY
                  </span>
                  {activeAccordion.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {activeAccordion.shipping && (
                  <div className="pd-accordion-content">
                    <p className="pd-description-body">
                      Orders placed before 2:00 PM EST ship the same day via DHL Express. Estimated delivery time: 2 - 4 business days. Returns are accepted within 30 days of receipt.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Customer Reviews Spotlight Section */}
        <div className="pd-reviews-section">
          <div className="pd-reviews-header">
            <div>
              <span className="pd-reviews-subtitle">COMMUNITY RATING</span>
              <h3 className="pd-reviews-title">Verified Customer Reviews</h3>
            </div>
            <div className="pd-reviews-summary-badge">
              <span className="pd-big-score">4.9</span>
              <div>
                <div className="pd-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#D4AF37" color="#D4AF37" />
                  ))}
                </div>
                <span className="pd-score-sub">Based on 128 reviews</span>
              </div>
            </div>
          </div>

          {/* Review Cards Grid */}
          <div className="pd-reviews-grid">
            <div className="pd-review-card">
              <div className="pd-review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#D4AF37" color="#D4AF37" />)}
              </div>
              <p className="pd-review-quote">"The craftsmanship is stunning. The silhouette drapes perfectly and the fabric weight feels ultra-luxurious."</p>
              <div className="pd-review-author">
                <strong>Elena M.</strong>
                <span className="pd-verified-tag"><Check size={12} /> Verified Buyer</span>
              </div>
            </div>

            <div className="pd-review-card">
              <div className="pd-review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#D4AF37" color="#D4AF37" />)}
              </div>
              <p className="pd-review-quote">"True to size and ridiculously comfortable. Shipped within 2 days to London. Will definitely buy again!"</p>
              <div className="pd-review-author">
                <strong>Marcus K.</strong>
                <span className="pd-verified-tag"><Check size={12} /> Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="pd-related-section">
            <h3 className="pd-related-title">Complete the Look</h3>
            <div className="home-products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Scroll-Aware Sticky Purchase Dock */}
      <div className={`pd-sticky-dock ${showStickyBar ? 'is-visible' : ''}`}>
        <div className="pd-sticky-container">
          <div className="pd-sticky-left">
            <img src={images[0]} alt={product.name} className="pd-sticky-img" />
            <div className="pd-sticky-meta">
              <h4 className="pd-sticky-title">{product.name}</h4>
              <span className="pd-sticky-price">{product.price}</span>
            </div>
          </div>

          <div className="pd-sticky-right">
            {selectedSize && (
              <span className="pd-sticky-size-badge">Size: {selectedSize}</span>
            )}
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="pd-sticky-add-btn"
            >
              <ShoppingBag size={15} />
              <span>{product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productName={product.name}
      />

      {/* Image Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={lightboxIndex}
        productName={product.name}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Check, Minus, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { getProductByHandle } from '../../lib/shopify/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { ProductCard } from '../../components/Product/ProductCard.jsx';
import { useProducts } from '../../context/ProductContext.jsx';
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Look up in allProducts first for instant display
    const cached = allProducts.find(p => p.handle === handle);
    if (cached) {
      setProduct(cached);
      setSelectedImage(cached.image);
      if (cached.sizes?.length) setSelectedSize(cached.sizes[0]);
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
            if (fetched.sizes?.length && !selectedSize) setSelectedSize(fetched.sizes[0]);
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

  if (loading && !product) {
    return (
      <div className="pd-page">
        <div className="pd-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
            LOADING SILHOUETTE...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page">
        <div className="pd-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '12px' }}>
            Product Unavailable
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
            The requested product could not be located.
          </p>
          <Link to="/collection" className="pd-add-btn" style={{ display: 'inline-flex', width: 'auto', padding: '0 24px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> BACK TO COLLECTION
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

  const relatedProducts = allProducts.filter(p => p.handle !== product.handle).slice(0, 4);

  return (
    <div className="pd-page">
      <div className="pd-container">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">HOME</Link>
          <ChevronRight size={12} />
          <Link to="/collection">COLLECTION</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </div>

        {/* Main Grid */}
        <div className="pd-grid">

          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image-wrapper">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="pd-main-img" />
              ) : (
                <div className="pd-placeholder">
                  <span>{product.name}</span>
                </div>
              )}
            </div>

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

          {/* Product Details */}
          <div className="pd-info">
            <div className="pd-header">
              <span className="pd-category">{product.category}</span>
              <h1 className="pd-title">{product.name}</h1>
              {product.subtitle && <p className="pd-subtitle">{product.subtitle}</p>}
            </div>

            <div className="pd-price-row">
              <span className="pd-price">{product.price}</span>
              {product.compareAtPrice && (
                <span className="pd-compare-price">{product.compareAtPrice}</span>
              )}
              {product.badge && (
                <span
                  className="pd-badge"
                  style={{
                    backgroundColor: product.badge === 'Sold out' ? 'var(--destructive)' : 'var(--accent)',
                    color: product.badge === 'Sold out' ? '#fff' : 'var(--foreground)'
                  }}
                >
                  {product.badge.toUpperCase()}
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="pd-option-group">
                <span className="pd-option-label">
                  COLOR{selectedColor ? `: ${selectedColor}` : ''}
                </span>
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

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pd-option-group">
                <span className="pd-option-label">SIZE (EU)</span>
                <div className="pd-sizes">
                  {product.sizes.map(size => (
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
            )}

            {/* Quantity & Add to Bag */}
            <div className="pd-actions-row">
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

            {/* Description */}
            {product.description && (
              <div className="pd-description-box">
                <div className="pd-description-title">DETAILS & CRAFTSMANSHIP</div>
                <p className="pd-description-body">{product.description}</p>
              </div>
            )}

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '24px', fontWeight: 500 }}>
              You may also like
            </h3>
            <div className="home-products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

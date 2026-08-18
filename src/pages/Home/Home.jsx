import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Feather, Footprints, Compass, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { PRODUCTS as staticProducts } from '../../data/products';
import { ProductCard } from '../../components/Product/ProductCard';
import { useCart } from '../../context/CartContext';
import './Home.css';

// Custom SVG Feature Icons with sub-elements for micro-animations
const FeatherFeatureIcon = ({ size = 32, strokeWidth = 1.6 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="home-feature-icon feature-icon-feather"
  >
    {/* Quill Stem & Center Spine */}
    <path d="M 2.5 21.5 L 5.5 17.5 C 9.5 12.5 13.5 8 16.8 4.2" />
    <path d="M 4.0 20.0 L 5.0 19.0" />
    {/* Feather Vane Outer Silhouette with Notches */}
    <path d="M 5.5 17.5 C 5.8 15.5 6.2 14.5 6.2 14.5 L 7.5 15.0 L 6.8 12.5 C 7.2 11.0 7.8 10.0 7.8 10.0 L 9.2 10.6 L 8.8 8.0 C 9.4 6.6 10.4 5.5 10.4 5.5 L 11.8 6.2 L 12.2 3.8 C 13.5 2.8 15.0 2.2 17.0 2.2 C 18.5 4.0 18.4 5.5 18.4 5.5 L 17.0 5.8 L 18.2 8.0 C 18.0 9.5 17.5 10.8 17.5 10.8 L 15.6 11.2 L 16.5 13.2 C 15.5 14.8 14.2 16.0 14.2 16.0 L 12.5 16.2 L 11.2 17.8 C 8.5 18.8 6.5 18.2 5.5 17.5 Z" />
  </svg>
);

const FootprintsFeatureIcon = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="home-feature-icon feature-icon-footprints"
  >
    <g className="footprint-step-left">
      <path d="M 6.2 2 C 4.2 2 2.8 3.8 2.8 6.8 C 2.8 9.8 3.3 12.2 3.3 13.2 C 3.3 13.7 3.6 14 4.1 14 L 8.4 14 C 8.9 14 9.2 13.7 9.2 13.2 C 9.2 11.5 9.7 8.2 9.7 5.8 C 9.7 3.5 8.2 2 6.2 2 Z" />
      <path d="M 3.6 15.5 C 3.2 15.5 2.9 15.8 2.9 16.2 L 2.9 17.2 C 2.9 19.8 4.4 22 6.2 22 C 8.0 22 9.5 19.8 9.5 17.2 L 9.5 16.2 C 9.5 15.8 9.2 15.5 8.8 15.5 Z" />
    </g>
    <g className="footprint-step-right">
      <path d="M 17.8 2 C 19.8 2 21.2 3.8 21.2 6.8 C 21.2 9.8 20.7 12.2 20.7 13.2 C 20.7 13.7 20.4 14 19.9 14 L 15.6 14 C 15.1 14 14.8 13.7 14.8 13.2 C 14.8 11.5 14.3 8.2 14.3 5.8 C 14.3 3.5 15.8 2 17.8 2 Z" />
      <path d="M 20.4 15.5 C 20.8 15.5 21.1 15.8 21.1 16.2 L 21.1 17.2 C 21.1 19.8 19.6 22 17.8 22 C 16.0 22 14.5 19.8 14.5 17.2 L 14.5 16.2 C 14.5 15.8 14.8 15.5 15.2 15.5 Z" />
    </g>
  </svg>
);

const CompassFeatureIcon = ({ size = 32, strokeWidth = 1.6 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="home-feature-icon feature-icon-compass"
  >
    <circle cx="12" cy="12" r="10" className="compass-outer-ring" />
    <polygon
      points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
      className="compass-inner-needle"
    />
  </svg>
);

const LayersFeatureIcon = ({ size = 32, strokeWidth = 1.6 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="home-feature-icon feature-icon-layers"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" className="layer-item layer-top" />
    <polyline points="2 12 12 17 22 12" className="layer-item layer-middle" />
    <polyline points="2 17 12 22 22 17" className="layer-item layer-bottom" />
  </svg>
);

export const Home = () => {
  const { showToast } = useCart();
  const { products: shopifyProducts, categories: contextCategories, shopifyCollections } = useProducts();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const carouselRef = useRef(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);

  const allProducts = (shopifyProducts && shopifyProducts.length > 0) ? shopifyProducts : staticProducts;

  // Recently added products logic: strictly ordered by newest creation date first (descending)
  const newInProducts = [...allProducts]
    .sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    })
    .slice(0, 10);

  const handleScrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.querySelector('.home-carousel-slide')?.offsetWidth || 300;
    const scrollAmount = (cardWidth + 20) * (direction === 'left' ? -1 : 1);
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const updateSlideIndex = () => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.querySelector('.home-carousel-slide')?.offsetWidth || 300;
    const current = Math.round(container.scrollLeft / (cardWidth + 20)) + 1;
    setCurrentSlideIndex(Math.min(Math.max(1, current), newInProducts.length));
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (container) {
      container.addEventListener('scroll', updateSlideIndex);
      return () => container.removeEventListener('scroll', updateSlideIndex);
    }
  }, [newInProducts.length]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast("Thank you for joining the VÉLORA list!");
    setEmail('');
  };

  // Dynamic categories from Shopify (excluding 'All')
  const allCategories = (contextCategories || [])
    .filter(cat => cat.id !== 'all' && cat.name?.toLowerCase() !== 'all')
    .map(cat => {
      // Find fallback image from products if collection image is missing
      let catImage = cat.image;
      if (!catImage) {
        const matchingProduct = allProducts.find(p =>
          p.category?.toLowerCase() === cat.name?.toLowerCase() ||
          (p.collections || []).some(c => c.title?.toLowerCase() === cat.name?.toLowerCase())
        );
        if (matchingProduct) {
          catImage = matchingProduct.image;
        }
      }
      return {
        ...cat,
        image: catImage
      };
    });

  // Limit display to top 4 featured categories on Home page (since there is a View All button)
  const displayCategories = allCategories.slice(0, 4);

  // Extract Men & Women collections data from Shopify
  const menCols = (shopifyCollections || []).filter(c => {
    const title = (c.title || '').toLowerCase();
    return (title.includes('men') || title.includes('male')) && !title.includes('women') && !title.includes('female');
  });
  const womenCols = (shopifyCollections || []).filter(c => {
    const title = (c.title || '').toLowerCase();
    return title.includes('women') || title.includes('female') || title.includes('ladies');
  });

  const menImage = menCols.find(c => c.image)?.image || 
    allProducts.find(p => (p.collections || []).some(c => (c.title || '').toLowerCase().includes('men') && !(c.title || '').toLowerCase().includes('women')))?.image || 
    null;

  const womenImage = womenCols.find(c => c.image)?.image || 
    allProducts.find(p => (p.collections || []).some(c => (c.title || '').toLowerCase().includes('women')))?.image || 
    null;

  const menSub = menCols.length > 0
    ? menCols.map(c => c.title.replace(/^(Men's|Mens|Men)\s*/i, '')).join(' · ')
    : 'Explore all men\'s footwear styles';

  const womenSub = womenCols.length > 0
    ? womenCols.map(c => c.title.replace(/^(Women's|Womens|Women)\s*/i, '')).join(' · ')
    : 'Explore all women\'s footwear styles';

  return (
    <div className="home-page">

      {/* ====== HERO SECTION ====== */}
      <section className="home-hero">
        <img
          src="/hero_section.png"
          alt="Vélora Footwear Hero"
          className="home-hero-bg-img"
        />
        <div className="home-hero-content">
          <h1 className="home-hero-heading">
            Made to move<br />with you
          </h1>
          <p className="home-hero-sub">
            Refined footwear for the rhythm of everyday life.
          </p>
          <div className="home-hero-buttons">
            <Link to="/collection" className="home-hero-btn-primary">
              SHOP COLLECTION
            </Link>
            <Link to="/about" className="home-hero-btn-outline">
              DISCOVER VÉLORA
            </Link>
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES SECTION (FIND YOUR EVERYDAY) ====== */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="home-section-title">Find your everyday</h2>
            <Link to="/collection" className="home-section-link">
              View all categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="home-categories-grid">
            {displayCategories.map((cat, index) => (
              <Link
                key={cat.id || cat.name}
                to={`/collection?category=${encodeURIComponent(cat.name)}`}
                className={`home-category-card reveal-delay-${(index % 4) + 1}`}
              >
                <div className="home-category-image">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="home-category-img" />
                  ) : (
                    <span className="home-category-placeholder-text">{cat.name}</span>
                  )}
                </div>
                <div className="home-category-info">
                  <h3 className="home-category-name">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== MEN & WOMEN GENDER SECTION ====== */}
      <section className="home-section home-gender-section">
        <div className="home-section-inner">
          <div className="home-gender-grid">
            {/* Men's Card */}
            <Link to="/collection?category=Men" className="home-gender-card home-gender-men">
              <div className="home-gender-bg">
                {menImage ? (
                  <img src={menImage} alt="Men's Footwear Collection" />
                ) : (
                  <div className="home-gender-placeholder" />
                )}
              </div>
              <div className="home-gender-overlay" />
              <div className="home-gender-content">
                <span className="home-gender-label">VÉLORA MAN</span>
                <h3 className="home-gender-title">Men's Collection</h3>
                <p className="home-gender-desc">{menSub}</p>
                <span className="home-gender-btn">
                  SHOP MEN <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Women's Card */}
            <Link to="/collection?category=Women" className="home-gender-card home-gender-women">
              <div className="home-gender-bg">
                {womenImage ? (
                  <img src={womenImage} alt="Women's Footwear Collection" />
                ) : (
                  <div className="home-gender-placeholder" />
                )}
              </div>
              <div className="home-gender-overlay" />
              <div className="home-gender-content">
                <span className="home-gender-label">VÉLORA WOMAN</span>
                <h3 className="home-gender-title">Women's Collection</h3>
                <p className="home-gender-desc">{womenSub}</p>
                <span className="home-gender-btn">
                  SHOP WOMEN <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ====== THE LATEST EDIT ====== */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="home-section-header home-latest-header">
            <div>
              <div className="home-latest-title-row">
                <h2 className="home-section-title">The latest edit</h2>
                <span className="home-latest-live-pill">
                  <span className="home-latest-live-dot" />
                  JUST DROPPED
                </span>
              </div>
              <p className="home-section-subtitle">
                New silhouettes crafted for every day. Discover our newest arrivals.
              </p>
            </div>

            {/* Slider Navigation & Slide Counter */}
            <div className="home-latest-controls">
              <span className="home-latest-counter">
                <span className="home-latest-current">{String(currentSlideIndex).padStart(2, '0')}</span> / {String(newInProducts.length).padStart(2, '0')}
              </span>
              <div className="home-latest-arrow-btns">
                <button
                  type="button"
                  onClick={() => handleScrollCarousel('left')}
                  className="home-latest-arrow-btn"
                  aria-label="Previous arrivals"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollCarousel('right')}
                  className="home-latest-arrow-btn"
                  aria-label="Next arrivals"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Track Container */}
          <div className="home-carousel-container">
            <div className="home-carousel-track" ref={carouselRef}>
              {newInProducts.map((product, index) => (
                <div key={product.id} className="home-carousel-slide">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====== COMFORT, WITH INTENTION ====== */}
      <section className="home-section home-story-section">
        <div className="home-section-inner home-story-inner">
          <div className="home-story-split">
            {/* Image side */}
            <div className="home-story-image">
              <img
                src="/comfort_with_intention_section.png"
                alt="Comfort, with intention"
                className="home-story-img"
              />
            </div>
            {/* Text side */}
            <div className="home-story-text">
              <span className="home-story-label">THE VÉLORA WAY</span>
              <h2 className="home-story-heading">
                Comfort, with<br />intention.
              </h2>
              <p className="home-story-body">
                We believe the best footwear disappears into the moment — leaving you free to move, explore, work, wander and arrive exactly as yourself.
              </p>
              <p className="home-story-body">
                Every pair begins on paper and ends on pavement. We prototype in small runs, wear-test samples for weeks, and only release a style once it has quietly earned its place.
              </p>
              <Link to="/about" className="home-story-link">
                Our story <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== WHEREVER YOUR DAY LEADS ====== */}
      <section className="home-section">
        <div className="home-section-inner">
          {/* Editorial image card containing heading and CTA */}
          <Link to="/collection" className="home-editorial-image-card">
            <img
              src="/wherever_your_day_leads_section.png"
              alt="Wherever your day leads"
              className="home-editorial-img"
            />
            <div className="home-editorial-overlay" />
            <h2 className="home-editorial-title">
              Wherever your day<br />leads.
            </h2>
            <div className="home-editorial-badge">
              <span className="home-editorial-btn">
                EXPLORE THE COLLECTION <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <div className="home-features-grid">
            {[
              {
                icon: FeatherFeatureIcon,
                title: "Thoughtful Design",
                desc: "Silhouettes drawn slowly, then edited until nothing extra remains."
              },
              {
                icon: FootprintsFeatureIcon,
                title: "Made for Movement",
                desc: "Footbeds and flex points shaped around real days on real streets."
              },
              {
                icon: CompassFeatureIcon,
                title: "Everyday Versatility",
                desc: "One pair that reads as easily at a desk as it does at dinner."
              },
              {
                icon: LayersFeatureIcon,
                title: "Considered Materials",
                desc: "Leathers and knits chosen to soften rather than wear out."
              }
            ].map((feat, idx) => {
              const IconComponent = feat.icon;
              return (
                <div key={feat.title} className={`home-feature-column reveal-delay-${idx + 1}`}>
                  <div className="home-feature-icon-wrapper">
                    <IconComponent size={32} strokeWidth={1.6} />
                  </div>
                  <h3 className="home-feature-title">{feat.title}</h3>
                  <p className="home-feature-desc">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====== NEWSLETTER SECTION ====== */}
      <section className="home-newsletter">
        <div className="home-newsletter-inner">
          <span className="home-newsletter-label">THE VÉLORA LIST</span>
          <h2 className="home-newsletter-heading">Step into what's next.</h2>
          <p className="home-newsletter-sub">
            Sign up for new arrivals, stories and occasional VÉLORA updates.
          </p>
          {subscribed ? (
            <div className="home-newsletter-success">
              <CheckCircle size={18} /> You're on the list!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="home-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="home-newsletter-input"
              />
              <button type="submit" className="home-newsletter-btn">JOIN US</button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};

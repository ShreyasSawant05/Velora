import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Feather, Footprints, Compass, Layers } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { PRODUCTS as staticProducts } from '../../data/products';
import { ProductCard } from '../../components/Product/ProductCard';
import { useCart } from '../../context/CartContext';
import './Home.css';

// Custom SVG Feature Icons with sub-elements for micro-animations
const FeatherFeatureIcon = ({ size = 20, strokeWidth = 1.35 }) => (
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
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13v5h5l9.76-9.76z" />
    <line x1="16" y1="8" x2="2" y2="22" />
    <line x1="17.5" y1="15" x2="9" y2="15" />
  </svg>
);

const FootprintsFeatureIcon = ({ size = 20, strokeWidth = 1.35 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="home-feature-icon feature-icon-footprints"
  >
    <g className="footprint-step-left">
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.5v2" />
      <path d="M4 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </g>
    <g className="footprint-step-right">
      <path d="M14 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C8.63 6 8 7.8 8 9.5c0 3.11 2 5.66 2 8.5v2" />
      <path d="M20 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </g>
  </svg>
);

const CompassFeatureIcon = ({ size = 20, strokeWidth = 1.35 }) => (
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

const LayersFeatureIcon = ({ size = 20, strokeWidth = 1.35 }) => (
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
  const { products: shopifyProducts, categories: contextCategories } = useProducts();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const allProducts = (shopifyProducts && shopifyProducts.length > 0) ? shopifyProducts : staticProducts;
  const newInProducts = allProducts.filter(p => p.badge === 'New').length > 0
    ? allProducts.filter(p => p.badge === 'New').slice(0, 4)
    : allProducts.slice(0, 4);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast("Thank you for joining the VÉLORA list!");
    setEmail('');
  };

  const categories = [
    { title: "Sneakers", subtitle: "Everyday low-tops", slug: "Sneakers" },
    { title: "Loafers", subtitle: "Slip-on refinement", slug: "Loafers" },
    { title: "Sandals", subtitle: "Warm-weather ease", slug: "Sandals" },
    { title: "Boots", subtitle: "Seasonless structure", slug: "Boots" }
  ].map(cat => {
    const matched = (contextCategories || []).find(
      c => c.name?.toLowerCase() === cat.title.toLowerCase() || c.slug?.toLowerCase() === cat.slug.toLowerCase()
    );
    return {
      ...cat,
      image: matched?.image || null
    };
  });

  return (
    <div className="home-page">

      {/* ====== HERO SECTION ====== */}
      <section className="home-hero">
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

      {/* ====== CATEGORIES SECTION ====== */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <h2 className="home-section-title">Find your everyday</h2>
            <Link to="/collection" className="home-section-link">
              View all categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="home-categories-grid">
            {categories.map((cat, index) => (
              <Link
                key={cat.title}
                to={`/collection?category=${cat.slug}`}
                className={`home-category-card reveal-delay-${(index % 4) + 1}`}
              >
                <div className="home-category-image">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.title} className="home-category-img" />
                  ) : (
                    <span className="home-category-placeholder-text">{cat.title}</span>
                  )}
                </div>
                <div className="home-category-info">
                  <h3 className="home-category-name">{cat.title}</h3>
                  <p className="home-category-sub">{cat.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== THE LATEST EDIT ====== */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <div className="home-section-header">
            <div>
              <h2 className="home-section-title">The latest edit</h2>
              <p className="home-section-subtitle">
                New silhouettes crafted for every day. Discover our newest arrivals.
              </p>
            </div>
          </div>

          <div className="home-products-grid">
            {newInProducts.map((product, index) => (
              <div key={product.id} className={`reveal-delay-${(index % 4) + 1}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMFORT, WITH INTENTION ====== */}
      <section className="home-section">
        <div className="home-section-inner">
          <div className="home-story-split">
            {/* Image side */}
            <div className="home-story-image">
              <div className="home-story-image-placeholder" />
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
          <div className="home-section-header">
            <h2 className="home-features-heading">
              Wherever your day<br />leads.
            </h2>
            <Link to="/collection" className="home-features-link">
              Explore the collection <ArrowRight size={14} />
            </Link>
          </div>

          {/* Editorial image container */}
          <div className="home-editorial-image">
            <span className="home-editorial-placeholder-text">Editorial Image</span>
          </div>

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
                    <IconComponent size={20} strokeWidth={1.35} />
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

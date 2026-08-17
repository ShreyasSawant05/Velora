import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import './Header.css';

export const Header = () => {
  const location = useLocation();
  const {
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useCart();
  const { categories, products } = useProducts();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredSpotlight, setHoveredSpotlight] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setHoveredSpotlight(null);
    }, 180);
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'COLLECTION', path: '/collection', hasDropdown: true },
    { name: 'CONTACT US', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const announcementText = "COMPLIMENTARY SHIPPING ON ORDERS OVER ₹5,000";

  // Category helpers for Men's and Women's
  const isMenCategory = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    const isWomen = s.includes('women') || s.includes('female') || s.includes('ladies');
    if (isWomen) return false;
    return s.includes('men') || s.includes('male') || s.includes('man');
  };

  const isWomenCategory = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return s.includes('women') || s.includes('female') || s.includes('ladies');
  };

  const validCategories = (categories || []).filter(c => c.id !== 'all' && c.name?.toLowerCase() !== 'all');
  const menCategories = validCategories.filter(c => isMenCategory(c.name || c.title));
  const womenCategories = validCategories.filter(c => isWomenCategory(c.name || c.title));

  // Default spotlight image from product or category fallback
  const defaultSpotlightImage = products?.[0]?.image || validCategories?.[0]?.image || null;
  const spotlightTitle = hoveredSpotlight?.name || "VÉLORA ESSENTIALS";
  const spotlightImage = hoveredSpotlight?.image || defaultSpotlightImage;
  const spotlightLink = hoveredSpotlight?.link || "/collection";

  return (
    <>
      {/* Animated Announcement Bar Marquee */}
      <div className="announcement-bar">
        <div className="announcement-track">
          {[1, 2].map((groupKey) => (
            <div key={groupKey} className="announcement-group">
              <span className="announcement-item">
                {announcementText}
                <span className="announcement-divider" />
              </span>
              <span className="announcement-item">
                CRAFTED FOR EVERYDAY MOVEMENT
                <span className="announcement-divider" />
              </span>
              <span className="announcement-item">
                {announcementText}
                <span className="announcement-divider" />
              </span>
              <span className="announcement-item">
                SUSTAINABLY MADE IN SMALL BATCHES
                <span className="announcement-divider" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Header Container */}
      <div
        className={`header-wrapper-relative ${isScrolled ? 'is-scrolled' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
          <div className="header-inner">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop Nav */}
            <nav className="desktop-nav">
              {navLinks.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.path}
                      className="nav-item-dropdown-trigger"
                      onMouseEnter={handleMouseEnter}
                    >
                      <Link
                        to={link.path}
                        className={`header-nav-link ${isActive(link.path) || isMegaMenuOpen ? 'active' : ''}`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown size={12} className={`nav-chevron ${isMegaMenuOpen ? 'chevron-rotated' : ''}`} />
                        <span className="nav-link-underline" />
                      </Link>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`header-nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onMouseEnter={() => setIsMegaMenuOpen(false)}
                  >
                    {link.name}
                    <span className="nav-link-underline" />
                  </Link>
                );
              })}
            </nav>

            {/* Logo */}
            <Link to="/" className="header-logo">
              VÉLORA
            </Link>

            {/* Action Icons */}
            <div className="header-actions">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="header-icon-btn"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/account"
                className="header-icon-btn"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => setIsCartOpen(true)}
                className="header-icon-btn header-cart-btn"
                aria-label="Shopping Bag"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="cart-count-badge">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ====== FULL-WIDTH GLASSMORPHIC MEGA MENU DROPDOWN ====== */}
          {isMegaMenuOpen && (
            <div
              className="mega-menu-dropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="mega-menu-inner">
                {/* Column 1: Shop By Segment */}
                <div className="mega-menu-col">
                  <span className="mega-menu-label">EXPLORE</span>
                  <ul className="mega-menu-links">
                    <li>
                      <Link
                        to="/collection"
                        onClick={() => setIsMegaMenuOpen(false)}
                        onMouseEnter={() => setHoveredSpotlight({ name: 'All Footwear Collection', image: defaultSpotlightImage, link: '/collection' })}
                      >
                        All Footwear
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/collection?category=Men"
                        onClick={() => setIsMegaMenuOpen(false)}
                        onMouseEnter={() => setHoveredSpotlight({ name: "Men's Collection", image: menCategories[0]?.image || defaultSpotlightImage, link: '/collection?category=Men' })}
                      >
                        Men's Collection
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/collection?category=Women"
                        onClick={() => setIsMegaMenuOpen(false)}
                        onMouseEnter={() => setHoveredSpotlight({ name: "Women's Collection", image: womenCategories[0]?.image || defaultSpotlightImage, link: '/collection?category=Women' })}
                      >
                        Women's Collection
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/collection?badge=New"
                        onClick={() => setIsMegaMenuOpen(false)}
                        onMouseEnter={() => setHoveredSpotlight({ name: "New Arrivals", image: products?.[0]?.image || defaultSpotlightImage, link: '/collection?badge=New' })}
                      >
                        New Arrivals
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Men's Categories */}
                <div className="mega-menu-col">
                  <span className="mega-menu-label">MEN'S FOOTWEAR</span>
                  <ul className="mega-menu-links">
                    {menCategories.length > 0 ? (
                      menCategories.map(cat => (
                        <li key={cat.id || cat.name}>
                          <Link
                            to={`/collection?category=${encodeURIComponent(cat.name)}`}
                            onClick={() => setIsMegaMenuOpen(false)}
                            onMouseEnter={() => setHoveredSpotlight({
                              name: cat.name,
                              image: cat.image || defaultSpotlightImage,
                              link: `/collection?category=${encodeURIComponent(cat.name)}`
                            })}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link to="/collection?category=Men" onClick={() => setIsMegaMenuOpen(false)}>
                          All Men's Shoes
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Column 3: Women's Categories */}
                <div className="mega-menu-col">
                  <span className="mega-menu-label">WOMEN'S FOOTWEAR</span>
                  <ul className="mega-menu-links">
                    {womenCategories.length > 0 ? (
                      womenCategories.map(cat => (
                        <li key={cat.id || cat.name}>
                          <Link
                            to={`/collection?category=${encodeURIComponent(cat.name)}`}
                            onClick={() => setIsMegaMenuOpen(false)}
                            onMouseEnter={() => setHoveredSpotlight({
                              name: cat.name,
                              image: cat.image || defaultSpotlightImage,
                              link: `/collection?category=${encodeURIComponent(cat.name)}`
                            })}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link to="/collection?category=Women" onClick={() => setIsMegaMenuOpen(false)}>
                          All Women's Shoes
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Column 4: Dynamic Visual Spotlight Card */}
                <div className="mega-menu-spotlight-wrapper">
                  <Link
                    to={spotlightLink}
                    className="mega-menu-spotlight-card"
                    onClick={() => setIsMegaMenuOpen(false)}
                  >
                    <div className="mega-menu-spotlight-img-box">
                      {spotlightImage ? (
                        <img src={spotlightImage} alt={spotlightTitle} />
                      ) : (
                        <div className="mega-menu-spotlight-placeholder" />
                      )}
                      <div className="mega-menu-spotlight-gradient" />
                    </div>
                    <div className="mega-menu-spotlight-info">
                      <span className="mega-menu-spotlight-badge">FEATURED SPOTLIGHT</span>
                      <h4 className="mega-menu-spotlight-title">{spotlightTitle}</h4>
                      <span className="mega-menu-spotlight-action">
                        EXPLORE NOW <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <nav className="mobile-nav-links">
              {navLinks.map((link) => (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                  {link.hasDropdown && (
                    <div className="mobile-sub-nav">
                      <Link to="/collection?category=Men" onClick={() => setIsMobileMenuOpen(false)}>— Men's Footwear</Link>
                      <Link to="/collection?category=Women" onClick={() => setIsMobileMenuOpen(false)}>— Women's Footwear</Link>
                      {validCategories.map(cat => (
                        <Link key={cat.id} to={`/collection?category=${encodeURIComponent(cat.name)}`} onClick={() => setIsMobileMenuOpen(false)}>
                          — {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

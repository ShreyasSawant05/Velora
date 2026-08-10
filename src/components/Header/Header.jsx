import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Header = () => {
  const location = useLocation();
  const {
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useCart();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'COLLECTION', path: '/collection' },
    { name: 'CONTACT US', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-sans)'
      }}>
        Complimentary shipping on orders over ₹5,000
      </div>

      {/* Main Header */}
      <header style={{
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'box-shadow 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1340px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)',
              display: 'none'
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px'
          }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`header-nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.name}
                <span className="nav-link-underline" />
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link to="/" className="header-logo">
            VÉLORA
          </Link>

          {/* Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div style={{
            backgroundColor: 'var(--background)',
            borderTop: '1px solid var(--border)',
            padding: '24px'
          }}
          className="mobile-nav-drawer"
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <style>{`
        .header-nav-link {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--muted-foreground);
          text-decoration: none;
          position: relative;
          padding: 4px 0;
          transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          font-family: var(--font-sans);
        }

        .header-nav-link:hover,
        .header-nav-link.active {
          color: var(--foreground);
        }

        .nav-link-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1.5px;
          background-color: var(--foreground);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-nav-link.active .nav-link-underline {
          transform: scaleX(1);
        }

        .header-nav-link:hover .nav-link-underline {
          transform: scaleX(1);
          transform-origin: left;
        }

        .header-logo {
          font-family: var(--font-serif);
          font-size: 24px;
          letter-spacing: 0.2em;
          font-weight: 500;
          color: var(--foreground);
          text-decoration: none;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          transition: letter-spacing 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-logo:hover {
          letter-spacing: 0.24em;
          transform: translateX(-50%) scale(1.02);
        }

        .header-icon-btn {
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease;
        }

        .header-icon-btn:hover {
          transform: scale(1.12);
          background-color: rgba(35, 31, 28, 0.05);
        }

        .cart-count-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          font-size: 10px;
          font-weight: 700;
          border-radius: 50%;
          background-color: var(--primary);
          color: var(--primary-foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-cart-btn:hover .cart-count-badge {
          transform: scale(1.2);
        }

        .mobile-nav-link {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--muted-foreground);
          text-decoration: none;
          padding: 6px 0;
          font-family: var(--font-sans);
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: var(--foreground);
          transform: translateX(4px);
        }

        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="velora-footer">
      <div className="footer-inner">
        <div className="footer-grid">

          {/* Brand + Newsletter Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">VÉLORA</Link>
            <p className="footer-tagline">
              Footwear for every step between here and there.
            </p>

            <div className="footer-newsletter">
              <span className="footer-newsletter-label">JOIN THE LIST</span>
              {subscribed ? (
                <p className="footer-subscribed">Thank you for subscribing!</p>
              ) : (
                <form onSubmit={handleJoin} className="footer-newsletter-form">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="footer-email-input"
                  />
                  <button type="submit" className="footer-join-btn">JOIN US</button>
                </form>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">SHOP</h4>
            <ul className="footer-links">
              <li><Link to="/collection">New Arrivals</Link></li>
              <li><Link to="/collection?category=Sneakers">Sneakers</Link></li>
              <li><Link to="/collection?category=Loafers">Loafers</Link></li>
              <li><Link to="/collection?category=Sandals">Sandals</Link></li>
              <li><Link to="/collection?category=Boots">Boots</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">ABOUT</h4>
            <ul className="footer-links">
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/about">Philosophy</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">HELP</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Shipping</Link></li>
              <li><Link to="/contact">Returns</Link></li>
              <li><Link to="/contact">Size Guide</Link></li>
              <li><Link to="/contact">FAQs</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">ACCOUNT</h4>
            <ul className="footer-links">
              <li><Link to="/collection">My Account</Link></li>
              <li><Link to="/collection">Orders</Link></li>
              <li><Link to="/collection">Wishlist</Link></li>
              <li><Link to="/collection">Cart</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">SOCIAL</h4>
            <ul className="footer-links">
              <li><a href="#" onClick={e => e.preventDefault()}>Instagram</a></li>
              <li><a href="#" onClick={e => e.preventDefault()}>Pinterest</a></li>
              <li><a href="#" onClick={e => e.preventDefault()}>Facebook</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 VÉLORA. All rights reserved. Fictional demo brand.
          </p>
          <div className="footer-legal">
            <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            <a href="#" onClick={e => e.preventDefault()}>Terms & Conditions</a>
            <a href="#" onClick={e => e.preventDefault()}>Shipping Policy</a>
            <a href="#" onClick={e => e.preventDefault()}>Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

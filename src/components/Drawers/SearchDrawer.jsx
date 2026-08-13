import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { searchProducts } from '../../lib/shopify/products.js';
import { PRODUCTS as staticProducts } from '../../data/products';
import { ProductCard } from '../Product/ProductCard';
import './SearchDrawer.css';

export const SearchDrawer = () => {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const { products: shopifyProducts, categories } = useProducts();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef();

  const allProducts = (shopifyProducts && shopifyProducts.length > 0) ? shopifyProducts : staticProducts;

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
    if (!isSearchOpen) {
      setQuery('');
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      // Perform local filtering first
      const localMatches = allProducts.filter(p =>
        (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      );

      // Perform dynamic Shopify Storefront search query
      searchProducts(query)
        .then(remoteMatches => {
          if (remoteMatches && remoteMatches.length > 0) {
            setSearchResults(remoteMatches);
          } else {
            setSearchResults(localMatches);
          }
        })
        .catch(err => {
          console.warn('Shopify search error:', err.message);
          setSearchResults(localMatches);
        })
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, allProducts]);

  if (!isSearchOpen) return null;

  const validCatNames = (categories || [])
    .filter(c => c.id !== 'all' && c.name?.toLowerCase() !== 'all')
    .map(c => c.name);

  const quickTags = validCatNames.length > 0 ? validCatNames.slice(0, 5) : ['Sneakers', 'Loafers', 'Boots'];

  return (
    <div className="search-overlay">
      {/* Backdrop */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className="search-backdrop"
      />

      {/* Search Panel */}
      <div className="search-panel">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={20} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search VÉLORA"
            className="search-input"
          />
          {searching && (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)', marginRight: '8px' }} />
          )}
          {query && (
            <button onClick={() => setQuery('')} className="search-clear-btn">
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="search-close-btn"
          >
            Close
          </button>
        </div>

        {/* Quick Tags */}
        {!query && (
          <div className="search-tags">
            <span className="search-tags-label">POPULAR SEARCHES</span>
            <div className="search-tags-list">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="search-tag"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query.length >= 2 && (
          <div className="search-results">
            {searching ? (
              <div className="search-no-results">
                <p className="search-no-results-title">Searching Shopify catalog...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="search-no-results">
                <p className="search-no-results-title">No results for "{query}"</p>
                <p className="search-no-results-sub">Try a different search term or browse our collection.</p>
              </div>
            ) : (
              <>
                <p className="search-results-count">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                </p>
                <div className="search-results-grid">
                  {searchResults.slice(0, 4).map((product) => (
                    <div key={product.id} onClick={() => setIsSearchOpen(false)}>
                      <ProductCard product={product} compact />
                    </div>
                  ))}
                </div>
                {searchResults.length > 4 && (
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="search-view-all"
                  >
                    View all {searchResults.length} results <ArrowRight size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

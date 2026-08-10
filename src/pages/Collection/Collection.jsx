import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../../components/Product/ProductCard';
import './Collection.css';

export const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategoryParam = searchParams.get('category') || 'All';

  const { products, categories, loading, error, refetch } = useProducts();

  const [activeCategory, setActiveCategory] = useState(activeCategoryParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    if (catName === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catName });
    }
  };

  // Filter
  let filtered = (products || []).filter(p => {
    if (activeCategory !== 'All' && p.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered];
  if (sortBy === 'low-high') sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
  else if (sortBy === 'high-low') sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
  else if (sortBy === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return (
    <div className="collection-page">

      {/* ---- HERO BANNER ---- */}
      <section className="collection-hero">
        <div className="collection-hero-inner">
          <span className="collection-hero-label">VÉLORA COLLECTION</span>
          <h1 className="collection-hero-heading">Footwear for every rhythm.</h1>
          <p className="collection-hero-sub">
            Explore considered silhouettes made for weekdays, weekends, journeys and everything in between.
          </p>
        </div>
      </section>

      {/* ---- MAIN CONTENT ---- */}
      <div className="collection-main">

        {/* Category tabs */}
        <div className="collection-tabs">
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`collection-tab ${isSelected ? 'collection-tab-active' : ''}`}
              >
                {cat.name.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="collection-filter-bar">
          <span className="collection-count">
            {loading ? 'LOADING...' : `${sorted.length} PRODUCTS`}
          </span>
          <div className="collection-filter-actions">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`collection-filter-btn ${isFilterOpen || inStockOnly ? 'collection-filter-btn-active' : ''}`}
            >
              <SlidersHorizontal size={14} />
              FILTER{inStockOnly ? ' (1)' : ''}
            </button>

            <div className="collection-sort-wrapper">
              <span className="collection-sort-label">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="collection-sort-select"
              >
                <option value="featured">FEATURED</option>
                <option value="low-high">PRICE: LOW–HIGH</option>
                <option value="high-low">PRICE: HIGH–LOW</option>
                <option value="name">NAME: A–Z</option>
              </select>
              <ChevronDown size={14} className="collection-sort-chevron" />
            </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="collection-filter-panel">
            <div className="collection-filter-panel-header">
              <h3>Filter Products</h3>
              {(inStockOnly || activeCategory !== 'All') && (
                <button
                  onClick={() => { setInStockOnly(false); handleCategoryChange('All'); }}
                  className="collection-filter-reset"
                >
                  Reset all
                </button>
              )}
            </div>
            <label className="collection-filter-checkbox">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <span>In stock only</span>
            </label>
          </div>
        )}

        {/* Error Notice State */}
        {error && !loading && (
          <div style={{
            padding: '24px',
            margin: '0 0 32px',
            backgroundColor: '#FFF8F8',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            color: '#7F1D1D',
            fontFamily: 'var(--font-sans)'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em' }}>
                SHOPIFY STOREFRONT API STATUS
              </h4>
              <p style={{ margin: '0 0 12px', fontSize: '13px', lineHeight: 1.5, color: '#991B1B' }}>
                {error}
              </p>
              <button
                onClick={refetch}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                <RefreshCw size={13} /> RETRY CONNECTING
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="collection-grid">
          {loading ? (
            // Skeleton Loader Cards
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card" style={{ opacity: 0.6 }}>
                <div
                  className="product-card-image"
                  style={{
                    backgroundColor: 'var(--muted)',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                />
                <div style={{ padding: '12px 2px 0' }}>
                  <div style={{ height: '16px', width: '60%', backgroundColor: 'var(--muted)', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ height: '12px', width: '40%', backgroundColor: 'var(--muted)', borderRadius: '4px' }} />
                </div>
              </div>
            ))
          ) : sorted.length === 0 && !error ? (
            <div className="collection-empty">
              <p className="collection-empty-title">No footwear matches your selection.</p>
              <p className="collection-empty-sub">Try clearing your filters or selecting a different category.</p>
              <button
                onClick={() => { setInStockOnly(false); handleCategoryChange('All'); }}
                className="collection-empty-btn"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : (
            sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

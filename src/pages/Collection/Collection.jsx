import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, RefreshCw, AlertCircle, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';
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
  const [gridCols, setGridCols] = useState(4);

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

  // Helpers to detect Men's and Women's category names/handles/tags
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

  // Helper to match product against active category/collection
  const matchesCategory = (p, catParam) => {
    if (!catParam || catParam.toLowerCase() === 'all') return true;

    const query = catParam.toLowerCase().trim();
    const pCat = (p.category || '').toLowerCase();
    const pName = (p.name || '').toLowerCase();
    const pCols = (p.collections || []).map(c => ({
      title: (c.title || '').toLowerCase(),
      handle: (c.handle || '').toLowerCase()
    }));
    const pTags = (p.tags || []).map(t => (t || '').toLowerCase());

    if (query === 'men') {
      return pCols.some(c => isMenCategory(c.title) || isMenCategory(c.handle)) ||
             isMenCategory(pCat) ||
             isMenCategory(pName) ||
             pTags.some(t => isMenCategory(t));
    }

    if (query === 'women') {
      return pCols.some(c => isWomenCategory(c.title) || isWomenCategory(c.handle)) ||
             isWomenCategory(pCat) ||
             isWomenCategory(pName) ||
             pTags.some(t => isWomenCategory(t));
    }

    // Direct match against category title, handle, or collection title/handle
    if (pCat === query) return true;
    if (pCols.some(c => c.title === query || c.handle === query)) return true;
    
    // Partial substring match (e.g. 'boots' matching 'Men\'s Boots')
    if (pCols.some(c => c.title.includes(query) || c.handle.includes(query))) return true;
    if (pCat.includes(query)) return true;

    return false;
  };

  // Filter products
  let filtered = (products || []).filter(p => {
    if (!matchesCategory(p, activeCategory)) return false;
    if (inStockOnly && !p.inStock) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered];
  if (sortBy === 'low-high') sorted.sort((a, b) => (a.priceValue || 0) - (b.priceValue || 0));
  else if (sortBy === 'high-low') sorted.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
  else if (sortBy === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Determine active segment (ALL, MEN, WOMEN) based on activeCategory
  let activeSegment = 'ALL';
  const catLower = (activeCategory || '').toLowerCase();
  if (catLower === 'men' || isMenCategory(catLower)) {
    activeSegment = 'MEN';
  } else if (catLower === 'women' || isWomenCategory(catLower)) {
    activeSegment = 'WOMEN';
  }

  // Build sub-categories based on activeSegment
  let subCategories = [];
  if (activeSegment === 'MEN') {
    const menCollections = categories.filter(c => isMenCategory(c.name || c.title));
    subCategories = [
      { id: 'sub-men-all', name: "Men", label: "ALL MEN'S" },
      ...menCollections.map(c => ({
        id: c.id,
        name: c.name,
        label: c.name.replace(/^(Men's|Mens|Men)\s*/i, '').trim().toUpperCase() || c.name.toUpperCase()
      }))
    ];
  } else if (activeSegment === 'WOMEN') {
    const womenCollections = categories.filter(c => isWomenCategory(c.name || c.title));
    subCategories = [
      { id: 'sub-women-all', name: "Women", label: "ALL WOMEN'S" },
      ...womenCollections.map(c => ({
        id: c.id,
        name: c.name,
        label: c.name.replace(/^(Women's|Womens|Women)\s*/i, '').trim().toUpperCase() || c.name.toUpperCase()
      }))
    ];
  } else {
    // ALL segment
    const allProductTypes = Array.from(new Set(
      categories
        .filter(c => c.id !== 'all' && c.name?.toLowerCase() !== 'all')
        .map(c => c.name.replace(/^(Men's|Mens|Men|Women's|Womens|Women)\s*/i, '').trim())
    ));
    subCategories = [
      { id: 'sub-all-all', name: "All", label: "ALL FOOTWEAR" },
      ...allProductTypes.map(type => ({
        id: `type-${type}`,
        name: type,
        label: type.toUpperCase()
      }))
    ];
  }

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

        {/* Two-Tier Category Navigation */}
        <div className="collection-nav-wrapper">
          {/* Primary Segment Tabs */}
          <div className="collection-primary-tabs">
            {[
              { id: 'seg-all', name: 'All', label: 'ALL' },
              { id: 'seg-men', name: 'Men', label: 'MEN' },
              { id: 'seg-women', name: 'Women', label: 'WOMEN' },
            ].map((seg) => {
              const isSelected = activeSegment === seg.label;
              return (
                <button
                  key={seg.id}
                  onClick={() => handleCategoryChange(seg.name)}
                  className={`collection-primary-tab ${isSelected ? 'collection-primary-tab-active' : ''}`}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>

          {/* Contextual Sub-Pills */}
          <div className="collection-sub-tabs">
            {subCategories.map((sub) => {
              const isSelected = activeCategory.toLowerCase() === sub.name.toLowerCase();
              return (
                <button
                  key={sub.id}
                  onClick={() => handleCategoryChange(sub.name)}
                  className={`collection-sub-tab ${isSelected ? 'collection-sub-tab-active' : ''}`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
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
            {/* Grid View Switcher */}
            <div className="collection-grid-switcher">
              <button
                type="button"
                className={`collection-grid-btn ${gridCols === 2 ? 'active' : ''}`}
                onClick={() => setGridCols(2)}
                title="2 Columns (Large)"
              >
                <Grid2X2 size={14} />
              </button>
              <button
                type="button"
                className={`collection-grid-btn ${gridCols === 4 ? 'active' : ''}`}
                onClick={() => setGridCols(4)}
                title="4 Columns (Standard)"
              >
                <Grid3X3 size={14} />
              </button>
              <button
                type="button"
                className={`collection-grid-btn ${gridCols === 6 ? 'active' : ''}`}
                onClick={() => setGridCols(6)}
                title="6 Columns (Compact)"
              >
                <LayoutGrid size={14} />
              </button>
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
        <div className={`collection-grid grid-cols-${gridCols}`}>
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

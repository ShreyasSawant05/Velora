import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts } from '../lib/shopify/products.js';

const ProductContext = createContext();

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All', slug: 'all' },
  { id: 'sneakers', name: 'Sneakers', subtitle: 'Everyday low-tops', slug: 'Sneakers' },
  { id: 'loafers', name: 'Loafers', subtitle: 'Slip-on refinement', slug: 'Loafers' },
  { id: 'sandals', name: 'Sandals', subtitle: 'Warm-weather ease', slug: 'Sandals' },
  { id: 'boots', name: 'Boots', subtitle: 'Seasonless structure', slug: 'Boots' },
  { id: 'flats', name: 'Flats', subtitle: 'Flexible elegance', slug: 'Flats' },
  { id: 'formal', name: 'Formal', subtitle: 'Handcrafted detail', slug: 'Formal' }
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const shopifyProducts = await getProducts(50);
      setProducts(shopifyProducts);

      // Derive categories dynamically from Shopify products if collections exist
      if (shopifyProducts && shopifyProducts.length > 0) {
        const foundCategories = new Set();
        shopifyProducts.forEach(p => {
          if (p.category && p.category !== 'Footwear') {
            foundCategories.add(p.category);
          }
        });

        if (foundCategories.size > 0) {
          const dynamicCatList = [{ id: 'all', name: 'All', slug: 'all' }];
          Array.from(foundCategories).forEach((catName, idx) => {
            dynamicCatList.push({
              id: `cat-${idx}-${catName.toLowerCase().replace(/\s+/g, '-')}`,
              name: catName,
              subtitle: '',
              slug: catName
            });
          });
          setCategories(dynamicCatList);
        }
      }
    } catch (err) {
      console.error('Failed to load Shopify products:', err);
      setError(err.message || 'Unable to connect to Shopify store.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        refetch: fetchProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

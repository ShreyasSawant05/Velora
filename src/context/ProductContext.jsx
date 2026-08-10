import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts, getCollections } from '../lib/shopify/products.js';

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
      const [shopifyProducts, shopifyCollections] = await Promise.all([
        getProducts(50),
        getCollections(10)
      ]);

      setProducts(shopifyProducts);

      // Map Shopify collection images
      const collectionMap = new Map();
      (shopifyCollections || []).forEach(col => {
        if (col.title) collectionMap.set(col.title.toLowerCase(), col);
        if (col.handle) collectionMap.set(col.handle.toLowerCase(), col);
      });

      // Enrich default categories with images
      const enrichedCategories = DEFAULT_CATEGORIES.map(cat => {
        const matched = collectionMap.get(cat.name.toLowerCase()) || collectionMap.get(cat.slug.toLowerCase());
        return {
          ...cat,
          image: matched?.image || null
        };
      });

      // Add any additional collections from Shopify
      if (shopifyCollections && shopifyCollections.length > 0) {
        shopifyCollections.forEach((col, idx) => {
          const exists = enrichedCategories.some(c => c.name.toLowerCase() === col.title.toLowerCase());
          if (!exists) {
            enrichedCategories.push({
              id: `shopify-col-${col.id || idx}`,
              name: col.title,
              subtitle: col.description || '',
              slug: col.title,
              image: col.image
            });
          }
        });
      }

      setCategories(enrichedCategories);
    } catch (err) {
      console.error('Failed to load Shopify data:', err);
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

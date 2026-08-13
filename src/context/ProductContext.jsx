import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProducts, getCollections } from '../lib/shopify/products.js';

const ProductContext = createContext();

const FALLBACK_CATEGORIES = [
  { id: 'all', name: 'All', title: 'All', slug: 'all' }
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [shopifyCollections, setShopifyCollections] = useState([]);

  const fetchProducts = useCallback(async (forceCacheBust = false) => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProducts, fetchedCollections] = await Promise.all([
        getProducts(50, { cacheBust: forceCacheBust }),
        getCollections(50, { cacheBust: forceCacheBust })
      ]);

      setProducts(fetchedProducts);
      setShopifyCollections(fetchedCollections);

      if (fetchedCollections && fetchedCollections.length > 0) {
        const dynamicCategories = [
          { id: 'all', name: 'All', title: 'All', slug: 'all' },
          ...fetchedCollections.map((col, idx) => ({
            id: col.id || `col-${idx}`,
            name: col.title,
            title: col.title,
            handle: col.handle,
            slug: col.handle || col.title,
            image: col.image,
            subtitle: col.description ? col.description.split('.')[0] : '',
            description: col.description || ''
          }))
        ];
        setCategories(dynamicCategories);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
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
        shopifyCollections,
        loading,
        error,
        refetch: fetchProducts,
        syncWithShopify: () => fetchProducts(true)
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

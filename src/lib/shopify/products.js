import { shopifyFetch } from './client.js';
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, SEARCH_PRODUCTS_QUERY, COLLECTIONS_QUERY } from './queries.js';

// Color name to Hex map for UI swatches
const COLOR_HEX_MAP = {
  ivory: '#F7F4EE',
  espresso: '#241F1B',
  sand: '#E9E1D6',
  stone: '#DDD7CE',
  taupe: '#B7AA9A',
  clay: '#A9714B',
  black: '#1A1A1A',
  white: '#FFFFFF',
  brown: '#5C4033',
  beige: '#F5F5DC',
  tan: '#D2B48C',
  grey: '#808080',
  gray: '#808080',
  navy: '#1B263B',
};

function getColorHex(colorName) {
  if (!colorName) return '#999999';
  const key = colorName.trim().toLowerCase();
  return COLOR_HEX_MAP[key] || '#888888';
}

function formatPrice(amount, currencyCode = 'INR') {
  const numericAmount = parseFloat(amount || 0);
  if (isNaN(numericAmount)) return '₹0';
  
  if (currencyCode === 'INR') {
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  }
  return `${currencyCode} ${numericAmount.toLocaleString()}`;
}

/**
 * Maps a single raw Shopify Storefront GraphQL product node into the format
 * expected by existing Vélora frontend components.
 */
export function mapShopifyProduct(node) {
  if (!node) return null;

  // Extract images
  const featuredImage = node.featuredImage?.url || null;
  const imageEdges = node.images?.edges || [];
  const images = imageEdges.map(e => e.node.url).filter(Boolean);
  const primaryImage = featuredImage || (images.length > 0 ? images[0] : null);

  // Extract prices
  const minPrice = node.priceRange?.minVariantPrice?.amount || '0';
  const currency = node.priceRange?.minVariantPrice?.currencyCode || 'INR';
  const priceValue = parseFloat(minPrice);
  const price = formatPrice(minPrice, currency);

  const compareAtAmount = node.compareAtPriceRange?.minVariantPrice?.amount;
  const compareAtPriceValue = compareAtAmount && parseFloat(compareAtAmount) > priceValue ? parseFloat(compareAtAmount) : null;
  const compareAtPrice = compareAtPriceValue ? formatPrice(compareAtAmount, currency) : null;

  // Extract collections and category
  const collections = (node.collections?.edges || []).map(e => e.node);
  const primaryCollection = collections.length > 0 ? collections[0].title : null;
  const category = primaryCollection || node.productType || 'Footwear';

  // Extract options (Color, Size)
  const rawOptions = node.options || [];
  let colors = [];
  let sizes = [];

  rawOptions.forEach(opt => {
    const optNameLower = opt.name.toLowerCase();
    if (optNameLower.includes('color') || optNameLower.includes('colour')) {
      colors = (opt.values || []).map(val => ({
        name: val,
        hex: getColorHex(val)
      }));
    } else if (optNameLower.includes('size')) {
      sizes = (opt.values || []).map(val => {
        const num = parseInt(val, 10);
        return isNaN(num) ? val : num;
      });
    }
  });

  // Extract variants
  const variants = (node.variants?.edges || []).map(e => {
    const v = e.node;
    const vPriceValue = parseFloat(v.price?.amount || '0');
    return {
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: formatPrice(v.price?.amount, v.price?.currencyCode || currency),
      priceValue: vPriceValue,
      compareAtPrice: v.compareAtPrice?.amount ? formatPrice(v.compareAtPrice?.amount, v.compareAtPrice?.currencyCode || currency) : null,
      selectedOptions: v.selectedOptions || [],
      image: v.image?.url || primaryImage
    };
  });

  // Extract badge status
  const tags = node.tags || [];
  let badge = null;
  if (!node.availableForSale) {
    badge = 'Sold out';
  } else if (tags.some(t => t.toLowerCase() === 'new' || t.toLowerCase() === 'new arrival')) {
    badge = 'New';
  }

  // Extract subtitle
  let subtitle = '';
  const subtitleTag = tags.find(t => t.toLowerCase().startsWith('subtitle:'));
  if (subtitleTag) {
    subtitle = subtitleTag.replace(/^subtitle:/i, '').trim();
  } else if (node.description) {
    subtitle = node.description.split('.')[0].slice(0, 50);
  }

  return {
    id: node.id,
    shopifyId: node.id,
    handle: node.handle,
    name: node.title,
    subtitle: subtitle,
    category: category,
    price: price,
    priceValue: priceValue,
    compareAtPrice: compareAtPrice,
    compareAtPriceValue: compareAtPriceValue,
    badge: badge,
    image: primaryImage,
    images: images.length > 0 ? images : (primaryImage ? [primaryImage] : []),
    colors: colors,
    sizes: sizes,
    inStock: Boolean(node.availableForSale),
    description: node.description || '',
    createdAt: node.createdAt || null,
    collections: collections,
    options: rawOptions,
    variants: variants
  };
}

/**
 * Fetch products from Shopify Storefront API and map to Vélora components format.
 */
export async function getProducts(first = 50, options = {}) {
  const data = await shopifyFetch({
    query: PRODUCTS_QUERY,
    variables: { 
      first,
      sortKey: options.sortKey || 'CREATED_AT',
      reverse: options.reverse !== undefined ? options.reverse : true
    },
    cacheBust: options.cacheBust
  });

  const edges = data?.products?.edges || [];
  return edges.map(edge => mapShopifyProduct(edge.node)).filter(Boolean);
}

/**
 * Fetch a single product by handle from Shopify Storefront API.
 */
export async function getProductByHandle(handle, options = {}) {
  const data = await shopifyFetch({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    cacheBust: options.cacheBust
  });

  if (!data?.product) return null;
  return mapShopifyProduct(data.product);
}

/**
 * Search products dynamically from Shopify Storefront API.
 */
export async function searchProducts(searchTerm) {
  if (!searchTerm || searchTerm.trim().length === 0) return [];
  const data = await shopifyFetch({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query: searchTerm, first: 20 }
  });

  const edges = data?.products?.edges || [];
  return edges.map(edge => mapShopifyProduct(edge.node)).filter(Boolean);
}

/**
 * Fetch collections dynamically from Shopify Storefront API.
 */
export async function getCollections(first = 50, options = {}) {
  try {
    const data = await shopifyFetch({
      query: COLLECTIONS_QUERY,
      variables: { first },
      cacheBust: options.cacheBust
    });

    const edges = data?.collections?.edges || [];
    return edges.map(edge => {
      const node = edge.node;
      const imageUrl = node.image?.url || node.products?.edges?.[0]?.node?.featuredImage?.url || null;
      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        slug: node.handle || node.title,
        image: imageUrl,
        description: node.description || ''
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn('Failed to fetch collections from Shopify:', err);
    return [];
  }
}

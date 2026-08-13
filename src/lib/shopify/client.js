const SHOPIFY_ENDPOINT = 'https://brandforge-12.myshopify.com/api/2026-07/graphql.json';

/**
 * Perform a GraphQL fetch request to Shopify Storefront API.
 * Uses tokenless access by default, or optionally includes X-Shopify-Storefront-Access-Token
 * if provided in environment variables (VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN).
 *
 * @param {Object} options
 * @param {string} options.query - GraphQL query string
 * @param {Object} [options.variables] - GraphQL query variables
 * @returns {Promise<Object>} GraphQL response data object
 */
export async function shopifyFetch({ query, variables = {}, cacheBust = false }) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (cacheBust) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers['Pragma'] = 'no-cache';
  }

  // Public Storefront Access Token from .env
  const storefrontToken = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN) ||
    (typeof process !== 'undefined' && process.env?.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN);

  if (storefrontToken) {
    headers['X-Shopify-Storefront-Access-Token'] = storefrontToken;
  }

  const endpoint = cacheBust 
    ? `${SHOPIFY_ENDPOINT}?_t=${Date.now()}` 
    : SHOPIFY_ENDPOINT;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      cache: cacheBust ? 'no-store' : 'default'
    });

    if (!response.ok) {
      let errBody = '';
      try {
        const errJson = await response.json();
        if (errJson.errors && errJson.errors.length > 0) {
          errBody = errJson.errors.map(e => e.message).join(', ');
        } else if (errJson.message) {
          errBody = errJson.message;
        } else {
          errBody = JSON.stringify(errJson);
        }
      } catch (e) {
        errBody = response.statusText;
      }
      throw new Error(`Shopify API error (${response.status}): ${errBody}`);
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      const errorMessage = json.errors.map(e => e.message).join(', ');
      throw new Error(`Shopify GraphQL error: ${errorMessage}`);
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching from Shopify Storefront API:', error);
    throw error;
  }
}

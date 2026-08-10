import { shopifyFetch } from './client.js';

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            product {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
    totalTaxAmount {
      amount
      currencyCode
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FRAGMENT}
    }
  }
`;

const ADD_TO_CART_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CART_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_BUYER_IDENTITY_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function formatPrice(amount, currencyCode = 'INR') {
  const numericAmount = parseFloat(amount || 0);
  if (isNaN(numericAmount)) return '₹0';
  if (currencyCode === 'INR') {
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  }
  return `${currencyCode} ${numericAmount.toLocaleString()}`;
}

export function mapShopifyCart(cart) {
  if (!cart) return null;

  const lineEdges = cart.lines?.edges || [];
  const items = lineEdges.map(edge => {
    const node = edge.node;
    const merch = node.merchandise || {};
    const product = merch.product || {};

    const options = merch.selectedOptions || [];
    const sizeOpt = options.find(o => o.name.toLowerCase().includes('size'))?.value || null;
    const colorOpt = options.find(o => o.name.toLowerCase().includes('color') || o.name.toLowerCase().includes('colour'))?.value || null;

    const unitPriceAmount = merch.price?.amount || '0';
    const unitPriceValue = parseFloat(unitPriceAmount);

    return {
      lineId: node.id,
      cartId: node.id,
      variantId: merch.id,
      id: product.id || merch.id,
      name: product.title || merch.title || 'Product',
      subtitle: merch.title !== 'Default Title' ? merch.title : '',
      price: formatPrice(unitPriceAmount, merch.price?.currencyCode),
      priceValue: unitPriceValue,
      image: merch.image?.url || product.featuredImage?.url || null,
      selectedSize: sizeOpt,
      selectedColor: colorOpt,
      quantity: node.quantity,
      handle: product.handle || ''
    };
  });

  const subtotalAmount = cart.cost?.subtotalAmount?.amount || '0';
  const subtotalValue = parseFloat(subtotalAmount);

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    cartCount: cart.totalQuantity || 0,
    cartSubtotal: subtotalValue,
    items
  };
}

export async function createShopifyCart(lines = []) {
  const data = await shopifyFetch({
    query: CREATE_CART_MUTATION,
    variables: { input: { lines } }
  });
  if (data?.cartCreate?.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors.map(e => e.message).join(', '));
  }
  return mapShopifyCart(data?.cartCreate?.cart);
}

export async function fetchShopifyCart(cartId) {
  if (!cartId) return null;
  const data = await shopifyFetch({
    query: GET_CART_QUERY,
    variables: { cartId }
  });
  if (!data?.cart) return null;
  return mapShopifyCart(data.cart);
}

export async function addItemToShopifyCart(cartId, merchandiseId, quantity = 1) {
  if (!cartId) {
    return createShopifyCart([{ merchandiseId, quantity }]);
  }
  const data = await shopifyFetch({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines: [{ merchandiseId, quantity }] }
  });
  if (data?.cartLinesAdd?.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors.map(e => e.message).join(', '));
  }
  return mapShopifyCart(data?.cartLinesAdd?.cart);
}

export async function updateShopifyCartLine(cartId, lineId, quantity) {
  const data = await shopifyFetch({
    query: UPDATE_CART_MUTATION,
    variables: { cartId, lines: [{ id: lineId, quantity }] }
  });
  if (data?.cartLinesUpdate?.userErrors?.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map(e => e.message).join(', '));
  }
  return mapShopifyCart(data?.cartLinesUpdate?.cart);
}

export async function removeShopifyCartLine(cartId, lineId) {
  const data = await shopifyFetch({
    query: REMOVE_FROM_CART_MUTATION,
    variables: { cartId, lineIds: [lineId] }
  });
  if (data?.cartLinesRemove?.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors.map(e => e.message).join(', '));
  }
  return mapShopifyCart(data?.cartLinesRemove?.cart);
}

export async function updateCartBuyerIdentity(cartId, customerAccessToken) {
  if (!cartId || !customerAccessToken) return null;
  const data = await shopifyFetch({
    query: UPDATE_BUYER_IDENTITY_MUTATION,
    variables: { cartId, buyerIdentity: { customerAccessToken } }
  });
  return data?.cartBuyerIdentityUpdate?.cart || null;
}

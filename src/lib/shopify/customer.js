import { shopifyFetch } from './client.js';

const LOGIN_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const GET_CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      defaultAddress {
        id
        address1
        address2
        city
        province
        zip
        country
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
      orders(first: 20) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    title
                    image {
                      url
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ADDRESS_CREATE_MUTATION = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const ADDRESS_UPDATE_MUTATION = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const ADDRESS_DELETE_MUTATION = `
  mutation customerAddressDelete($id: ID!, $customerAccessToken: String!) {
    customerAddressDelete(id: $id, customerAccessToken: $customerAccessToken) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function loginCustomer(email, password) {
  const data = await shopifyFetch({
    query: LOGIN_MUTATION,
    variables: { input: { email, password } }
  });

  const errors = data?.customerAccessTokenCreate?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }

  return data?.customerAccessTokenCreate?.customerAccessToken || null;
}

export async function logoutCustomer(accessToken) {
  if (!accessToken) return true;
  try {
    await shopifyFetch({
      query: LOGOUT_MUTATION,
      variables: { customerAccessToken: accessToken }
    });
  } catch (e) {
    console.warn('Logout API warning:', e.message);
  }
  return true;
}

export async function registerCustomer(email, password, firstName = '', lastName = '') {
  const data = await shopifyFetch({
    query: REGISTER_MUTATION,
    variables: { input: { email, password, firstName, lastName } }
  });

  const errors = data?.customerCreate?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }

  return data?.customerCreate?.customer || null;
}

export async function getCustomerProfile(accessToken) {
  if (!accessToken) return null;
  const data = await shopifyFetch({
    query: GET_CUSTOMER_QUERY,
    variables: { customerAccessToken: accessToken }
  });

  const cust = data?.customer;
  if (!cust) return null;

  const orders = (cust.orders?.edges || []).map(e => {
    const o = e.node;
    return {
      id: o.id,
      name: o.name || `#${o.orderNumber}`,
      processedAt: o.processedAt,
      financialStatus: o.financialStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      totalPrice: `${o.totalPrice?.currencyCode || 'INR'} ${parseFloat(o.totalPrice?.amount || '0').toLocaleString()}`,
      lineItems: (o.lineItems?.edges || []).map(li => ({
        title: li.node.title,
        quantity: li.node.quantity,
        variantTitle: li.node.variant?.title,
        image: li.node.variant?.image?.url
      }))
    };
  });

  const addresses = (cust.addresses?.edges || []).map(e => e.node);

  return {
    id: cust.id,
    firstName: cust.firstName || '',
    lastName: cust.lastName || '',
    email: cust.email || '',
    phone: cust.phone || '',
    defaultAddress: cust.defaultAddress,
    addresses,
    orders
  };
}

export async function createCustomerAddress(accessToken, address) {
  const data = await shopifyFetch({
    query: ADDRESS_CREATE_MUTATION,
    variables: { customerAccessToken: accessToken, address }
  });
  const errors = data?.customerAddressCreate?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data?.customerAddressCreate?.customerAddress;
}

export async function updateCustomerAddress(accessToken, addressId, address) {
  const data = await shopifyFetch({
    query: ADDRESS_UPDATE_MUTATION,
    variables: { customerAccessToken: accessToken, id: addressId, address }
  });
  const errors = data?.customerAddressUpdate?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data?.customerAddressUpdate?.customerAddress;
}

export async function deleteCustomerAddress(accessToken, addressId) {
  const data = await shopifyFetch({
    query: ADDRESS_DELETE_MUTATION,
    variables: { customerAccessToken: accessToken, id: addressId }
  });
  const errors = data?.customerAddressDelete?.customerUserErrors || [];
  if (errors.length > 0) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return true;
}

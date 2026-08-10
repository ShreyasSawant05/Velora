import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to manually load .env file without external dependencies
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const SHOPIFY_SHOP = 'brandforge-12.myshopify.com';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET must be set in your local .env file.');
  console.error('Please create a .env file in the root of the project with:');
  console.error('SHOPIFY_CLIENT_ID=your_client_id');
  console.error('SHOPIFY_CLIENT_SECRET=your_client_secret\n');
  process.exit(1);
}

async function getAdminToken() {
  const tokenUrl = `https://${SHOPIFY_SHOP}/admin/oauth/access_token`;
  
  // Try JSON payload first, fallback to form-urlencoded
  let res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });

  if (!res.ok) {
    const bodyParams = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    });
    res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams.toString()
    });
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to exchange client credentials (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`No access_token returned from Shopify OAuth: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function createStorefrontAccessToken(adminToken) {
  const graphqlUrl = `https://${SHOPIFY_SHOP}/admin/api/2026-07/graphql.json`;
  
  const mutation = `
    mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        userErrors {
          field
          message
        }
        storefrontAccessToken {
          accessToken
          title
          accessScopes {
            handle
          }
        }
      }
    }
  `;

  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          title: "Vélora Storefront"
        }
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Shopify Admin GraphQL request failed (${res.status}): ${errorText}`);
  }

  const result = await res.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL Errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  const payload = result.data?.storefrontAccessTokenCreate;

  if (payload?.userErrors && payload.userErrors.length > 0) {
    throw new Error(`User Errors: ${payload.userErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
  }

  return payload?.storefrontAccessToken;
}

async function main() {
  try {
    const adminToken = await getAdminToken();
    const tokenInfo = await createStorefrontAccessToken(adminToken);

    if (!tokenInfo) {
      throw new Error('No Storefront Access Token payload returned.');
    }

    const scopes = (tokenInfo.accessScopes || []).map(s => s.handle).join(', ');

    console.log('\n======================================================');
    console.log('✅ SHOPIFY STOREFRONT PUBLIC ACCESS TOKEN CREATED');
    console.log('======================================================');
    console.log(`Title:       ${tokenInfo.title}`);
    console.log(`Access Token: ${tokenInfo.accessToken}`);
    console.log(`Scopes:      ${scopes || 'N/A'}`);
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error generating Storefront Access Token:', error.message);
    process.exit(1);
  }
}

main();

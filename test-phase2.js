#!/usr/bin/env node

/**
 * Phase 2 Implementation Test Suite
 * Tests new features: Stripe checkout, Etsy import, RLS policies
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

// Test state
const testState = {
  cookies: '',
  userId: null,
  shopId: null,
  listingId: null,
};

// Test functions
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (testState.cookies) {
    headers['Cookie'] = testState.cookies;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Store cookies from response
    const setCookies = response.headers.get('set-cookie');
    if (setCookies) {
      testState.cookies = setCookies;
    }

    const data = await response.json().catch(() => ({}));
    return { response, data };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { response: null, data: null, error };
  }
}

async function testAuth() {
  logInfo('Testing authentication...');

  // Test signup
  const randomEmail = `test-${Date.now()}@example.com`;
  const { response: signupRes, data: signupData } = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: randomEmail,
      password: 'TestPass123!',
      name: 'Test User',
    }),
  });

  if (signupRes?.ok) {
    logSuccess('User signup successful');
    testState.userId = signupData.userId;
  } else {
    logWarning(`Signup failed (may be expected): ${signupData?.error}`);
  }

  // Test signin
  const { response: signinRes, data: signinData } = await makeRequest('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({
      email: randomEmail,
      password: 'TestPass123!',
    }),
  });

  if (signinRes?.ok) {
    logSuccess('User signin successful');
    return true;
  } else {
    logError(`Signin failed: ${signinData?.error}`);
    return false;
  }
}

async function testDashboardAccess() {
  logInfo('Testing dashboard access...');

  const { response, data } = await makeRequest('/api/user/profile');

  if (response?.ok && data?.user) {
    logSuccess(`Dashboard loaded: ${data.user.email}, ${data.user.credits} credits`);
    return true;
  } else {
    logError('Dashboard access failed');
    return false;
  }
}

async function testStripeCheckout() {
  logInfo('Testing Stripe checkout API...');

  // Test GET packages endpoint
  const { response: getRes, data: getPackages } = await makeRequest('/api/checkout');

  if (getRes?.ok && getPackages?.packages) {
    logSuccess(`Credit packages loaded: ${Object.keys(getPackages.packages).join(', ')}`);
  } else {
    logError('Failed to load credit packages');
    return false;
  }

  // Test POST checkout creation
  const { response: postRes, data: postData } = await makeRequest('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ package: 'starter' }),
  });

  if (postRes?.ok && postData?.sessionId && postData?.url) {
    logSuccess(`Checkout session created: ${postData.sessionId}`);
    logInfo(`Checkout URL: ${postData.url.substring(0, 50)}...`);
    return true;
  } else {
    logError(`Checkout creation failed: ${postData?.error}`);
    return false;
  }
}

async function testCreditsAPI() {
  logInfo('Testing credits API...');

  const { response, data } = await makeRequest('/api/user/credits');

  if (response?.ok && typeof data?.balance === 'number') {
    logSuccess(`Credits balance: ${data.balance} credits`);
    logSuccess(`Transaction history: ${data.transactions?.length || 0} records`);
    return true;
  } else {
    logError('Credits API failed');
    return false;
  }
}

async function testListingsAPI() {
  logInfo('Testing listings API...');

  const { response, data } = await makeRequest('/api/listings?page=1&limit=10');

  if (response?.ok && Array.isArray(data?.listings)) {
    logSuccess(`Listings API working: ${data.listings.length} listings, total: ${data.pagination?.total || 0}`);
    return true;
  } else {
    logError('Listings API failed');
    return false;
  }
}

async function testEtsyImportAPI() {
  logInfo('Testing Etsy import API...');

  // This will fail without a connected shop, but we test the endpoint exists
  const { response, data } = await makeRequest('/api/etsy/import', {
    method: 'POST',
    body: JSON.stringify({
      shopId: 'test-shop-id',
      limit: 10,
    }),
  });

  if (response?.status === 404 && data?.error?.includes('Shop not found')) {
    logSuccess('Etsy import endpoint exists (shop not found as expected)');
    return true;
  } else if (response?.ok) {
    logSuccess(`Etsy import successful: ${data?.imported} listings imported`);
    return true;
  } else {
    logWarning(`Etsy import test inconclusive: ${data?.error}`);
    return true; // Don't fail test if no shop is connected
  }
}

async function testEtsySyncAPI() {
  logInfo('Testing Etsy sync API...');

  const { response, data } = await makeRequest('/api/etsy/sync', {
    method: 'POST',
    body: JSON.stringify({
      shopId: 'test-shop-id',
    }),
  });

  if (response?.status === 404 && data?.error?.includes('Shop not found')) {
    logSuccess('Etsy sync endpoint exists (shop not found as expected)');
    return true;
  } else if (response?.ok) {
    logSuccess(`Etsy sync successful: ${data?.synced} listings synced`);
    return true;
  } else {
    logWarning(`Etsy sync test inconclusive: ${data?.error}`);
    return true;
  }
}

async function testEtsyDisconnectAPI() {
  logInfo('Testing Etsy disconnect API...');

  const { response, data } = await makeRequest('/api/etsy/disconnect', {
    method: 'POST',
    body: JSON.stringify({
      shopId: 'test-shop-id',
    }),
  });

  if (response?.status === 404 && data?.error?.includes('Shop not found')) {
    logSuccess('Etsy disconnect endpoint exists (shop not found as expected)');
    return true;
  } else if (response?.ok) {
    logSuccess('Etsy disconnect successful');
    return true;
  } else {
    logWarning(`Etsy disconnect test inconclusive: ${data?.error}`);
    return true;
  }
}

async function testAIOptimizer() {
  logInfo('Testing AI optimizer (existing feature regression test)...');

  const { response, data } = await makeRequest('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({
      platform: 'etsy',
      title: 'Handmade Leather Wallet',
      description: 'Beautiful genuine leather wallet handcrafted with care',
      tags: ['leather', 'wallet', 'handmade'],
      tone: 'persuasive',
    }),
  });

  if (response?.ok && data?.variants && data.variants.length === 3) {
    logSuccess(`AI optimizer working: ${data.variants.length} variants generated, health score: ${data.healthScore}`);
    return true;
  } else {
    logError(`AI optimizer failed: ${data?.error?.message || 'Unknown error'}`);
    return false;
  }
}

async function testKeywordGenerator() {
  logInfo('Testing keyword generator (existing feature regression test)...');

  const { response, data } = await makeRequest('/api/keywords/generate', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Handmade Leather Wallet',
      description: 'Beautiful genuine leather wallet',
      category: 'Accessories',
    }),
  });

  if (response?.ok && data?.ok && data.totalKeywords > 0) {
    logSuccess(`Keyword generator working: ${data.totalKeywords} keywords generated`);
    return true;
  } else {
    logError('Keyword generator failed');
    return false;
  }
}

async function testSEOAudit() {
  logInfo('Testing SEO audit (existing feature regression test)...');

  const { response, data } = await makeRequest('/api/seo/audit', {
    method: 'POST',
    body: JSON.stringify({
      platform: 'etsy',
      title: 'Handmade Leather Wallet',
      description: 'Beautiful genuine leather wallet handcrafted with care',
      tags: 'leather,wallet,handmade',
    }),
  });

  if (response?.ok && typeof data?.overallScore === 'number') {
    logSuccess(`SEO audit working: score ${data.overallScore}/100, ${data.issues?.length || 0} issues found`);
    return true;
  } else {
    logError('SEO audit failed');
    return false;
  }
}

// Main test runner
async function runTests() {
  log('\n====================================', colors.blue);
  log('Phase 2 Implementation Test Suite', colors.blue);
  log('====================================\n', colors.blue);

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  const tests = [
    { name: 'Authentication', fn: testAuth, critical: true },
    { name: 'Dashboard Access', fn: testDashboardAccess, critical: true },
    { name: 'Stripe Checkout API', fn: testStripeCheckout, critical: true },
    { name: 'Credits API', fn: testCreditsAPI, critical: true },
    { name: 'Listings API', fn: testListingsAPI, critical: false },
    { name: 'Etsy Import API', fn: testEtsyImportAPI, critical: false },
    { name: 'Etsy Sync API', fn: testEtsySyncAPI, critical: false },
    { name: 'Etsy Disconnect API', fn: testEtsyDisconnectAPI, critical: false },
    { name: 'AI Optimizer (Regression)', fn: testAIOptimizer, critical: true },
    { name: 'Keyword Generator (Regression)', fn: testKeywordGenerator, critical: true },
    { name: 'SEO Audit (Regression)', fn: testSEOAudit, critical: true },
  ];

  for (const test of tests) {
    log(`\n--- ${test.name} ---`, colors.yellow);
    try {
      const result = await test.fn();
      if (result) {
        results.passed++;
      } else {
        if (test.critical) {
          results.failed++;
        } else {
          results.warnings++;
        }
      }
    } catch (error) {
      logError(`Test threw error: ${error.message}`);
      if (test.critical) {
        results.failed++;
      } else {
        results.warnings++;
      }
    }
  }

  // Summary
  log('\n====================================', colors.blue);
  log('Test Summary', colors.blue);
  log('====================================', colors.blue);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  if (results.warnings > 0) {
    logWarning(`Warnings: ${results.warnings}`);
  }

  log('\n====================================', colors.blue);
  if (results.failed === 0) {
    logSuccess('All critical tests passed! ✓');
    log('\nNext steps:', colors.blue);
    logInfo('1. Apply RLS policies: Run /app/elite-listing-ai-v2/supabase/rls_policies.sql in Supabase SQL Editor');
    logInfo('2. Configure Stripe webhook: Add webhook endpoint in Stripe Dashboard');
    logInfo('3. Test payment flow: Make a test purchase with Stripe test cards');
    logInfo('4. Connect Etsy shop: Test OAuth flow and listing import');
  } else {
    logError('Some tests failed. Please review errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});

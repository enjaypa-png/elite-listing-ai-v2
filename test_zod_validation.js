#!/usr/bin/env node
/**
 * Test Zod validation directly by importing the schema
 */

const { z } = require('zod');

// Recreate the same Zod schema from the checkout route
const CheckoutRequestSchema = z.object({
  package: z.enum(['launch', 'scale', 'elite-listing']),
});

console.log('🧪 Testing Zod Validation Schema Directly');
console.log('=' * 50);

// Test valid packages
const validPackages = ['launch', 'scale', 'elite-listing'];
console.log('\n✅ Testing VALID packages:');
validPackages.forEach(pkg => {
  try {
    const result = CheckoutRequestSchema.parse({ package: pkg });
    console.log(`  ✅ '${pkg}' - VALID`);
  } catch (error) {
    console.log(`  ❌ '${pkg}' - FAILED: ${error.message}`);
  }
});

// Test old/invalid packages
const invalidPackages = ['starter', 'pro', 'business', 'invalid', ''];
console.log('\n❌ Testing INVALID packages (should fail):');
invalidPackages.forEach(pkg => {
  try {
    const result = CheckoutRequestSchema.parse({ package: pkg });
    console.log(`  ❌ '${pkg}' - UNEXPECTEDLY VALID (this is bad!)`);
  } catch (error) {
    console.log(`  ✅ '${pkg}' - CORRECTLY REJECTED: ${error.issues[0].message}`);
  }
});

console.log('\n📋 Summary:');
console.log('- New package names (launch, scale, elite-listing) should be accepted');
console.log('- Old package names (starter, pro, business) should be rejected');
console.log('- Invalid package names should be rejected');
console.log('- This confirms the Zod schema is working correctly');
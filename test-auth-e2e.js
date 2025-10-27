// E2E test for authentication flow
const crypto = require('crypto');

const testEmail = `test-${crypto.randomBytes(4).toString('hex')}@example.com`;
const testPassword = 'password123';
const testName = 'Test User';

async function runE2ETest(baseUrl) {
  console.log(`\n🧪 Running E2E Auth Tests at ${baseUrl}\n`);
  
  let passed = 0;
  let failed = 0;

  // Test 1: Sign in with non-existent email should show friendly error
  console.log('Test 1: Sign in with non-existent email');
  try {
    const checkRes = await fetch(`${baseUrl}/api/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const checkData = await checkRes.json();
    
    if (checkRes.status === 200 && checkData.exists === false) {
      console.log('✅ Check-user API returns exists: false for non-existent email');
      passed++;
    } else {
      console.log(`❌ Expected exists: false, got: ${JSON.stringify(checkData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 1 failed: ${error.message}`);
    failed++;
  }

  // Test 2: Create account successfully
  console.log('\nTest 2: Create account successfully');
  try {
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword, 
        name: testName 
      })
    });
    const signupData = await signupRes.json();
    
    if (signupRes.status === 201 && signupData.user) {
      console.log(`✅ Account created: ${signupData.user.email}`);
      console.log(`   User ID: ${signupData.user.id}`);
      console.log(`   Name: ${signupData.user.name}`);
      console.log(`   Request ID: ${signupData.requestId}`);
      passed++;
    } else {
      console.log(`❌ Expected 201, got ${signupRes.status}: ${JSON.stringify(signupData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 2 failed: ${error.message}`);
    failed++;
  }

  // Test 3: Duplicate email should return 409
  console.log('\nTest 3: Duplicate email should return 409');
  try {
    const dupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword, 
        name: testName 
      })
    });
    const dupData = await dupRes.json();
    
    if (dupRes.status === 409 && dupData.error === "User already exists") {
      console.log(`✅ Duplicate email rejected with 409`);
      console.log(`   Error: ${dupData.error}`);
      console.log(`   Request ID: ${dupData.requestId}`);
      passed++;
    } else {
      console.log(`❌ Expected 409, got ${dupRes.status}: ${JSON.stringify(dupData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 3 failed: ${error.message}`);
    failed++;
  }

  // Test 4: Check user now exists
  console.log('\nTest 4: Check user now exists');
  try {
    const checkRes = await fetch(`${baseUrl}/api/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const checkData = await checkRes.json();
    
    if (checkRes.status === 200 && checkData.exists === true) {
      console.log('✅ Check-user API returns exists: true for created user');
      passed++;
    } else {
      console.log(`❌ Expected exists: true, got: ${JSON.stringify(checkData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 4 failed: ${error.message}`);
    failed++;
  }

  // Test 5: Missing name should return 400
  console.log('\nTest 5: Missing name should return 400 with friendly message');
  try {
    const noNameRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: `test2-${crypto.randomBytes(4).toString('hex')}@example.com`, 
        password: testPassword 
      })
    });
    const noNameData = await noNameRes.json();
    
    if (noNameRes.status === 400 && noNameData.error === "Name is required") {
      console.log(`✅ Missing name returns 400 with friendly error`);
      console.log(`   Error: ${noNameData.error}`);
      console.log(`   Request ID: ${noNameData.requestId}`);
      passed++;
    } else {
      console.log(`❌ Expected 400 "Name is required", got ${noNameRes.status}: ${JSON.stringify(noNameData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 5 failed: ${error.message}`);
    failed++;
  }

  // Test 6: Invalid email should return 400
  console.log('\nTest 6: Invalid email should return 400');
  try {
    const badEmailRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'not-an-email', 
        password: testPassword, 
        name: testName 
      })
    });
    const badEmailData = await badEmailRes.json();
    
    if (badEmailRes.status === 400 && badEmailData.error === "Invalid email address") {
      console.log(`✅ Invalid email returns 400`);
      console.log(`   Error: ${badEmailData.error}`);
      passed++;
    } else {
      console.log(`❌ Expected 400 "Invalid email address", got ${badEmailRes.status}: ${JSON.stringify(badEmailData)}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Test 6 failed: ${error.message}`);
    failed++;
  }

  console.log(`\n📊 E2E Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('✅ All E2E tests passed!\n');
  } else {
    console.log('❌ Some tests failed. Check the output above for details.\n');
  }
  
  return failed === 0;
}

// Get base URL from command line or use default
const baseUrl = process.argv[2] || 'http://localhost:3000';
runE2ETest(baseUrl).then(success => {
  process.exit(success ? 0 : 1);
});


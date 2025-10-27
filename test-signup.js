// Simple test script to verify sign-up validation
const testCases = [
  {
    name: "Valid sign-up",
    data: { name: "John Doe", email: "john@example.com", password: "password123" },
    expectedStatus: 201,
    expectedError: null
  },
  {
    name: "Missing name",
    data: { email: "jane@example.com", password: "password123" },
    expectedStatus: 400,
    expectedError: "Name is required"
  },
  {
    name: "Empty name",
    data: { name: "", email: "jane@example.com", password: "password123" },
    expectedStatus: 400,
    expectedError: "Name is required"
  },
  {
    name: "Name too long",
    data: { name: "A".repeat(81), email: "jane@example.com", password: "password123" },
    expectedStatus: 400,
    expectedError: "Name must be less than 80 characters"
  },
  {
    name: "Short password",
    data: { name: "Jane Doe", email: "jane@example.com", password: "12345" },
    expectedStatus: 400,
    expectedError: "Password must be at least 6 characters"
  },
  {
    name: "Invalid email",
    data: { name: "Jane Doe", email: "not-an-email", password: "password123" },
    expectedStatus: 400,
    expectedError: "Invalid email address"
  }
];

async function runTests(baseUrl) {
  console.log(`\n🧪 Testing sign-up endpoint at ${baseUrl}\n`);
  
  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });

      const data = await response.json();
      const statusMatch = response.status === test.expectedStatus;
      const errorMatch = test.expectedError ? data.error === test.expectedError : !data.error;

      if (statusMatch && errorMatch) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus} - ${test.expectedError || 'success'}`);
        console.log(`   Got: ${response.status} - ${data.error || 'success'}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Get base URL from command line or use default
const baseUrl = process.argv[2] || 'http://localhost:3000';
runTests(baseUrl).then(success => {
  process.exit(success ? 0 : 1);
});


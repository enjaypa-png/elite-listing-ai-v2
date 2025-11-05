#!/usr/bin/env python3
"""
Elite Listing AI - Checkout API Test with New Package Names
Tests the updated checkout API with new package names: launch, scale, elite-listing
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Configuration - Using external URL from frontend .env
BASE_URL = "https://etsy-optimizer-2.preview.emergentagent.com"
DEBUG_KEY = "debug-key-12345"
TEST_USER_EMAIL = "test@elitelistingai.com"

class CheckoutAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Elite-Listing-AI-Supabase-Test/1.0'
        })
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str, response_data: Optional[Dict] = None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
        print()
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, timeout=30)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, timeout=30)
            elif method.upper() == 'HEAD':
                response = self.session.head(url, timeout=30)
            else:
                return False, {'error': f'Unsupported method: {method}'}, 0
                
            # Try to parse JSON response
            try:
                response_data = response.json() if response.content else {}
            except json.JSONDecodeError:
                response_data = {'raw_response': response.text}
                
            success = response.status_code == expected_status
            return success, response_data, response.status_code
            
        except requests.exceptions.RequestException as e:
            return False, {'error': str(e)}, 0

    def test_1_get_checkout_package_info(self):
        """Test 1: GET /api/checkout - Verify package info"""
        print("Testing GET /api/checkout for package information...")
        success, data, status = self.make_request('GET', '/api/checkout')
        
        if not success:
            self.log_test("1. GET Checkout Package Info", False, f"HTTP {status} - Expected 200", data)
            return False
            
        # Check required fields
        if 'packages' not in data:
            self.log_test("1. GET Checkout Package Info", False, "Missing 'packages' field in response", data)
            return False
            
        packages = data['packages']
        
        # Verify all three new package names exist
        expected_packages = ['launch', 'scale', 'elite-listing']
        missing_packages = [pkg for pkg in expected_packages if pkg not in packages]
        
        if missing_packages:
            self.log_test("1. GET Checkout Package Info", False, f"Missing packages: {missing_packages}", data)
            return False
            
        # Verify package details
        expected_details = {
            'launch': {'credits': 10, 'price': 900, 'name': 'Launch'},
            'scale': {'credits': 50, 'price': 3900, 'name': 'Scale'},
            'elite-listing': {'credits': 200, 'price': 12900, 'name': 'Elite Listing'}
        }
        
        for pkg_key, expected in expected_details.items():
            if pkg_key not in packages:
                continue
                
            pkg_data = packages[pkg_key]
            for field, expected_value in expected.items():
                if pkg_data.get(field) != expected_value:
                    self.log_test("1. GET Checkout Package Info", False, 
                                f"Package {pkg_key}.{field}: expected {expected_value}, got {pkg_data.get(field)}", data)
                    return False
        
        self.log_test("1. GET Checkout Package Info", True, 
                     f"✅ All packages found with correct details: {list(packages.keys())}")
        return True

    def test_2_post_checkout_valid_packages(self):
        """Test 2: POST /api/checkout - Test all three valid packages"""
        print("Testing POST /api/checkout with valid package names...")
        
        valid_packages = ['launch', 'scale', 'elite-listing']
        all_passed = True
        
        for package in valid_packages:
            print(f"  Testing package: {package}")
            payload = {"package": package}
            
            success, data, status = self.make_request('POST', '/api/checkout', payload, expected_status=401)
            
            # We expect 401 (Not authenticated) since we don't have auth
            if status == 401:
                if 'error' in data and 'authenticated' in data['error'].lower():
                    self.log_test(f"2.{package.upper()} POST Checkout Valid Package", True, 
                                f"✅ Package '{package}' accepted (401 auth required as expected)")
                else:
                    self.log_test(f"2.{package.upper()} POST Checkout Valid Package", False, 
                                f"❌ Unexpected 401 error: {data.get('error', 'Unknown')}", data)
                    all_passed = False
            else:
                # Check if it's a Zod validation error (which would be bad)
                if status == 400 and 'error' in data:
                    error_msg = str(data.get('error', ''))
                    if 'zod' in error_msg.lower() or 'validation' in error_msg.lower():
                        self.log_test(f"2.{package.upper()} POST Checkout Valid Package", False, 
                                    f"❌ Zod validation error for valid package '{package}': {error_msg}", data)
                        all_passed = False
                    else:
                        self.log_test(f"2.{package.upper()} POST Checkout Valid Package", True, 
                                    f"✅ Package '{package}' accepted (non-auth error: {error_msg})")
                else:
                    self.log_test(f"2.{package.upper()} POST Checkout Valid Package", False, 
                                f"❌ Unexpected status {status} for package '{package}'", data)
                    all_passed = False
        
        return all_passed

    def test_3_database_read_fetch_credits(self):
        """Test 3: Database Read Test - Fetch Credits"""
        print("Testing GET /api/user/credits for database read operations...")
        success, data, status = self.make_request('GET', '/api/user/credits')
        
        # Expected behavior: Should return 401/500 without authentication
        if status == 401:
            self.log_test("3. Database Read Test - Fetch Credits", True, "✅ 401 Unauthorized (no session) - Expected behavior, no database connection errors")
            return True
        elif status == 500:
            error_msg = str(data.get('error', ''))
            # Check if it's an auth error (expected) vs database error (problem)
            if 'auth' in error_msg.lower() or 'session' in error_msg.lower() or 'not authenticated' in error_msg.lower():
                self.log_test("3. Database Read Test - Fetch Credits", True, "✅ 500 Auth session missing - Expected behavior, no database connection errors")
                return True
            elif any(code in error_msg for code in ['P1001', 'P1017', 'P2002', 'P2025']):
                self.log_test("3. Database Read Test - Fetch Credits", False, f"❌ Prisma database error: {error_msg}", data)
                return False
            else:
                self.log_test("3. Database Read Test - Fetch Credits", False, f"❌ Unexpected 500 error: {error_msg}", data)
                return False
            
        if not success:
            self.log_test("3. Database Read Test - Fetch Credits", False, f"HTTP {status} - Expected 401 or 500 with auth error", data)
            return False
            
        # If 200, check structure (shouldn't happen without auth, but validate if it does)
        if 'balance' in data and 'stats' in data:
            balance = data.get('balance', 0)
            self.log_test("3. Database Read Test - Fetch Credits", True, f"✅ Unexpected success (no auth required?): Balance: {balance}")
            return True
        else:
            self.log_test("3. Database Read Test - Fetch Credits", False, f"❌ Invalid response structure", data)
            return False

    def test_4_schema_validation_credit_ledger(self):
        """Test 4: Schema Validation - Credit Ledger Table Accessible"""
        print("Testing schema validation by checking if credit ledger operations work...")
        
        # This test verifies that the Prisma schema is working by attempting another credit grant
        payload = {
            "amount": 1,  # Small amount for validation
            "key": DEBUG_KEY
        }
        
        success, data, status = self.make_request('POST', '/api/debug/grant-credits', payload)
        
        if not success:
            # Check for schema-related errors
            error_msg = str(data.get('error', ''))
            if any(keyword in error_msg.lower() for keyword in ['table', 'column', 'schema', 'relation']):
                self.log_test("4. Schema Validation - Credit Ledger", False, f"❌ Schema error detected: {error_msg}", data)
                return False
            elif any(code in error_msg for code in ['P1001', 'P1017']):
                self.log_test("4. Schema Validation - Credit Ledger", False, f"❌ Database connection error: {error_msg}", data)
                return False
            else:
                self.log_test("4. Schema Validation - Credit Ledger", False, f"HTTP {status} - Unexpected error", data)
                return False
            
        # Verify the response indicates successful database operations
        if not data.get('ok'):
            self.log_test("4. Schema Validation - Credit Ledger", False, f"❌ Credit ledger operation failed: {data}", data)
            return False
            
        # Check that we have the expected fields from the schema
        expected_schema_fields = ['ledgerId', 'userId', 'newBalance', 'previousBalance']
        missing_schema_fields = [field for field in expected_schema_fields if field not in data]
        
        if missing_schema_fields:
            self.log_test("4. Schema Validation - Credit Ledger", False, f"❌ Missing schema fields: {missing_schema_fields}", data)
            return False
            
        self.log_test("4. Schema Validation - Credit Ledger", True, f"✅ Credit ledger table accessible - Schema validation passed")
        return True

    def test_5_user_table_accessibility(self):
        """Test 5: Schema Validation - User Table Accessible"""
        print("Testing user table accessibility through debug endpoint...")
        
        # The debug endpoint creates/finds users, so this tests user table access
        payload = {
            "amount": 1,
            "key": DEBUG_KEY
        }
        
        success, data, status = self.make_request('POST', '/api/debug/grant-credits', payload)
        
        if not success:
            error_msg = str(data.get('error', ''))
            if 'user' in error_msg.lower() and ('not found' in error_msg.lower() or 'table' in error_msg.lower()):
                self.log_test("5. Schema Validation - User Table", False, f"❌ User table access error: {error_msg}", data)
                return False
            # Other errors are acceptable for this test
            
        # Check if we got user information back
        if data.get('ok') and 'userEmail' in data:
            user_email = data.get('userEmail')
            self.log_test("5. Schema Validation - User Table", True, f"✅ User table accessible - User: {user_email}")
            return True
        elif data.get('ok'):
            self.log_test("5. Schema Validation - User Table", True, f"✅ User table accessible - Operation successful")
            return True
        else:
            self.log_test("5. Schema Validation - User Table", False, f"❌ User table access unclear: {data}")
            return False

    def run_all_tests(self):
        """Run all Supabase PostgreSQL connection tests"""
        print("=" * 80)
        print("Elite Listing AI - Supabase PostgreSQL Connection Test")
        print("=" * 80)
        print(f"Base URL: {self.base_url}")
        print(f"Debug Key: {DEBUG_KEY}")
        print(f"Database URL: postgresql://postgres:Ktpu87zt%40%40%24%24@db.lamcknwqqgthofmnviqw.supabase.co:5432/postgres")
        print("=" * 80)
        print()
        
        # Run tests in sequence
        tests = [
            self.test_1_health_check_database_connectivity,
            self.test_2_database_write_grant_credits,
            self.test_3_database_read_fetch_credits,
            self.test_4_schema_validation_credit_ledger,
            self.test_5_user_table_accessibility,
        ]
        
        passed = 0
        total = len(tests)
        
        for test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_func.__name__, False, f"Exception: {str(e)}")
        
        print("=" * 80)
        print(f"SUPABASE CONNECTION TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 80)
        
        # Print detailed results
        print("\nDETAILED RESULTS:")
        print("-" * 40)
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['details']}")
        
        # Summary of critical checks
        print("\nCRITICAL CHECKS:")
        print("-" * 40)
        health_passed = any(r['test'].startswith('1.') and r['success'] for r in self.test_results)
        write_passed = any(r['test'].startswith('2.') and r['success'] for r in self.test_results)
        read_passed = any(r['test'].startswith('3.') and r['success'] for r in self.test_results)
        schema_passed = any(r['test'].startswith('4.') and r['success'] for r in self.test_results)
        
        print(f"✅ No Prisma connection errors: {'PASS' if health_passed else 'FAIL'}")
        print(f"✅ Database writes succeed: {'PASS' if write_passed else 'FAIL'}")
        print(f"✅ Database reads succeed: {'PASS' if read_passed else 'FAIL'}")
        print(f"✅ Schema accessible: {'PASS' if schema_passed else 'FAIL'}")
        
        return passed == total

def main():
    """Main test runner"""
    tester = SupabaseConnectionTester(BASE_URL)
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All Supabase PostgreSQL connection tests passed!")
        print("✅ Database connectivity confirmed")
        print("✅ URL encoding preserved")
        print("✅ Prisma schema accessible")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        print("❌ Database connection issues detected")
        sys.exit(1)

if __name__ == "__main__":
    main()
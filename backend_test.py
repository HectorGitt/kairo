import requests
import sys
import json
from datetime import datetime, timezone

class KairoAPITester:
    def __init__(self, base_url="https://mindful-tabs.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "username": f"testuser_{timestamp}",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {response['user']['username']}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # Try to login with the registered user
        if not hasattr(self, 'test_email'):
            return False
            
        login_data = {
            "email": self.test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_browsing_session_creation(self):
        """Test creating browsing session"""
        if not self.token:
            self.log_test("Browsing Session Creation", False, "No auth token available")
            return False
            
        session_data = {
            "url": "https://github.com/user/repo",
            "title": "GitHub Repository",
            "domain": "github.com",
            "category": "productive",
            "time_spent": 300  # 5 minutes
        }
        
        success, response = self.run_test(
            "Create Browsing Session",
            "POST",
            "browsing/session",
            200,
            data=session_data
        )
        return success

    def test_browsing_stats(self):
        """Test getting browsing statistics"""
        if not self.token:
            self.log_test("Browsing Stats", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Browsing Stats",
            "GET",
            "browsing/stats",
            200
        )
        
        if success:
            print(f"   Stats: {json.dumps(response, indent=2)}")
        return success

    def test_browsing_sessions_list(self):
        """Test getting browsing sessions list"""
        if not self.token:
            self.log_test("Browsing Sessions List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Browsing Sessions",
            "GET",
            "browsing/sessions",
            200
        )
        return success

    def test_ai_insights_generation(self):
        """Test AI insights generation"""
        if not self.token:
            self.log_test("AI Insights Generation", False, "No auth token available")
            return False
            
        print("   Note: AI insights may take 10-15 seconds to generate...")
        success, response = self.run_test(
            "Generate AI Insights",
            "POST",
            "insights/generate",
            200,
            data={}
        )
        
        if success and 'insights' in response:
            print(f"   Generated insights: {response['insights'][:100]}...")
        return success

    def test_daily_insights_list(self):
        """Test getting daily insights"""
        if not self.token:
            self.log_test("Daily Insights List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Daily Insights",
            "GET",
            "insights/daily",
            200
        )
        return success

    def test_focus_goals_creation(self):
        """Test creating focus goals"""
        if not self.token:
            self.log_test("Focus Goals Creation", False, "No auth token available")
            return False
            
        goal_data = {
            "goal_type": "daily_focus_hours",
            "target_value": 6
        }
        
        success, response = self.run_test(
            "Create Focus Goal",
            "POST",
            "goals",
            200,
            data=goal_data
        )
        return success

    def test_focus_goals_list(self):
        """Test getting focus goals"""
        if not self.token:
            self.log_test("Focus Goals List", False, "No auth token available")
            return False
            
        success, response = self.run_test(
            "Get Focus Goals",
            "GET",
            "goals",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "browsing/stats",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Kairo API Tests")
        print("=" * 50)
        
        # Basic tests
        self.test_health_check()
        
        # Auth tests
        if self.test_register():
            # Store email for login test
            timestamp = datetime.now().strftime("%H%M%S")
            self.test_email = f"test_user_{timestamp}@kairo.test"
        
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Protected endpoint tests (require authentication)
        if self.token:
            self.test_browsing_session_creation()
            self.test_browsing_stats()
            self.test_browsing_sessions_list()
            self.test_focus_goals_creation()
            self.test_focus_goals_list()
            self.test_daily_insights_list()
            
            # AI insights test (may be slow)
            print("\n⚠️  Testing AI insights generation (this may take 10-15 seconds)...")
            self.test_ai_insights_generation()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = KairoAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
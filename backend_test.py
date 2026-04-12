import requests
import sys
import json
import time
from datetime import datetime

class ChatSafetyTester:
    def __init__(self, base_url="https://troubleshoot-guide-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_start_chat_social_media(self):
        """Test starting a social media chat"""
        success, response = self.run_test(
            "Start Social Media Chat",
            "POST",
            "start-chat",
            200,
            data={"platform_type": "social_media"},
            timeout=10
        )
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   Session ID: {self.session_id}")
            return True
        return False

    def test_start_chat_gaming(self):
        """Test starting a gaming chat"""
        success, response = self.run_test(
            "Start Gaming Chat",
            "POST",
            "start-chat",
            200,
            data={"platform_type": "gaming"},
            timeout=10
        )
        if success and 'session_id' in response:
            # Store for potential future use, but keep original session_id for flow
            print(f"   Gaming Session ID: {response['session_id']}")
            return True
        return False

    def test_start_chat_invalid_platform(self):
        """Test starting chat with invalid platform"""
        success, _ = self.run_test(
            "Start Chat Invalid Platform",
            "POST",
            "start-chat",
            400,
            data={"platform_type": "invalid_platform"}
        )
        return success

    def test_send_message(self):
        """Test sending a message"""
        if not self.session_id:
            print("❌ No session ID available for message test")
            return False
        
        success, response = self.run_test(
            "Send Message",
            "POST",
            "send-message",
            200,
            data={
                "session_id": self.session_id,
                "message": "Hi there! How are you doing?"
            },
            timeout=15  # AI calls may take time
        )
        
        if success:
            # Check response structure
            required_fields = ['bot_response', 'analysis']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            # Check bot_response structure
            bot_response = response.get('bot_response', {})
            if 'content' not in bot_response:
                print("❌ Missing 'content' in bot_response")
                return False
                
            # Check analysis structure
            analysis = response.get('analysis', {})
            analysis_fields = ['score', 'red_flags', 'green_flags', 'alternative_suggestions']
            for field in analysis_fields:
                if field not in analysis:
                    print(f"❌ Missing analysis field: {field}")
                    return False
            
            print(f"   Bot Response: {bot_response.get('content', '')[:100]}...")
            print(f"   Safety Score: {analysis.get('score', 'N/A')}")
            return True
        
        return False

    def test_send_message_invalid_session(self):
        """Test sending message with invalid session"""
        success, _ = self.run_test(
            "Send Message Invalid Session",
            "POST",
            "send-message",
            404,
            data={
                "session_id": "invalid-session-id",
                "message": "Hello"
            }
        )
        return success

    def test_end_chat_block(self):
        """Test ending chat with block action"""
        if not self.session_id:
            print("❌ No session ID available for end chat test")
            return False
        
        success, response = self.run_test(
            "End Chat - Block",
            "POST",
            "end-chat",
            200,
            data={
                "session_id": self.session_id,
                "action": "block"
            },
            timeout=15  # AI evaluation may take time
        )
        
        if success:
            # Check response structure
            required_fields = ['final_score', 'was_correct_action', 'decision_feedback', 
                             'explanation', 'safety_recommendation', 'bot_truth']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            print(f"   Final Score: {response.get('final_score', 'N/A')}")
            print(f"   Correct Action: {response.get('was_correct_action', 'N/A')}")
            return True
        
        return False

    def test_end_chat_invalid_session(self):
        """Test ending chat with invalid session"""
        success, _ = self.run_test(
            "End Chat Invalid Session",
            "POST",
            "end-chat",
            404,
            data={
                "session_id": "invalid-session-id",
                "action": "report"
            }
        )
        return success

def main():
    print("🚀 Starting Chat Safety Trainer API Tests")
    print("=" * 50)
    
    tester = ChatSafetyTester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_start_chat_social_media,
        tester.test_start_chat_gaming,
        tester.test_start_chat_invalid_platform,
        tester.test_send_message,
        tester.test_send_message_invalid_session,
        tester.test_end_chat_block,
        tester.test_end_chat_invalid_session,
    ]
    
    for test in tests:
        try:
            test()
            # Small delay between tests
            time.sleep(0.5)
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
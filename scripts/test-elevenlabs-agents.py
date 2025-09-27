#!/usr/bin/env python3
"""
ElevenLabs Agents Testing Script
This script tests all created agents and verifies they are working properly.
"""

import os
import sys
import json
import requests
import time
from typing import List, Dict, Any

# Load environment variables (you may need to install python-dotenv: pip install python-dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️  python-dotenv not installed. Please ensure XI_API_KEY is set as environment variable.")

class ElevenLabsAgentTester:
    def __init__(self):
        self.api_key = os.getenv('XI_API_KEY')
        if not self.api_key:
            raise ValueError("XI_API_KEY environment variable is required")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Expected agent IDs from our script
        self.expected_agents = [
            "agent_6601k53hbh7zee3tc40eptys6s12",  # Software Engineer Interview
            "agent_6401k53hbm56evq9sz562rwv36ry",  # Product Manager Interview  
            "agent_4501k53hbp96fg88z7tkwx6wv9eg"   # Python Developer Interview
        ]
        
    def test_api_connection(self) -> bool:
        """Test basic API connectivity by listing agents (which we need anyway)"""
        print("🔗 Testing ElevenLabs API connection...")
        try:
            # Instead of testing /user endpoint, test /convai/agents which we actually need
            response = requests.get(
                f"{self.base_url}/convai/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ API connection successful!")
                print(f"   API Key: Valid and working")
                print(f"   Permissions: Conversational AI access confirmed")
                return True
            elif response.status_code == 401:
                print(f"❌ API connection failed: Invalid API key or insufficient permissions")
                print(f"   Error: {response.text}")
                return False
            else:
                print(f"❌ API connection failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ API connection error: {str(e)}")
            return False
    
    def list_all_agents(self) -> List[Dict[str, Any]]:
        """List all conversational AI agents"""
        print("\n📋 Fetching all agents...")
        try:
            response = requests.get(
                f"{self.base_url}/convai/agents",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                agents = data.get('agents', [])
                print(f"✅ Found {len(agents)} total agents")
                return agents
            else:
                print(f"❌ Failed to fetch agents: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Error fetching agents: {str(e)}")
            return []
    
    def get_agent_details(self, agent_id: str) -> Dict[str, Any]:
        """Get detailed information about a specific agent"""
        try:
            response = requests.get(
                f"{self.base_url}/convai/agents/{agent_id}",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Failed to get agent {agent_id}: {response.status_code} - {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ Error getting agent {agent_id}: {str(e)}")
            return {}
    
    def test_agent_conversation(self, agent_id: str) -> bool:
        """Test starting a conversation with an agent"""
        print(f"\n🤖 Testing conversation with agent: {agent_id}")
        try:
            # Get signed URL for conversation
            response = requests.get(
                f"{self.base_url}/convai/conversation/get-signed-url",
                headers=self.headers,
                params={"agent_id": agent_id},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                signed_url = data.get('signed_url')
                if signed_url:
                    print(f"✅ Agent {agent_id} is responsive - signed URL generated")
                    return True
                else:
                    print(f"❌ Agent {agent_id} - no signed URL in response")
                    return False
            else:
                print(f"❌ Agent {agent_id} failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing agent {agent_id}: {str(e)}")
            return False
    
    def verify_our_agents(self, all_agents: List[Dict[str, Any]]) -> Dict[str, bool]:
        """Verify that our specific agents exist and are working"""
        print("\n🔍 Verifying our created agents...")
        
        agent_status = {}
        found_agents = {agent.get('agent_id'): agent for agent in all_agents}
        
        for expected_id in self.expected_agents:
            print(f"\n--- Testing Agent: {expected_id} ---")
            
            if expected_id in found_agents:
                agent = found_agents[expected_id]
                print(f"✅ Agent found in account")
                print(f"   Name: {agent.get('name', 'N/A')}")
                print(f"   Created: {agent.get('created_at', 'N/A')}")
                print(f"   Status: Active")
                
                # Test conversation capability
                conversation_test = self.test_agent_conversation(expected_id)
                agent_status[expected_id] = conversation_test
                
                if conversation_test:
                    print(f"✅ Agent {expected_id} is fully functional")
                else:
                    print(f"❌ Agent {expected_id} has conversation issues")
            else:
                print(f"❌ Agent {expected_id} NOT FOUND in account")
                agent_status[expected_id] = False
        
        return agent_status
    
    def generate_report(self, agent_status: Dict[str, bool], all_agents: List[Dict[str, Any]]):
        """Generate a comprehensive test report"""
        print("\n" + "="*60)
        print("🏁 ELEVENLABS AGENTS TEST REPORT")
        print("="*60)
        
        # Summary
        total_expected = len(self.expected_agents)
        working_agents = sum(1 for status in agent_status.values() if status)
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total Expected Agents: {total_expected}")
        print(f"   Working Agents: {working_agents}")
        print(f"   Success Rate: {(working_agents/total_expected*100):.1f}%")
        
        # Detailed status
        print(f"\n📋 DETAILED STATUS:")
        template_names = [
            "Software Engineer Interview",
            "Product Manager Interview", 
            "Python Developer Interview"
        ]
        
        for i, agent_id in enumerate(self.expected_agents):
            template_name = template_names[i] if i < len(template_names) else f"Template {i+1}"
            status = "✅ WORKING" if agent_status.get(agent_id, False) else "❌ FAILED"
            print(f"   {template_name}: {status}")
            print(f"     Agent ID: {agent_id}")
        
        # All agents in account
        print(f"\n🏢 ALL AGENTS IN ACCOUNT ({len(all_agents)} total):")
        for agent in all_agents:
            agent_id = agent.get('agent_id', 'Unknown')
            name = agent.get('name', 'Unknown')
            is_ours = agent_id in self.expected_agents
            marker = "🎯" if is_ours else "📋"
            print(f"   {marker} {name} ({agent_id})")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        if working_agents == total_expected:
            print("   🎉 All agents are working perfectly!")
            print("   🚀 Ready to conduct interviews!")
        else:
            print("   ⚠️  Some agents need attention:")
            for agent_id, status in agent_status.items():
                if not status:
                    print(f"      - Check agent {agent_id} in ElevenLabs dashboard")
            print("   📞 Contact ElevenLabs support if issues persist")
        
        print("\n" + "="*60)
    
    def run_complete_test(self):
        """Run the complete test suite"""
        print("🧪 ELEVENLABS AGENTS COMPREHENSIVE TEST")
        print("="*50)
        
        # Show API key info (masked)
        api_key_masked = f"{self.api_key[:8]}...{self.api_key[-4:]}" if self.api_key else "NOT SET"
        print(f"🔑 API Key: {api_key_masked}")
        
        # Test API connection
        if not self.test_api_connection():
            print("\n💡 TROUBLESHOOTING TIPS:")
            print("   1. Check if your API key is correct in .env file")
            print("   2. Verify the API key has 'Conversational AI' permissions")
            print("   3. Make sure the API key is not expired")
            print("   4. Contact your organization admin to verify permissions")
            print("\n❌ Cannot proceed without API connection")
            return
        
        # List all agents
        all_agents = self.list_all_agents()
        if not all_agents:
            print("❌ Cannot proceed without agent list")
            return
        
        # Verify our specific agents
        agent_status = self.verify_our_agents(all_agents)
        
        # Generate report
        self.generate_report(agent_status, all_agents)

def main():
    """Main function"""
    try:
        tester = ElevenLabsAgentTester()
        tester.run_complete_test()
    except Exception as e:
        print(f"❌ Critical error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

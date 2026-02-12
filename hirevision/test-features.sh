#!/bin/bash

# Feature Testing Script
# Run this to check if all critical features are accessible

echo "🧪 Testing AI Championship Platform Features..."
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL (change this to your deployment URL)
BASE_URL="http://localhost:3000"

echo "📍 Testing against: $BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local path=$1
    local name=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "302" ] || [ "$response" = "304" ]; then
        echo -e "${GREEN}✅ $name${NC} - Status: $response"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - Status: $response"
        return 1
    fi
}

echo "🔐 Authentication Pages"
test_endpoint "/login" "Login Page"
test_endpoint "/signup" "Signup Page"
echo ""

echo "📊 Dashboard Pages"
test_endpoint "/dashboard" "Main Dashboard"
test_endpoint "/candidate-portal/dashboard" "Candidate Dashboard"
test_endpoint "/recruiter/dashboard" "Recruiter Dashboard"
test_endpoint "/hiring-manager/dashboard" "Hiring Manager Dashboard"
echo ""

echo "💼 Job Management"
test_endpoint "/jobs" "Jobs List"
test_endpoint "/jobs/new" "Create Job"
echo ""

echo "👥 Candidate Management"
test_endpoint "/candidates" "Candidates List"
test_endpoint "/candidates/new" "Add Candidate"
echo ""

echo "🎯 Challenges & Courses"
test_endpoint "/challenges" "Challenges"
test_endpoint "/courses" "Courses"
echo ""

echo "🤖 AI Features"
test_endpoint "/ai-assistant" "AI Assistant"
test_endpoint "/interview-prep" "Interview Tools"
test_endpoint "/video-interview" "Video Interview"
test_endpoint "/voice-interview" "Voice Interview"
test_endpoint "/negotiation-practice" "Negotiation Practice"
test_endpoint "/resume-builder" "Resume Builder"
test_endpoint "/career-tools" "Career Tools"
test_endpoint "/ai-learning-hub" "AI Learning Hub"
echo ""

echo "📝 Interview Management"
test_endpoint "/interviews" "Interviews"
test_endpoint "/interviews/new" "Schedule Interview"
echo ""

echo "💬 Communication"
test_endpoint "/messages" "Messages"
test_endpoint "/emails" "Emails"
test_endpoint "/community" "Community"
echo ""

echo "⚙️ Settings & Profile"
test_endpoint "/profile/edit" "Edit Profile"
test_endpoint "/settings" "Settings"
test_endpoint "/billing" "Billing"
test_endpoint "/pricing" "Pricing"
echo ""

echo "📊 Analytics & Reports"
test_endpoint "/analytics" "Analytics"
test_endpoint "/reports" "Reports"
echo ""

echo "=============================================="
echo "✨ Testing Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Check TESTING_CHECKLIST.md for detailed testing"
echo "2. Test AI features manually (require API keys)"
echo "3. Test authentication flow with real accounts"
echo "4. Test file uploads and downloads"
echo "5. Test responsive design on mobile"
echo ""

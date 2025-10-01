#!/bin/bash
# Automated Deployment Checking and Fixing Workflow
# Usage: ./scripts/auto-deploy-check.sh

set -e

echo "🚀 Starting Automated Deployment Check..."
echo "========================================"

# Configuration
DOMAIN="https://stembotv1.vercel.app"
PROJECT_NAME="stembot-v1"

# Step 1: Check current deployment status
echo "📊 Step 1: Checking current deployment status..."
echo "Current time: $(date)"
echo "Git commit: $(git log -1 --format='%ci %h %s')"

# Get deployed version info
echo "Deployed version:"
DEPLOYED_INFO=$(curl -s "$DOMAIN/api/version" || echo '{"error":"API not accessible"}')
echo "$DEPLOYED_INFO"

# Extract build date for comparison (without jq dependency)
DEPLOYED_DATE=$(echo "$DEPLOYED_INFO" | grep -o '"buildDate":"[^"]*"' | cut -d'"' -f4)
echo "Deployed build date: $DEPLOYED_DATE"

# Step 2: Test critical API endpoints
echo ""
echo "🔍 Step 2: Testing API endpoints..."

# Test version endpoint (should always work)
VERSION_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/version")
echo "Version API: $VERSION_STATUS"

# Test new SearchStrategy API
SEARCH_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/ai/search-strategy")
echo "SearchStrategy API: $SEARCH_STATUS"

# Test simple deployment test API
TEST_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/test-deployment")
echo "Test Deployment API: $TEST_STATUS"

# Step 3: Analyze deployment health
echo ""
echo "🏥 Step 3: Deployment health analysis..."

DEPLOYMENT_HEALTHY=true

if [ "$VERSION_STATUS" != "200" ]; then
    echo "❌ Critical: Version API failing"
    DEPLOYMENT_HEALTHY=false
fi

if [ "$SEARCH_STATUS" = "404" ]; then
    echo "⚠️  Warning: SearchStrategy API not deployed (404)"
    DEPLOYMENT_HEALTHY=false
fi

if [ "$TEST_STATUS" = "404" ]; then
    echo "⚠️  Warning: Test API not deployed (404)"
    DEPLOYMENT_HEALTHY=false
fi

# Step 4: Check if deployment is stale
echo ""
echo "📅 Step 4: Checking deployment freshness..."

CURRENT_TIME=$(date -u +%s)
if [ "$DEPLOYED_DATE" != "unknown" ]; then
    DEPLOYED_TIME=$(date -d "$DEPLOYED_DATE" +%s 2>/dev/null || echo "0")
    TIME_DIFF=$((CURRENT_TIME - DEPLOYED_TIME))
    HOURS_OLD=$((TIME_DIFF / 3600))

    echo "Deployment is $HOURS_OLD hours old"

    if [ $HOURS_OLD -gt 2 ]; then
        echo "⚠️  Deployment appears stale (>2 hours old)"
        DEPLOYMENT_HEALTHY=false
    fi
fi

# Step 5: Generate diagnostic report
echo ""
echo "📋 Step 5: Diagnostic Report"
echo "============================"

if [ "$DEPLOYMENT_HEALTHY" = true ]; then
    echo "✅ Deployment Status: HEALTHY"
    echo "All APIs are accessible and deployment is fresh"
    exit 0
else
    echo "❌ Deployment Status: ISSUES DETECTED"
    echo ""
    echo "🔧 Recommended Actions:"

    if [ "$SEARCH_STATUS" = "404" ] || [ "$TEST_STATUS" = "404" ]; then
        echo "1. Force redeploy via Vercel CLI:"
        echo "   npx vercel --prod --force"
        echo ""
        echo "2. Check Vercel deployment logs:"
        echo "   npx vercel logs \$(npx vercel ls --scope [SCOPE] | head -1 | awk '{print \$2}')"
        echo ""
        echo "3. Verify git webhook integration in Vercel dashboard"
    fi

    if [ "$VERSION_STATUS" != "200" ]; then
        echo "4. Critical API failure - check Vercel project status"
        echo "   Visit: https://vercel.com/dashboard"
    fi

    echo ""
    echo "5. Run automated fix attempt:"
    echo "   ./scripts/auto-deploy-fix.sh"
fi

echo ""
echo "📝 Save this report for troubleshooting reference"
echo "Timestamp: $(date)"
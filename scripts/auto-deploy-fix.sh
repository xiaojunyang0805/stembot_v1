#!/bin/bash
# Automated Deployment Fix Workflow
# Usage: ./scripts/auto-deploy-fix.sh

set -e

echo "🔧 Starting Automated Deployment Fix..."
echo "====================================="

DOMAIN="https://stembotv1.vercel.app"
MAX_ATTEMPTS=3
ATTEMPT=1

# Function to check deployment health
check_deployment() {
    local search_status=$(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/ai/search-strategy")
    local test_status=$(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/test-deployment")

    if [ "$search_status" = "200" ] && [ "$test_status" = "200" ]; then
        return 0  # Success
    else
        return 1  # Still failing
    fi
}

# Function to wait for deployment
wait_for_deployment() {
    echo "⏳ Waiting for deployment to complete..."
    local max_wait=300  # 5 minutes
    local wait_time=0

    while [ $wait_time -lt $max_wait ]; do
        sleep 30
        wait_time=$((wait_time + 30))
        echo "  Checking deployment... (${wait_time}s elapsed)"

        if check_deployment; then
            echo "✅ Deployment successful!"
            return 0
        fi
    done

    echo "⏰ Deployment timeout after ${max_wait}s"
    return 1
}

# Main fix loop
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo ""
    echo "🔄 Fix Attempt $ATTEMPT of $MAX_ATTEMPTS"
    echo "==============================="

    case $ATTEMPT in
        1)
            echo "Strategy: Force redeploy via Vercel CLI"
            if command -v vercel >/dev/null 2>&1; then
                echo "Running: npx vercel --prod --force"
                npx vercel --prod --force || echo "⚠️ Vercel CLI command failed"
            else
                echo "⚠️ Vercel CLI not available, skipping to next strategy"
            fi
            ;;
        2)
            echo "Strategy: Trigger deployment via git push"
            echo "Making trivial change to force new deployment..."
            echo "# Auto-deployment trigger $(date)" >> .deployment-trigger
            git add .deployment-trigger
            git commit -m "🔄 Auto-deployment trigger - Attempt $ATTEMPT"
            git push origin main
            ;;
        3)
            echo "Strategy: Clean deployment with cache bust"
            echo "Creating cache-busting change..."
            # Update version timestamp to bust any caches
            if [ -f "src/app/api/version/route.ts" ]; then
                sed -i "s/timestamp: .*/timestamp: \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\",/" src/app/api/version/route.ts
            fi
            git add -A
            git commit -m "🧹 Cache-busting deployment - Attempt $ATTEMPT"
            git push origin main
            ;;
    esac

    # Wait for deployment and check result
    if wait_for_deployment; then
        echo ""
        echo "🎉 DEPLOYMENT FIX SUCCESSFUL!"
        echo "============================="
        echo "Fixed on attempt $ATTEMPT"

        # Final verification
        echo "Final API status check:"
        echo "SearchStrategy API: $(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/ai/search-strategy")"
        echo "Test API: $(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/test-deployment")"
        echo "Version API: $(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/version")"

        # Show new deployment info
        echo ""
        echo "New deployment info:"
        curl -s "$DOMAIN/api/version"

        exit 0
    else
        echo "❌ Attempt $ATTEMPT failed"
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

echo ""
echo "💥 AUTOMATED FIX FAILED"
echo "======================="
echo "All $MAX_ATTEMPTS fix attempts failed."
echo ""
echo "🆘 Manual intervention required:"
echo "1. Check Vercel dashboard: https://vercel.com/dashboard"
echo "2. Verify GitHub webhook integration"
echo "3. Check build logs for errors"
echo "4. Consider manual redeploy from Vercel dashboard"
echo ""
echo "📊 Current status:"
echo "SearchStrategy API: $(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/ai/search-strategy")"
echo "Test API: $(curl -s -w "%{http_code}" -o /dev/null "$DOMAIN/api/test-deployment")"

exit 1
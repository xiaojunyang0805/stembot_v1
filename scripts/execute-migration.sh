#!/bin/bash

# ⚡ Automated Migration Execution Script
# This script allows Claude Code to execute Supabase migrations automatically
#
# Usage:
#   ./scripts/execute-migration.sh <migration-file.sql>
#   ./scripts/execute-migration.sh supabase/migrations/20251003_create_project_methodology.sql

set -e

MIGRATION_FILE="$1"
API_URL="http://localhost:3000/api/admin/execute-sql"

if [ -z "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file path required"
    echo "Usage: $0 <migration-file.sql>"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: File not found: $MIGRATION_FILE"
    exit 1
fi

echo "🚀 Executing migration: $MIGRATION_FILE"
echo ""

# Read the SQL file
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Escape for JSON
SQL_JSON=$(jq -Rs . <<< "$SQL_CONTENT")

# Prepare JSON payload
JSON_PAYLOAD="{\"sql\": $SQL_JSON, \"description\": \"Migration from $MIGRATION_FILE\"}"

# Execute via API
echo "📡 Sending to API..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

# Parse response
SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "$RESPONSE" | jq '.'
else
    echo "❌ Migration failed!"
    echo ""
    echo "$RESPONSE" | jq '.'
    exit 1
fi

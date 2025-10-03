# ⚡ Automated Migration Execution Script (PowerShell)
# This script allows Claude Code to execute Supabase migrations automatically
#
# Usage:
#   .\scripts\Execute-Migration.ps1 -MigrationFile "supabase\migrations\20251003_create_project_methodology.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$MigrationFile,

    [Parameter(Mandatory=$false)]
    [string]$ApiUrl = "http://localhost:3000/api/admin/execute-sql",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

if (!(Test-Path $MigrationFile)) {
    Write-Host "❌ Error: File not found: $MigrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Executing migration: $MigrationFile" -ForegroundColor Cyan
Write-Host ""

# Read SQL file
$sqlContent = Get-Content -Path $MigrationFile -Raw

# Prepare JSON payload
$payload = @{
    sql = $sqlContent
    description = "Migration from $MigrationFile"
    dryRun = $DryRun.IsPresent
} | ConvertTo-Json

# Execute via API
Write-Host "📡 Sending to API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $payload -ContentType "application/json"

    if ($response.success) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host ($response | ConvertTo-Json -Depth 10)
    } else {
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host ($response | ConvertTo-Json -Depth 10)
        exit 1
    }
} catch {
    Write-Host "❌ Error executing migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

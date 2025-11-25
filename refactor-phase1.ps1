# PowerShell script to refactor App.tsx - Simple approach

$appTsxPath = "App.tsx"

Write-Host "Backing up App.tsx..." -ForegroundColor Cyan
Copy-Item $appTsxPath "$appTsxPath.backup"

Write-Host "Reading App.tsx..." -ForegroundColor Cyan
$lines = Get-Content $appTsxPath

$newLines = @()
$skipMode = $false
$importAdded = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Add import after leaflet line
    if ($line -match "import L from 'leaflet';" -and -not $importAdded) {
        $newLines += $line
        $newLines += "import { Icon, Icons, Card, Button, Input, Select } from './components/ui';"
        $importAdded = $true
        Write-Host "✓ Added UI components import" -ForegroundColor Green
        continue
    }
    
    # Start skipping at Icon System comment
    if ($line -match "^// --- Icon System ---") {
        $skipMode = $true
        Write-Host "✓ Removing old component definitions..." -ForegroundColor Yellow
        continue
    }
    
    # Stop skipping at App Component comment
    if ($line -match "^// --- App Component ---") {
        $skipMode = $false
        Write-Host "✓ Removed old component definitions" -ForegroundColor Green
    }
    
    # Add line if not in skip mode
    if (-not $skipMode) {
        $newLines += $line
    }
}

Write-Host "Saving changes..." -ForegroundColor Cyan
$newLines | Set-Content $appTsxPath

Write-Host "`n✅ Refactoring complete!" -ForegroundColor Green
Write-Host "   - Backup saved as App.tsx.backup" -ForegroundColor Gray
Write-Host "   - Added import from components/ui" -ForegroundColor Gray
Write-Host "   - Removed inline component code" -ForegroundColor Gray
Write-Host "`nApp.tsx has been updated successfully!" -ForegroundColor Cyan

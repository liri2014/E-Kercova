#!/usr/bin/env python3
"""
Refactor App.tsx - Phase 1: Extract UI Components
"""

import shutil

# Backup first
shutil.copy('App.tsx', 'App.tsx.backup')
print("✓ Created backup: App.tsx.backup")

# Read the file
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False
import_added = False

for line in lines:
    # Add import after leaflet line
    if "import L from 'leaflet';" in line and not import_added:
        new_lines.append(line)
        new_lines.append("import { Icon, Icons, Card, Button, Input, Select } from './components/ui';\n")
        import_added = True
        print("✓ Added UI components import")
        continue
    
    # Start skipping at Icon System comment
    if line.strip() == "// --- Icon System ---":
        skip_mode = True
        print("✓ Removing old component definitions...")
        continue
    
    # Stop skipping at App Component comment
    if line.strip() == "// --- App Component ---":
        skip_mode = False
        print("✓ Removed old component definitions")
    
    # Add line if not in skip mode
    if not skip_mode:
        new_lines.append(line)

# Write the modified content
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("\n✅ Refactoring complete!")
print("   - Backup saved as App.tsx.backup")
print("   - Added import from components/ui")
print("   - Removed ~70 lines of inline component code")
print("\nApp.tsx has been updated successfully!")

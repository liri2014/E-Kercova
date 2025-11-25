#!/usr/bin/env python3
"""
Phase 2 - Extract top 3 largest view components from App.tsx
"""

import shutil

# Backup first
shutil.copy('App.tsx', 'App.tsx.phase2.backup')
print("✓ Created backup: App.tsx.phase2.backup")

# Read the file
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False
skip_count = 0

for i, line in enumerate(lines):
    line_num = i + 1
    
    # Add import for views after ui import
    if 'import { Icon, Icons, Card, Button, Input, Select } from' in line:
        new_lines.append(line)
        new_lines.append("import { MapView, ReportView, ParkingView } from './components/views';\n")
        print("✓ Added view components import")
        continue
    
    # Start skipping MapView (line 296-430)
    if line_num == 296 and line.startswith('const MapView:'):
        skip_mode = True
        skip_count = 0
        print("✓ Removing MapView (135 lines)...")
        continue
    
    # Stop skipping after MapView
    if skip_mode and line_num == 431:
        skip_mode = False
        print(f"  Skipped {skip_count} lines")
    
    # Start skipping ReportView (line 480-721)
    if line_num == 480 and line.startswith('const ReportView:'):
        skip_mode = True
        skip_count = 0
        print("✓ Removing ReportView (242 lines)...")
        continue
        
    # Stop skipping after ReportView
    if skip_mode and line_num == 722:
        skip_mode = False
        print(f"  Skipped {skip_count} lines")
    
    # Start skipping ParkingView (line 723-886)
    if line_num == 723 and line.startswith('const ParkingView:'):
        skip_mode = True
        skip_count = 0
        print("✓ Removing ParkingView (164 lines)...")
        continue
    
    # Stop skipping after ParkingView 
    if skip_mode and line_num == 887:
        skip_mode = False
        print(f"  Skipped {skip_count} lines")
    
    if skip_mode:
        skip_count += 1
        continue
    
    new_lines.append(line)

# Write the modified content
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

old_lines = len(lines)
new_line_count = len(new_lines)
reduction = old_lines - new_line_count

print(f"\n✅ Phase 2 Complete!")
print(f"   Original: {old_lines} lines")
print(f"   New: {new_line_count} lines")
print(f"   Reduction: {reduction} lines ({reduction/old_lines*100:.1f}%)")
print(f"\nApp.tsx updated successfully!")

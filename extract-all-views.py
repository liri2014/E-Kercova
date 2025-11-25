#!/usr/bin/env python3
"""
Complete View Extraction - Remove ALL 9 view components from App.tsx
This includes:
- Phase 2 components (already extracted but not removed): MapView, ReportView, ParkingView
- Phase 4 components (to be extracted): EventsView, NewsView, WalletView, HistoryView, MenuHub, PlaceholderView
"""

import shutil

# Backup
shutil.copy('App.tsx', 'App.tsx.phase4.backup')
print("✓ Created backup: App.tsx.phase4.backup")

# Read file
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Original: {len(lines)} lines")

# Components to remove (start line, end line, name)
# Based on outline: line numbers may shift as we remove, so we'll process in reverse order
components_to_remove = [
    (1333, 1379, "MenuHub"),
    (1301, 1331, "HistoryView"),
    (1290, 1299, "PlaceholderView"),
    (1254, 1288, "WalletView"),
    (1095, 1252, "NewsView"),
    (959, 1093, "EventsView"),
    (794, 957, "ParkingView"),
    (551, 792, "ReportView"),
    (367, 501, "MapView"),
]

removed_lines = 0

# Process in reverse order so line numbers don't shift
for start, end, name in components_to_remove:
    # Adjust for 0-indexing
    start_idx = start - 1
    end_idx = end  # end is inclusive, so we keep it as is for slicing
    
    # Calculate lines to remove
    lines_in_component = end_idx - start_idx
    
    # Remove the component
    del lines[start_idx:end_idx]
    
    removed_lines += lines_in_component
    print(f"✓ Removed {name} ({lines_in_component} lines)")

# Write back
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

new_line_count = len(lines)

print(f"\n✅ Extraction Complete!")
print(f"   Original: 1379 lines")
print(f"   New: {new_line_count} lines")
print(f"   Removed: {removed_lines} lines ({removed_lines/1379*100:.1f}%)")
print(f"\nAll 9 view components removed from App.tsx!")
print("Next: Update imports in App.tsx to use extracted components")

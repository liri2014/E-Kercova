#!/usr/bin/env python3
"""
Phase 5: Remove duplicate UI components from App.tsx
These were extracted to components/ui/ but never removed from App.tsx
"""

import shutil

# Backup
shutil.copy('App.tsx', 'App.tsx.phase5.backup')
print("✓ Created backup: App.tsx.phase5.backup")

# Read file
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Original: {len(lines)} lines")

# Remove lines 16-85 (Icon, Icons, Card, Button, Input, Select definitions)
# These are duplicates of what's in components/ui/
# Line numbers are 1-indexed, so we need to adjust
start_line = 16 - 1  # 0-indexed
end_line = 85  # exclusive for slicing

removed_lines = end_line - start_line
del lines[start_line:end_line]

print(f"✓ Removed duplicate UI components (lines 16-85, {removed_lines} lines)")

# Now add the import for UI components after line 11 (now line 11 since we removed earlier lines)
# Find the line with TutorialOverlay import
for i, line in enumerate(lines):
    if "from './components/tutorial'" in line:
        #Insert after this line
        lines.insert(i + 1, "import { Icon, Icons, Card, Button, Input, Select } from './components/ui';\n")
        print(f"✓ Added UI components import at line {i + 2}")
        break

# Write back
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

new_line_count = len(lines)

print(f"\n✅ Phase 5 Complete!")
print(f"   Original: 424 lines")
print(f"   New: {new_line_count} lines")
print(f"   Removed: {424 - new_line_count} lines")
print(f"\nDuplicate UI components removed from App.tsx!")

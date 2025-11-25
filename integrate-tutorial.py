#!/usr/bin/env python3
"""
Integrate TutorialOverlay into App.tsx automatically
Makes 5 precise changes to enable spotlight tutorial
"""

import shutil

# Backup
shutil.copy('App.tsx', 'App.tsx.tutorial.backup')
print("✓ Created backup: App.tsx.tutorial.backup")

# Read file
with open('App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Original file: {len(lines)} lines")

# Change 1: Add TutorialOverlay import after line 11
for i, line in enumerate(lines):
    if "import { MapView, ReportView, ParkingView } from './components/views';" in line:
        lines.insert(i + 1, "import { TutorialOverlay } from './components/tutorial';\n")
        print(f"✓ Added TutorialOverlay import at line {i + 2}")
        break

# Change 2 & 3: Update ServiceCard component (around line 541-542)
for i, line in enumerate(lines):
    # Find ServiceCard type definition
    if line.strip().startswith("const ServiceCard: React.FC<{ icon: string; title: string; color: string; onClick: () => void }>"):
        # Update type to include id?: string
        lines[i] = line.replace(
            "onClick: () => void }>",
            "onClick: () => void; id?: string }>"
        ).replace(
            "({ icon, title, color, onClick }) =>",
            "({ icon, title, color, onClick, id }) =>"
        )
        print(f"✓ Updated ServiceCard type at line {i + 1}")
        
        # Next line should be the button - add id={id}
        if i + 1 < len(lines) and "<button onClick={onClick}" in lines[i + 1]:
            lines[i + 1] = lines[i + 1].replace(
                "<button onClick={onClick}",
                "<button id={id} onClick={onClick}"
            )
            print(f"✓ Added id to ServiceCard button at line {i + 2}")
        break

# Change 4: Add IDs to specific ServiceCards in HomeView
replacements = [
    ('<ServiceCard icon={Icons.report} title={t(\'report_new_issue\')} color="bg-rose-500"',
     '<ServiceCard id="home-service-report" icon={Icons.report} title={t(\'report_new_issue\')} color="bg-rose-500"'),
    
    ('<ServiceCard icon={Icons.parking} title={t(\'parking\')} color="bg-indigo-500"',
     '<ServiceCard id="home-service-parking" icon={Icons.parking} title={t(\'parking\')} color="bg-indigo-500"'),
    
    ('<ServiceCard icon={Icons.news} title={t(\'news\')} color="bg-emerald-500"',
     '<ServiceCard id="home-service-news" icon={Icons.news} title={t(\'news\')} color="bg-emerald-500"'),
]

for i, line in enumerate(lines):
    for old, new in replacements:
        if old in line:
            lines[i] = line.replace(old, new)
            print(f"✓ Added ID to ServiceCard at line {i + 1}")

# Change 5: Add ID to Wallet Card
for i, line in enumerate(lines):
    if '<Card className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 border-none text-white" onClick={() => onViewChange(\'wallet\')}>' in line:
        lines[i] = line.replace(
            '<Card className="p-5',
            '<Card id="home-service-wallet" className="p-5'
        )
        print(f"✓ Added ID to Wallet Card at line {i + 1}")
        break

# Write changes
with open('App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"\n✅ Integration complete!")
print(f"   Modified file: {len(lines)} lines")
print(f"   Backup: App.tsx.tutorial.backup")
print("\nTutorialOverlay is now integrated and ready to use!")

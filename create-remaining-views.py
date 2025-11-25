#!/usr/bin/env python3
"""
Extract the remaining 6 view components from backup and create files
"""

# Read backup file
with open('App.tsx.phase4.backup', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Extracting components from backup...")

# Component ranges (from outline)
components = {
    'EventsView': (959, 1093),
    'NewsView': (1095, 1252),
    'WalletView': (1254, 1288),
    'PlaceholderView': (1290, 1299),
    'HistoryView': (1301, 1331),
    'MenuHub': (1333, 1379),
}

# Base imports for view components
base_imports = """import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card, Button } from '../ui';
"""

for name, (start, end) in components.items():
    print(f"Creating {name}.tsx...")
    
    # Extract component code (adjust for 0-indexing)
    component_lines = lines[start-1:end]
    
    # Build file content
    content = base_imports
    
    # Add specific imports based on component
    if name == 'EventsView':
        content = """import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';
import { api } from '../../services/api';
import { Icon, Icons, Card } from '../ui';

const { getEvents } = api;

"""
    elif name == 'NewsView':
        content = """import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types';
import { api } from '../../services/api';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

const { getNews } = api;

"""
    elif name == 'WalletView':
        content = """import React from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card, Button } from '../ui';

"""
    elif name == 'PlaceholderView':
        content = """import React from 'react';
import { Icon } from '../ui';

"""
    elif name == 'HistoryView':
        content = """import React, { useState, useEffect } from 'react';
import { Report } from '../../types';
import { useTranslation } from '../../i18n';
import { Icon, Icons } from '../ui';

"""
    elif name == 'MenuHub':
        content = """import React from 'react';
import { useTranslation } from '../../i18n';
import { Icon, Icons, Card } from '../ui';

"""
    
    # Add component code and export
    content += ''.join(component_lines).rstrip() + '\n'
    
    # Make sure it's exported
    if 'export const' not in content and 'export default' not in content:
        # Add export to the component definition line
        content = content.replace(f'const {name}:', f'export const {name}:')
    
    # Write file
    with open(f'components/views/{name}.tsx', 'w',encoding='utf-8') as f:
        f.write(content)

print("\nAll components extracted!")
print("Next: Update components/views/index.ts")

#!/usr/bin/env node

/**
 * ============================================================
 * VedicAladdin V7 — scripts/build.js
 * Build & Deployment Script
 * ============================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'dist');

console.log('\n' + '='.repeat(60));
console.log('🔱 वैदिक अलादीन V7 — BUILD PROCESS');
console.log('='.repeat(60) + '\n');

// ============================================================
// STEP 1: Validate structure
// ============================================================

console.log('📋 Step 1: Validating project structure...');

const requiredFiles = [
  'core/ephemeris.js',
  'core/panchanga.js',
  'core/varga.js',
  'core/dasha.js',
  'core/vedic-engine.js',
  'core/consensus-engine.js',
  'market/market-engine.js',
  'data/database.js',
  'ui/index.html',
  'ui/loader.js',
  'server/index.js',
  'tests/test.js',
  'package.json',
  'README.md'
];

let missing = [];
requiredFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    missing.push(file);
    console.log(`  ❌ Missing: ${file}`);
  }
});

if (missing.length > 0) {
  console.error(`\n❌ Build failed: ${missing.length} files missing`);
  process.exit(1);
}

console.log(`  ✅ All ${requiredFiles.length} required files present\n`);

// ============================================================
// STEP 2: Run tests
// ============================================================

console.log('🧪 Step 2: Running test suite...\n');

try {
  execSync('node tests/test.js', { cwd: rootDir, stdio: 'inherit' });
  console.log('\n✅ All tests passed\n');
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
}

// ============================================================
// STEP 3: Create distribution directory
// ============================================================

console.log('📦 Step 3: Creating distribution package...');

if (fs.existsSync(outDir)) {
  execSync(`rm -rf "${outDir}"`);
}
fs.mkdirSync(outDir, { recursive: true });

// Copy core files
const dirs = ['core', 'market', 'data', 'ui', 'server', 'tests', 'docs'];
dirs.forEach(dir => {
  const src = path.join(rootDir, dir);
  const dst = path.join(outDir, dir);
  if (fs.existsSync(src)) {
    execSync(`cp -r "${src}" "${dst}"`);
  }
});

// Copy config files
['package.json', 'README.md', 'Dockerfile', '.dockerignore', '.gitignore'].forEach(file => {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
  }
});

console.log('  ✅ Distribution directory created\n');

// ============================================================
// STEP 4: Create deployment documentation
// ============================================================

console.log('📝 Step 4: Creating deployment guides...');

const deploymentGuide = `# वैदिक अलादीन V7 — Deployment Guide

## 🚀 Quick Start

### Option 1: Browser (No Setup)
\`\`\`bash
open ui/index.html
# या
python -m http.server 8000
# Visit: http://localhost:8000/ui/index.html
\`\`\`

### Option 2: Node.js Server
\`\`\`bash
npm install  # optional
npm start
# Visit: http://localhost:3000
\`\`\`

### Option 3: Docker
\`\`\`bash
docker build -t vedicaladdin-v7 .
docker run -p 3000:3000 vedicaladdin-v7
# Visit: http://localhost:3000
\`\`\`

## 📊 System Information

- **Version**: 7.0.0
- **Language**: Hindi (Devanagari)
- **Architecture**: Offline-first
- **Database**: IndexedDB (Browser) / FileSystem (Node.js)
- **Dependencies**: Zero required (optional Express)

## 🔗 API Endpoints

### GET /api/health
Health check

### POST /api/analyze
Complete Vedic analysis
\`\`\`json
{
  "year": 2026,
  "month": 9,
  "day": 22,
  "hour": 12,
  "minute": 0,
  "timezone": "IST"
}
\`\`\`

### GET /api/panchanga/:year/:month/:day
Get panchanga for a date

### GET /api/muhurta/:year/:month/:day/:hour/:minute
Get muhurta score

## 📚 Documentation

See README.md for complete documentation.

## ✅ Verification

All tests should pass:
\`\`\`bash
npm test
\`\`\`

Expected output:
\`\`\`
✅ PASS: EPHEMERIS tests
✅ PASS: PANCHANGA tests
✅ PASS: VARGA tests
✅ PASS: DASHA tests
✅ PASS: VEDIC_ENGINE tests
✅ PASS: MARKET_ENGINE tests
✅ PASS: CONSENSUS_ENGINE tests
\`\`\`

## 🔍 Troubleshooting

### Modules not loading in browser
- Check browser console (F12)
- Ensure all files are in correct directories
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Server won't start
- Ensure Node.js 14+ is installed
- Check if port 3000 is available
- Try: npm install (to install optional dependencies)

### Tests failing
- Ensure all core files are present
- Run: npm test
- Check console output for specific failures

## 🚀 Deployment Platforms

### Heroku
\`\`\`bash
heroku create vedicaladdin-v7
git push heroku main
\`\`\`

### AWS Lambda
Deploy \`ui/index.html\` as static S3 website + \`server/index.js\` as Lambda function

### Vercel
Deploy \`ui/index.html\` as static site

### GitHub Pages
Copy \`ui/*\` to \`docs/\` folder and enable Pages

---

🔱 **ॐ नमः शिवाय**
`;

fs.writeFileSync(path.join(outDir, 'DEPLOYMENT.md'), deploymentGuide);
console.log('  ✅ Deployment guide created\n');

// ============================================================
// STEP 5: Create manifest
// ============================================================

console.log('📋 Step 5: Creating build manifest...');

const manifest = {
  name: 'VedicAladdin V7',
  version: '7.0.0',
  timestamp: new Date().toISOString(),
  buildDate: new Date().toLocaleDateString('hi-IN'),
  description: 'दुनिया का पहला पूर्ण ऑफलाइन NASDAQ ज्योतिष बुद्धिमत्ता प्रणाली',
  files: {
    core: ['ephemeris.js', 'panchanga.js', 'varga.js', 'dasha.js', 'vedic-engine.js', 'consensus-engine.js'],
    market: ['market-engine.js'],
    data: ['database.js'],
    ui: ['index.html', 'loader.js'],
    server: ['index.js'],
    tests: ['test.js']
  },
  features: {
    vedic: ['Ephemeris', 'Panchanga', 'Nakshatra', 'Varga', 'Dasha', 'Yogini'],
    market: ['Session Management', 'Gap Analysis', 'Candle Patterns', 'Volatility'],
    consensus: ['Vedic Scoring', 'Market Scoring', 'Signal Merging', 'Confidence Calculation'],
    storage: ['IndexedDB', 'FileSystem', 'Export/Import'],
    deployment: ['Browser', 'Node.js Server', 'Docker', 'Offline']
  },
  modes: {
    browser: 'Fully offline, no server needed',
    server: 'Optional Express.js server for API',
    docker: 'Containerized deployment'
  },
  dataRange: {
    ephemeris: '1900-2050',
    market: '1971-present',
    timezone: 'IST and NY (EST/EDT/DST)'
  }
};

fs.writeFileSync(
  path.join(outDir, 'BUILD_MANIFEST.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('  ✅ Build manifest created\n');

// ============================================================
// STEP 6: Generate file listing
// ============================================================

console.log('📂 Step 6: Creating file listing...');

function generateFileListing(dir, indent = '') {
  let listing = '';
  const items = fs.readdirSync(dir).sort();
  
  items.forEach((item, index) => {
    const filePath = path.join(dir, item);
    const stat = fs.statSync(filePath);
    const isLast = index === items.length - 1;
    const prefix = isLast ? '└── ' : '├── ';
    const size = stat.isFile() ? ` (${(stat.size / 1024).toFixed(1)}KB)` : '';
    
    listing += `${indent}${prefix}${item}${size}\n`;
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      const childIndent = indent + (isLast ? '    ' : '│   ');
      listing += generateFileListing(filePath, childIndent);
    }
  });
  
  return listing;
}

const fileListing = `# VedicAladdin V7 — File Structure

\`\`\`
vedicaladdin-v7/
${generateFileListing(outDir)}
\`\`\`

Generated: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(outDir, 'FILE_STRUCTURE.md'), fileListing);

console.log('  ✅ File listing created\n');

// ============================================================
// STEP 7: Summary
// ============================================================

console.log('='.repeat(60));
console.log('✅ BUILD COMPLETE');
console.log('='.repeat(60) + '\n');

console.log('📊 Summary:');
console.log(`  ✅ All ${requiredFiles.length} files validated`);
console.log(`  ✅ All tests passed`);
console.log(`  ✅ Distribution package created at: ${outDir}`);
console.log(`  ✅ Documentation generated\n`);

console.log('🚀 Next Steps:');
console.log('  1. npm test              — Run tests');
console.log('  2. npm start             — Start server');
console.log('  3. open ui/index.html    — Open browser app');
console.log('  4. docker build -t vedicaladdin-v7 .  — Build Docker image\n');

console.log('📦 Distribution Contents:');
console.log('  • All core modules');
console.log('  • Market engine');
console.log('  • Database layer');
console.log('  • Complete UI');
console.log('  • Optional server');
console.log('  • Test suite');
console.log('  • Documentation\n');

console.log('🔱 ॐ नमः शिवाय\n');

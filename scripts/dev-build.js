import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const buildDir = './build';
const manifestPath = resolve(buildDir, 'manifest.json');
const versionJsonPath = './version.json';
const packageJsonPath = './package.json';

// Determine which version to build (use latest or create first version)
let currentVersion;
let manifest = { versions: {}, latest_version: '' };

if (!existsSync(buildDir)) {
    mkdirSync(buildDir, { recursive: true });
}

if (existsSync(manifestPath)) {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  currentVersion = manifest.latest_version || '0.0.1';
} else {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  currentVersion = packageJson.version || '0.0.1';
}

console.log(`Rebuilding version: ${currentVersion}`);

// Write version to a temporary file for vite.config.js to read
writeFileSync(versionJsonPath, JSON.stringify({ version: currentVersion }));

// Run vite build
try {
  console.log('Running vite build...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Clean up the temporary version file
  if (existsSync(versionJsonPath)) {
    unlinkSync(versionJsonPath);
  }
}

// Generate/update manifest
console.log('Updating manifest...');
const buildFiles = readdirSync(buildDir);
const versionFiles = {};

buildFiles.forEach(file => {
  // Find files that match the current version pattern
  if (file.includes(`-${currentVersion}.`)) {
    // Extract the base name of the file (e.g., 'main.js' from 'main-0.0.1.js')
    const baseName = file.replace(`-${currentVersion}`, '');
    versionFiles[baseName] = `/${file}`;
  }
});

manifest.versions[currentVersion] = versionFiles;
manifest.latest_version = currentVersion;

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Manifest updated successfully!');
console.log(`Version ${currentVersion} rebuilt.`);

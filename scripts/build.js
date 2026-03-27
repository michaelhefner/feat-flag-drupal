import { execSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const packageJsonPath = './package.json';
const buildDir = './build';
const manifestPath = resolve(buildDir, 'manifest.json');
const versionJsonPath = './version.json';

// 1. Determine the new version
let newVersion;
let manifest = { versions: {}, latest_version: '' };

if (!existsSync(buildDir)) {
    mkdirSync(buildDir, { recursive: true });
}

if (existsSync(manifestPath)) {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const latestVersion = manifest.latest_version || '0.0.0';
  const versionParts = latestVersion.split('.').map(Number);
  versionParts[2]++; // Increment patch version
  newVersion = versionParts.join('.');
} else {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  newVersion = packageJson.version || '0.0.1';
}

console.log(`Building version: ${newVersion}`);

// Write version to a temporary file for vite.config.js to read
writeFileSync(versionJsonPath, JSON.stringify({ version: newVersion }));

// 2. Run vite build
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

// 3. Generate manifest
console.log('Generating manifest...');
const buildFiles = readdirSync(buildDir);
const versionFiles = {};

buildFiles.forEach(file => {
  // Find files that match the new version pattern
  if (file.includes(`-${newVersion}.`)) {
    // Extract the base name of the file (e.g., 'main.js' from 'main-0.0.1.js')
    const baseName = file.replace(`-${newVersion}`, '');
    versionFiles[baseName] = `/${file}`;
  }
});

manifest.versions[newVersion] = versionFiles;
manifest.latest_version = newVersion;

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('Manifest generated successfully!');

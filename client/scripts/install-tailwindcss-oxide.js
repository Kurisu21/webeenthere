#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const platform = os.platform();
const arch = os.arch();

// Try to get the version from the installed @tailwindcss/oxide package
let version = '4.1.11'; // fallback version
try {
  const oxidePath = path.join(__dirname, '..', 'node_modules', '@tailwindcss', 'oxide', 'package.json');
  if (fs.existsSync(oxidePath)) {
    const oxidePkg = JSON.parse(fs.readFileSync(oxidePath, 'utf8'));
    version = oxidePkg.version;
  }
} catch (error) {
  // If we can't read the version, use the fallback
  console.warn('Could not detect @tailwindcss/oxide version, using fallback:', version);
}

let pkg = null;

// Determine which platform-specific binary to install for @tailwindcss/oxide
if (platform === 'linux' && arch === 'x64') {
  // Try gnu first, fallback to musl if needed
  pkg = `@tailwindcss/oxide-linux-x64-gnu@${version}`;
} else if (platform === 'linux' && arch === 'arm64') {
  pkg = `@tailwindcss/oxide-linux-arm64-gnu@${version}`;
} else if (platform === 'darwin' && arch === 'arm64') {
  pkg = `@tailwindcss/oxide-darwin-arm64@${version}`;
} else if (platform === 'darwin' && arch === 'x64') {
  pkg = `@tailwindcss/oxide-darwin-x64@${version}`;
} else if (platform === 'win32' && arch === 'x64') {
  pkg = `@tailwindcss/oxide-win32-x64-msvc@${version}`;
} else if (platform === 'win32' && arch === 'arm64') {
  pkg = `@tailwindcss/oxide-win32-arm64-msvc@${version}`;
}

if (pkg) {
  try {
    console.log(`Installing ${pkg} for platform ${platform}/${arch}...`);
    execSync(`npm install --no-save --force ${pkg}`, { 
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });
    console.log(`Successfully installed ${pkg}`);
  } catch (error) {
    console.warn(`Failed to install ${pkg}, but continuing...`);
    // Don't fail the build if this doesn't work
  }
} else {
  console.warn(`Unsupported platform: ${platform}/${arch}, skipping @tailwindcss/oxide binary installation`);
}


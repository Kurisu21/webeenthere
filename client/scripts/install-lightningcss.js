#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

let pkg = null;

// Determine which platform-specific binary to install
if (platform === 'linux' && arch === 'x64') {
  pkg = 'lightningcss-linux-x64-gnu@1.30.1';
} else if (platform === 'linux' && arch === 'arm64') {
  pkg = 'lightningcss-linux-arm64-gnu@1.30.1';
} else if (platform === 'darwin' && arch === 'arm64') {
  pkg = 'lightningcss-darwin-arm64@1.30.1';
} else if (platform === 'darwin' && arch === 'x64') {
  pkg = 'lightningcss-darwin-x64@1.30.1';
} else if (platform === 'win32' && arch === 'x64') {
  pkg = 'lightningcss-win32-x64-msvc@1.30.1';
} else if (platform === 'win32' && arch === 'arm64') {
  pkg = 'lightningcss-win32-arm64-msvc@1.30.1';
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
  console.warn(`Unsupported platform: ${platform}/${arch}, skipping lightningcss binary installation`);
}


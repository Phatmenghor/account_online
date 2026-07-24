const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy public directory to .next/standalone/public
const publicSrc = path.join(__dirname, '../public');
const publicDest = path.join(__dirname, '../.next/standalone/public');

if (fs.existsSync(publicSrc)) {
  console.log('Copying public folder to standalone...');
  if (fs.existsSync(publicDest)) {
    fs.rmSync(publicDest, { recursive: true, force: true });
  }
  copyDir(publicSrc, publicDest);
}

// 2. Copy .next/static directory to .next/standalone/.next/static
const staticSrc = path.join(__dirname, '../.next/static');
const staticDest = path.join(__dirname, '../.next/standalone/.next/static');

if (fs.existsSync(staticSrc)) {
  console.log('Copying static files to standalone...');
  if (fs.existsSync(staticDest)) {
    fs.rmSync(staticDest, { recursive: true, force: true });
  }
  copyDir(staticSrc, staticDest);
}

console.log('Postbuild asset copy complete!');

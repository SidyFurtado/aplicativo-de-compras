const fs = require('node:fs');
const path = require('node:path');

const distDir = path.join(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');
const faviconVersion = 'casa-certa-2';

if (!fs.existsSync(indexPath)) {
  throw new Error('dist/index.html was not found. Run npm run export:web before preparing GitHub Pages.');
}

const html = fs.readFileSync(indexPath, 'utf8');
const faviconLinks = [
  `<link rel="icon" type="image/x-icon" href="/aplicativo-de-compras/favicon.ico?v=${faviconVersion}" />`,
  `<link rel="shortcut icon" href="/aplicativo-de-compras/favicon.ico?v=${faviconVersion}" />`,
].join('');

fs.writeFileSync(
  indexPath,
  html.replace(
    '<link rel="icon" href="/aplicativo-de-compras/favicon.ico" />',
    faviconLinks
  )
);

fs.copyFileSync(indexPath, notFoundPath);
console.log('Prepared GitHub Pages fallback at dist/404.html');

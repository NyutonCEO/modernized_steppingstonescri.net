const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const siteConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'siteConfig.json'), 'utf8'));
const BASE_URL = 'https://steppingstonescri.net';

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
};

const htmlFiles = walk(distDir).filter((file) => file.endsWith('.html'));
let missingTitle = [];
let missingMeta = [];
let missingCanonical = [];
let missingPhone = [];
let missingAlt = [];
let externalImages = [];
let suspiciousImages = [];

const phoneNeedle = `tel:${siteConfig.sitePhoneTel}`;

const hasMetaDescription = (html) => /<meta name="description" content="[^"]+"\s*\/?>/i.test(html);
const hasCanonical = (html) => /<link rel="canonical" href="[^"]+"\s*\/?>/i.test(html);
const extractImgTags = (html) => [...html.matchAll(/<img\s+[^>]*>/gi)].map((m) => m[0]);
const extractCssUrls = (html) => [...html.matchAll(/url\(['"]?(https?:[^'"\)]+)['"]?\)/gi)].map((m) => m[1]);
const extractImgSrcs = (html) => [...html.matchAll(/<img\s+[^>]*src=['"]([^'"]+)['"][^>]*>/gi)].map((m) => m[1]);

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8');
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    missingTitle.push(path.relative(distDir, file));
  }
  if (!hasMetaDescription(html)) {
    missingMeta.push(path.relative(distDir, file));
  }
  if (!hasCanonical(html)) {
    missingCanonical.push(path.relative(distDir, file));
  }
  if (!html.includes(phoneNeedle)) {
    missingPhone.push(path.relative(distDir, file));
  }

  const imgTags = extractImgTags(html);
  imgTags.forEach((tag) => {
    if (!/\salt=['"]/i.test(tag)) {
      missingAlt.push({ file: path.relative(distDir, file), tag });
    }
  });

  const imgSrcs = extractImgSrcs(html);
  imgSrcs.forEach((src) => {
    if (/^https?:/i.test(src) && !src.startsWith(BASE_URL)) {
      externalImages.push({ file: path.relative(distDir, file), src });
    }
    if (/wp-content|timthumb/i.test(src)) {
      suspiciousImages.push({ file: path.relative(distDir, file), src });
    }
  });

  const cssUrls = extractCssUrls(html);
  cssUrls.forEach((src) => {
    if (/^https?:/i.test(src) && !src.startsWith(BASE_URL)) {
      externalImages.push({ file: path.relative(distDir, file), src });
    }
  });
});

const assetsDir = path.join(distDir, 'assets');
const largeImages = [];
if (fs.existsSync(assetsDir)) {
  walk(assetsDir).forEach((file) => {
    if (!/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(file)) return;
    const sizeKb = fs.statSync(file).size / 1024;
    if (sizeKb > 500) {
      largeImages.push({ file: path.relative(distDir, file), sizeKb: Math.round(sizeKb) });
    }
  });
}

const sitemapExists = fs.existsSync(path.join(distDir, 'sitemap.xml'));
const robotsExists = fs.existsSync(path.join(distDir, 'robots.txt'));

const report = {
  missingTitle,
  missingMeta,
  missingCanonical,
  missingPhone,
  missingAlt,
  externalImages,
  suspiciousImages,
  largeImages,
  sitemapExists,
  robotsExists
};

if (!sitemapExists || !robotsExists) {
  console.error('Missing sitemap.xml or robots.txt.');
  process.exit(1);
}

if (missingTitle.length || missingMeta.length || missingCanonical.length || missingPhone.length || externalImages.length || missingAlt.length) {
  console.error('QA check failed. See details below.');
  if (missingTitle.length) console.error('Missing <title>:', missingTitle);
  if (missingMeta.length) console.error('Missing meta description:', missingMeta);
  if (missingCanonical.length) console.error('Missing canonical:', missingCanonical);
  if (missingPhone.length) console.error('Missing phone CTA (tel link):', missingPhone);
  if (externalImages.length) console.error('External images:', externalImages);
  if (missingAlt.length) console.error('Images missing alt:', missingAlt.map((i) => i.file));
  process.exit(1);
}

if (suspiciousImages.length || largeImages.length) {
  console.warn('Warnings:');
  if (suspiciousImages.length) console.warn('Suspicious image URLs:', suspiciousImages);
  if (largeImages.length) console.warn('Large images (>500kb):', largeImages);
}

console.log('QA check passed.');

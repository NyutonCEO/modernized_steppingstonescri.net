const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith('.html')) return [fullPath];
    return [];
  });
};

const extractLinks = (html) => {
  const links = [];
  const regex = /href="([^"]+)"|src="([^"]+)"/g;
  let match;
  while ((match = regex.exec(html))) {
    const url = match[1] || match[2];
    if (url) links.push(url);
  }
  return links;
};

const isExternal = (url) => {
  return /^(https?:|mailto:|tel:|skype:)/i.test(url) || url.startsWith('//');
};

const normalize = (url, currentDir) => {
  if (url.startsWith('#') || url.startsWith('javascript:')) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (clean.startsWith('/')) return path.join(distDir, clean);
  return path.join(currentDir, clean);
};

const fileExists = (filePath) => {
  if (!filePath) return true;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return true;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexFile = path.join(filePath, 'index.html');
    return fs.existsSync(indexFile);
  }
  if (!path.extname(filePath)) {
    const indexFile = path.join(filePath, 'index.html');
    return fs.existsSync(indexFile);
  }
  return false;
};

const htmlFiles = walk(distDir);
const broken = [];

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const links = extractLinks(html);
  const currentDir = path.dirname(file);
  links.forEach((url) => {
    const cleaned = url.trim();
    if (isExternal(cleaned)) return;
    const target = normalize(cleaned, currentDir);
    if (!target) return;
    if (!fileExists(target)) {
      broken.push({ file: path.relative(distDir, file), url: cleaned });
    }
  });
});

if (broken.length) {
  console.error('Broken links found:');
  broken.forEach((item) => {
    console.error(`- ${item.file}: ${item.url}`);
  });
  process.exit(1);
}

console.log('Link check passed.');

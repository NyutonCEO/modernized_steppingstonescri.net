const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://steppingstonescri.net';
const distDir = path.resolve(__dirname, '..', 'dist');
const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const assetsDir = path.resolve(__dirname, '..', 'src', 'assets');
const sourcePagesDir = path.resolve(__dirname, '..', 'src', 'pages');
const sourcePostsDir = path.resolve(__dirname, '..', 'src', 'posts');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const writeFile = (filePath, content) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
};

const cleanUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith(BASE_URL)) {
    const pathName = new URL(url).pathname;
    if (pathName.startsWith('/wp-content') || pathName.startsWith('/2016') || pathName.startsWith('/feed')) {
      return url;
    }
    return pathName;
  }
  return url;
};

const stripTags = (html) => html.replace(/<[^>]+>/g, '').trim();

const sanitizeContent = (html) => {
  if (!html) return '';
  let content = html;
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  content = content.replace(/(href|src)=["']\s+\//g, '$1="/');
  content = content.replace(/href=["']\/feed\/["']/g, `href="${BASE_URL}/feed/"`);
  content = content.replace(/(href|src)=["'](\/(?:wp-content|2016)[^"']*)["']/g, `$1="${BASE_URL}$2"`);
  content = content.replace(/(href|src)=["'](https?:\/\/steppingstonescri\.net[^"']*)["']/g, (match, attr, url) => {
    try {
      const path = new URL(url).pathname;
      if (path.startsWith('/wp-content') || path.startsWith('/2016') || path.startsWith('/feed')) {
        return `${attr}="${url}"`;
      }
      return `${attr}="${path}"`;
    } catch (error) {
      return match;
    }
  });
  return content;
};

const pathFromUrl = (urlPath, rootDir) => {
  const safe = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!safe) return rootDir;
  return path.join(rootDir, safe);
};

const navItems = (items, depth = 0) => {
  if (!items || !items.length) return '';
  const cls = depth === 0 ? 'nav-list' : 'nav-sublist';
  return `\n<ul class="${cls}">` +
    items.map((item) => {
      const title = item.title || '';
      const url = cleanUrl(item.url);
      const hasChildren = item.children && item.children.length;
      const children = hasChildren ? navItems(item.children, depth + 1) : '';
      return `\n<li class="nav-item${hasChildren ? ' has-children' : ''}">` +
        `<a href="${url}">${title}</a>${children}</li>`;
    }).join('') +
    '\n</ul>';
};

const renderHeader = (nav, site) => {
  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/">${site.name}</a>
    <button class="nav-toggle" type="button" aria-label="Toggle navigation">Menu</button>
    <nav class="site-nav">
      ${navItems(nav)}
    </nav>
  </div>
</header>`;
};

const renderFooter = (footerLinks, site) => {
  const links = (footerLinks || []).map((link) => {
    return `<a href="${cleanUrl(link.url)}">${link.title}</a>`;
  }).join('');
  return `
<footer class="site-footer">
  <div class="container footer-inner">
    <div>
      <h4>${site.name}</h4>
      <p>Call ${site.phone}</p>
    </div>
    <div class="footer-links">${links}</div>
  </div>
</footer>`;
};

const renderLayout = ({ title, description, body, pageClass = '' }) => {
  const metaDesc = description ? `<meta name="description" content="${description}">` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  ${metaDesc}
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body class="${pageClass}">
  ${body}
  <script src="/assets/site.js" defer></script>
</body>
</html>`;
};

const renderHeroSlider = (slides) => {
  if (!slides || !slides.length) return '';
  const items = slides.map((slide, index) => {
    return `
    <article class="hero-slide" data-slide="${index}">
      <div class="hero-slide-bg" style="background-image:url('${slide.image}')"></div>
      <div class="hero-slide-content">
        <p class="hero-kicker">Stepping Stones</p>
        <h2>${slide.title}</h2>
        <p>${slide.summary}</p>
        <a class="btn btn-primary" href="${slide.ctaUrl}">${slide.ctaText}</a>
      </div>
    </article>`;
  }).join('');

  return `
<section class="hero-slider" aria-label="Stepping Stones featured messages">
  <div class="hero-slider-track">
    ${items}
  </div>
  <div class="hero-slider-controls">
    <button class="slider-btn prev" type="button" aria-label="Previous slide">&#8592;</button>
    <div class="slider-dots" role="tablist"></div>
    <button class="slider-btn next" type="button" aria-label="Next slide">&#8594;</button>
  </div>
</section>`;
};

const renderServicesSlider = (services) => {
  const items = services.map((service) => {
    return `
    <article class="service-slide">
      <a href="${service.path}" class="service-slide-link">
        <img src="${service.image}" alt="${service.name}">
        <div>
          <h3>${service.name}</h3>
          <p>${service.summary}</p>
        </div>
      </a>
    </article>`;
  }).join('');

  return `
<section class="services-slider">
  <div class="container">
    <div class="section-heading">
      <h2>Our Services</h2>
      <p>Explore recovery, clinical, and wellness services designed for whole-person care.</p>
    </div>
    <div class="slider-shell">
      <button class="slider-btn prev" type="button" aria-label="Previous services">&#8592;</button>
      <div class="slider" aria-label="Services slider">
        <div class="slider-track">
          ${items}
        </div>
      </div>
      <button class="slider-btn next" type="button" aria-label="Next services">&#8594;</button>
    </div>
  </div>
</section>`;
};

const renderServicesIndex = (services) => {
  const cards = services.map((service) => {
    return `
    <article class="card">
      <img src="${service.image}" alt="${service.name}">
      <div>
        <h3>${service.name}</h3>
        <p>${service.summary}</p>
        <a href="${service.path}" class="text-link">Learn more</a>
      </div>
    </article>`;
  }).join('');

  return `
<section class="services-index">
  <div class="container">
    <div class="section-heading">
      <h2>Services</h2>
      <p>Each service below links to a full overview, expectations, and FAQs.</p>
    </div>
    <div class="card-grid">
      ${cards}
    </div>
  </div>
</section>`;
};

const renderServiceDetail = (service, pageContent) => {
  const expectations = service.expectations.map((item) => `<li>${item}</li>`).join('');
  const faqs = service.faqs.map((faq) => {
    return `<details>
      <summary>${faq.question}</summary>
      <p>${faq.answer}</p>
    </details>`;
  }).join('');

  return `
<section class="service-hero">
  <div class="container service-hero-inner">
    <div>
      <p class="hero-kicker">Service</p>
      <h1>${service.name}</h1>
      <p>${service.summary}</p>
      <a class="btn btn-primary" href="${service.ctaUrl}">${service.ctaText}</a>
    </div>
    <img src="${service.image}" alt="${service.name}">
  </div>
</section>
<section class="content-section">
  <div class="container">
    ${pageContent}
  </div>
</section>
<section class="expectations">
  <div class="container">
    <h2>What to expect</h2>
    <ul>${expectations}</ul>
  </div>
</section>
<section class="faq">
  <div class="container">
    <h2>FAQ</h2>
    <div class="faq-list">${faqs}</div>
  </div>
</section>`;
};

const renderPostList = (posts) => {
  if (!posts.length) return '';
  const items = posts.map((post) => {
    return `
    <article class="post-card">
      <h3><a href="${new URL(post.link).pathname}">${post.title}</a></h3>
      <p>${post.excerpt}</p>
    </article>`;
  }).join('');
  return `
<section class="post-list">
  <div class="container">
    <div class="section-heading">
      <h2>Recent Posts</h2>
      <p>Updates, events, and resources from Stepping Stones.</p>
    </div>
    <div class="post-grid">${items}</div>
  </div>
</section>`;
};

const pages = readJson(path.join(dataDir, 'pages.json'));
const posts = readJson(path.join(dataDir, 'posts.json'));
const categories = readJson(path.join(dataDir, 'categories.json'));
const nav = readJson(path.join(dataDir, 'nav.json'));
const services = readJson(path.join(dataDir, 'services.json'));
const heroSlider = readJson(path.join(dataDir, 'hero-slider.json'));
const site = readJson(path.join(dataDir, 'site.json'));

const serviceByPath = new Map(services.map((service) => [service.path, service]));
const postsByCategory = {};
posts.forEach((post) => {
  (post.categories || []).forEach((categoryId) => {
    if (!postsByCategory[categoryId]) postsByCategory[categoryId] = [];
    postsByCategory[categoryId].push(post);
  });
});

const copyDir = (src, dest) => {
  ensureDir(dest);
  fs.readdirSync(src).forEach((entry) => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

fs.rmSync(distDir, { recursive: true, force: true });
fs.rmSync(sourcePagesDir, { recursive: true, force: true });
fs.rmSync(sourcePostsDir, { recursive: true, force: true });
ensureDir(distDir);
ensureDir(sourcePagesDir);
ensureDir(sourcePostsDir);
copyDir(assetsDir, path.join(distDir, 'assets'));
copyDir(assetsDir, path.join(sourcePagesDir, 'assets'));

const renderBasePage = ({ title, description, content, pageClass }) => {
  const header = renderHeader(nav.header, site);
  const footer = renderFooter(nav.footer, site);
  const body = `${header}\n<main>${content}</main>\n${footer}`;
  return renderLayout({ title, description, body, pageClass });
};

pages.forEach((page) => {
  const urlPath = new URL(page.link).pathname;
  const dir = pathFromUrl(urlPath, distDir);
  const sourceDir = pathFromUrl(urlPath, sourcePagesDir);
  const outputPath = path.join(dir, 'index.html');
  const sourcePath = path.join(sourceDir, 'index.html');
  const description = page.excerpt || page.title;
  const sanitized = sanitizeContent(page.content);
  const content = `<section class="page-hero"><div class="container"><h1>${page.title}</h1><p>${page.excerpt || ''}</p></div></section>` +
    `<section class="content-section"><div class="container">${sanitized}</div></section>` +
    `<section class="cta"><div class="container"><h2>Ready to talk?</h2><p>Call ${site.phone} or request an appointment today.</p><a class="btn btn-primary" href="${site.contactUrl}">Request Appointment</a></div></section>`;

  let pageContent = content;

  if (urlPath === '/') {
    const homeContent = sanitizeContent(page.content);
    pageContent = `${renderHeroSlider(heroSlider)}${renderServicesSlider(services)}<section class="content-section"><div class="container">${homeContent}</div></section>${renderPostList(posts.slice(0, 3))}`;
  }

  if (urlPath === '/services/') {
    pageContent = renderServicesIndex(services);
  }

  if (serviceByPath.has(urlPath)) {
    const service = serviceByPath.get(urlPath);
    pageContent = renderServiceDetail(service, sanitized);
  }

  const html = renderBasePage({ title: page.title, description, content: pageContent, pageClass: 'page' });
  writeFile(outputPath, html);
  writeFile(sourcePath, html);
});

posts.forEach((post) => {
  const urlPath = new URL(post.link).pathname;
  const dir = pathFromUrl(urlPath, distDir);
  const sourceDir = pathFromUrl(urlPath, sourcePostsDir);
  const outputPath = path.join(dir, 'index.html');
  const sourcePath = path.join(sourceDir, 'index.html');
  const sanitized = sanitizeContent(post.content);
  const content = `
  <section class="page-hero"><div class="container"><h1>${post.title}</h1><p>${post.excerpt || ''}</p></div></section>
  <section class="content-section"><div class="container">${sanitized}</div></section>
  <section class="cta"><div class="container"><h2>Need support?</h2><p>Call ${site.phone} or reach out to our team.</p><a class="btn btn-primary" href="${site.contactUrl}">Request Appointment</a></div></section>`;

  const html = renderBasePage({ title: post.title, description: post.excerpt, content, pageClass: 'post' });
  writeFile(outputPath, html);
  writeFile(sourcePath, html);
});

categories.forEach((category) => {
  const urlPath = `/category/${category.slug}/`;
  const dir = pathFromUrl(urlPath, distDir);
  const sourceDir = pathFromUrl(urlPath, sourcePagesDir);
  const outputPath = path.join(dir, 'index.html');
  const sourcePath = path.join(sourceDir, 'index.html');
  const catPosts = postsByCategory[category.id] || [];
  const list = catPosts.map((post) => {
    return `<li><a href="${new URL(post.link).pathname}">${post.title}</a></li>`;
  }).join('');
  const content = `
  <section class="page-hero"><div class="container"><h1>${category.name}</h1><p>Posts filed under ${category.name}.</p></div></section>
  <section class="content-section"><div class="container"><ul>${list || '<li>No posts yet.</li>'}</ul></div></section>`;
  const html = renderBasePage({ title: `${category.name} | Stepping Stones`, description: category.name, content, pageClass: 'archive' });
  writeFile(outputPath, html);
  writeFile(sourcePath, html);
});

const servicesIndexHtml = renderBasePage({
  title: 'Services | Stepping Stones Community Resources, Inc.',
  description: 'Explore Stepping Stones services and care options.',
  content: renderServicesIndex(services),
  pageClass: 'services-index'
});
const servicesDir = pathFromUrl('/services/', distDir);
const servicesSourceDir = pathFromUrl('/services/', sourcePagesDir);
writeFile(path.join(servicesDir, 'index.html'), servicesIndexHtml);
writeFile(path.join(servicesSourceDir, 'index.html'), servicesIndexHtml);

console.log('Build complete.');

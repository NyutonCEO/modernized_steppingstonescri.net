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
let assetMap = {};

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
  Object.entries(assetMap).forEach(([remote, local]) => {
    content = content.split(remote).join(local);
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
    <a class="logo" href="/" aria-label="${site.name}">
      <img src="/assets/SteppingStonesLogo3.png" alt="${site.name} logo">
    </a>
    <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    <nav class="site-nav" id="primary-nav" aria-label="Primary navigation">
      ${navItems(nav)}
    </nav>
  </div>
</header>`;
};

const renderFooter = (site, sections) => {
  const columns = sections.map((section) => {
    const items = section.items.map((item) => {
      return `<li><a href="${cleanUrl(item.url)}">${item.title}</a></li>`;
    }).join('');
    return `
    <div class="footer-col">
      <h4>${section.title}</h4>
      <ul>${items}</ul>
    </div>`;
  }).join('');

  return `
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <h4>${site.name}</h4>
      <p>Call ${site.phone}</p>
    </div>
    <div class="footer-grid">
      ${columns}
    </div>
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
  <a class="skip-link" href="#main-content">Skip to content</a>
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
    <button class="slider-btn toggle" type="button" aria-pressed="false" aria-label="Pause autoplay">Pause</button>
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
    <div class="slider" aria-label="Services slider">
      <div class="slider-track">
        ${items}
      </div>
    </div>
  </div>
</section>`;
};

const extractHomeSections = (rawHtml) => {
  let cleaned = rawHtml || '';
  cleaned = cleaned.replace(/<div class="callout-wrap">[\s\S]*?Click here to preview[\s\S]*?<\/div>\s*<p><!-- END callout-wrap --><br class="clear" \/><\/p>/i, '');

  const highlightBlock = cleaned.match(/<div class="callout-wrap">(?:(?!<div class="callout-wrap">)[\s\S])*?You know you can(?:(?!<div class="callout-wrap">)[\s\S])*?<\/div>/i);
  const highlightText = highlightBlock ? stripTags(highlightBlock[0]) : '';
  if (highlightBlock) {
    cleaned = cleaned.replace(highlightBlock[0], '');
  }

  const leadBlock = cleaned.match(/<div class="callout-wrap">(?:(?!<div class="callout-wrap">)[\s\S])*?Stepping Stones Community Resources, Inc\.(?:(?!<div class="callout-wrap">)[\s\S])*?<\/div>/i);
  const leadHtml = leadBlock ? leadBlock[0] : '';
  if (leadBlock) {
    cleaned = cleaned.replace(leadBlock[0], '');
  }

  const cardTitles = ['Quality Care', 'Dependable', 'Personalized'];
  const cards = [];
  cardTitles.forEach((title) => {
    const titleRegex = new RegExp(`<strong>${title}<\\/strong><\\/p>[\\s\\S]*?<p>([^<]+)<\\/p>`, 'i');
    const match = cleaned.match(titleRegex);
    if (!match) return;
    const before = cleaned.slice(0, match.index);
    const imageMatches = [...before.matchAll(/<img[^>]+src=['"]([^'"]+)['"]/gi)];
    const image = imageMatches.length ? imageMatches[imageMatches.length - 1][1] : '';
    if (!image) return;
    cards.push({ image, title, text: match[1] });
  });

  cleaned = cleaned.replace(/<div class="one_third[\s\S]*?<p><br class="clear" \/><\/p>/i, '');
  cleaned = cleaned.replace(/<p><!-- END callout-wrap --><br class="clear" \/><\/p>/gi, '');
  cleaned = cleaned.replace(/<p><br class="clear" \/><\/p>/gi, '');

  return {
    leadHtml,
    highlightText,
    cards: cards.slice(0, 3),
    remaining: cleaned
  };
};

const renderValueSlider = (cards) => {
  if (!cards.length) return '';
  const items = cards.map((card) => {
    const imageUrl = assetMap[card.image] || card.image;
    return `
    <article class="value-slide">
      <div class="value-slide-image" style="background-image:url('${imageUrl}')"></div>
      <div class="value-slide-content">
        <h3>${card.title}</h3>
        <p>${card.text}</p>
      </div>
    </article>`;
  }).join('');

  return `
<section class="value-slider">
  <div class="container">
    <div class="section-heading">
      <h2>Our Commitment</h2>
      <p>Focused care that is consistent, dependable, and tailored to you.</p>
    </div>
    <div class="slider-shell">
      <button class="slider-btn prev" type="button" aria-label="Previous commitment">&#8592;</button>
      <div class="slider" aria-label="Commitment slider">
        <div class="slider-track">
          ${items}
        </div>
      </div>
      <button class="slider-btn next" type="button" aria-label="Next commitment">&#8594;</button>
    </div>
  </div>
</section>`;
};

const renderServicesIndex = (services) => {
  const cards = services.map((service) => {
    return `
    <article class="service-row">
      <div class="service-row-content">
        <h3>${service.name}</h3>
        <p>${service.summary}</p>
      </div>
      <a href="${service.path}" class="btn btn-primary">Learn more</a>
    </article>`;
  }).join('');

  return `
<section class="services-index">
  <div class="container">
    <div class="section-heading">
      <h2>Services</h2>
      <p>Each service below links to a full overview, expectations, and FAQs.</p>
    </div>
    <div class="service-rows">
      ${cards}
    </div>
  </div>
</section>`;
};

const renderResourcesIndex = (resources) => {
  const cards = resources.map((resource) => {
    return `
    <article class="resource-row">
      <div class="resource-row-content">
        <h3>${resource.title}</h3>
        <p>${resource.summary}</p>
      </div>
      <a href="${resource.path}" class="btn btn-primary">View resource</a>
    </article>`;
  }).join('');

  return `
<section class="services-index">
  <div class="container">
    <div class="section-heading">
      <h2>Resources</h2>
      <p>Helpful information, program details, and community resources.</p>
    </div>
    <div class="resource-scroll" aria-label="Resources list">
      <div class="resource-track">
        ${cards}
      </div>
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
    <div class="post-slider" aria-label="Recent posts slider">
      <div class="slider-track">
        ${items}
      </div>
    </div>
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
const assetMapPath = path.join(dataDir, 'asset-map.json');
if (fs.existsSync(assetMapPath)) {
  assetMap = readJson(assetMapPath);
}

const allowedServiceSlugs = new Set([
  'individual-counseling',
  'sacot',
  'saiop',
  'case-management',
  'dwi',
  'primary-care'
]);

const serviceNameOverrides = {
  sacot: 'Substance Abuse Counseling Outpatient Treatment',
  saiop: 'Substance Abuse Intensive Outpatient Program',
  'individual-counseling': 'Individual Outpatient Therapy',
  'dwi': 'DWI Services',
  'primary-care': 'Primary Care'
};

const filteredServices = services
  .filter((service) => allowedServiceSlugs.has(service.slug))
  .map((service) => ({
    ...service,
    name: serviceNameOverrides[service.slug] || service.name
  }));

const resourceSlugs = [
  'spreading-seeds',
  'healthy-start-medical-transportation',
  'substance-abuse-and-mental-health-information',
  'our-listings',
  'press-releases',
  'events',
  'newsletter',
  'stakeholder-surveys',
  'notices',
  'persons-served-rights-committee'
];

const resources = pages
  .filter((page) => resourceSlugs.includes(page.slug))
  .map((page) => {
    const pathName = new URL(page.link).pathname;
    const summary = page.excerpt || stripTags(page.content).split(/\s+/).slice(0, 32).join(' ') + '...';
    return {
      title: page.title,
      path: pathName,
      summary
    };
  });

const servicesFooterItems = filteredServices.map((service) => ({
  title: service.name,
  url: service.path
}));

const resourcesFooterItems = resources.map((resource) => ({
  title: resource.title,
  url: resource.path
}));

const postsFooterItems = posts.map((post) => ({
  title: post.title,
  url: new URL(post.link).pathname
}));

const archivesFooterItems = categories.map((category) => ({
  title: category.name,
  url: `/category/${category.slug}/`
}));

const otherPagesFooterItems = pages
  .filter((page) => {
    const pathName = new URL(page.link).pathname;
    if (pathName === '/services/' || pathName === '/resources/') return false;
    if (allowedServiceSlugs.has(page.slug)) return false;
    if (resourceSlugs.includes(page.slug)) return false;
    return true;
  })
  .map((page) => ({
    title: page.title,
    url: new URL(page.link).pathname
  }));

const footerSections = [
  { title: 'Services', items: servicesFooterItems },
  { title: 'Resources', items: resourcesFooterItems },
  { title: 'Posts', items: postsFooterItems },
  { title: 'Archives', items: archivesFooterItems },
  { title: 'Other Pages', items: otherPagesFooterItems }
];
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

const renderBasePage = ({ title, description, content, pageClass, footerSections }) => {
  const header = renderHeader(nav.header, site);
  const footer = renderFooter(site, footerSections);
  const body = `${header}\n<main id="main-content">${content}</main>\n${footer}`;
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
    const extracted = extractHomeSections(page.content);
    const leadHtml = sanitizeContent(extracted.leadHtml);
    const highlightHtml = extracted.highlightText ? `<p><strong>${extracted.highlightText}</strong></p>` : '';
    let remaining = sanitizeContent(extracted.remaining);
    remaining = remaining.replace(/<div class="callout-wrap">[\s\S]*?You know you can[\s\S]*?<\/div>/gi, '');
    const valueSlider = renderValueSlider(extracted.cards);
    const leadSection = leadHtml ? `<section class="home-lead"><div class="container">${leadHtml}</div></section>` : '';
    const highlightSection = highlightHtml ? `<section class="home-highlight"><div class="container">${highlightHtml}</div></section>` : '';
    const remainingSection = remaining ? `<section class="content-section"><div class="container">${remaining}</div></section>` : '';
    pageContent = `${renderHeroSlider(heroSlider)}${leadSection}${renderServicesSlider(filteredServices)}${valueSlider}${highlightSection}${remainingSection}${renderPostList(posts.slice(0, 3))}`;
  }

  if (urlPath === '/services/') {
    pageContent = renderServicesIndex(filteredServices);
  }

  if (serviceByPath.has(urlPath)) {
    const service = serviceByPath.get(urlPath);
    pageContent = renderServiceDetail(service, sanitized);
  }

  const html = renderBasePage({ title: page.title, description, content: pageContent, pageClass: 'page', footerSections });
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

  const html = renderBasePage({ title: post.title, description: post.excerpt, content, pageClass: 'post', footerSections });
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
  const html = renderBasePage({ title: `${category.name} | Stepping Stones`, description: category.name, content, pageClass: 'archive', footerSections });
  writeFile(outputPath, html);
  writeFile(sourcePath, html);
});

const servicesIndexHtml = renderBasePage({
  title: 'Services | Stepping Stones Community Resources, Inc.',
  description: 'Explore Stepping Stones services and care options.',
  content: renderServicesIndex(filteredServices),
  pageClass: 'services-index',
  footerSections
});
const servicesDir = pathFromUrl('/services/', distDir);
const servicesSourceDir = pathFromUrl('/services/', sourcePagesDir);
writeFile(path.join(servicesDir, 'index.html'), servicesIndexHtml);
writeFile(path.join(servicesSourceDir, 'index.html'), servicesIndexHtml);

const resourcesIndexHtml = renderBasePage({
  title: 'Resources | Stepping Stones Community Resources, Inc.',
  description: 'Resource guides, community information, and program materials.',
  content: renderResourcesIndex(resources),
  pageClass: 'resources-index',
  footerSections
});
const resourcesDir = pathFromUrl('/resources/', distDir);
const resourcesSourceDir = pathFromUrl('/resources/', sourcePagesDir);
writeFile(path.join(resourcesDir, 'index.html'), resourcesIndexHtml);
writeFile(path.join(resourcesSourceDir, 'index.html'), resourcesIndexHtml);

console.log('Build complete.');

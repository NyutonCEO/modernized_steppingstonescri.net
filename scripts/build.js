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
const toWebpPath = (src) => {
  if (!src) return '';
  if (src.endsWith('.svg')) return src;
  return src.replace(/\.(jpe?g|png)$/i, '.webp');
};

const renderPicture = ({ src, alt, className = '', loading = 'lazy', fetchpriority = '' }) => {
  const webp = toWebpPath(src);
  const fetchAttr = fetchpriority ? ` fetchpriority="${fetchpriority}"` : '';
  if (webp === src) {
    return `<img src="${src}" alt="${alt}" class="${className}" loading="${loading}" decoding="async"${fetchAttr}>`;
  }
  return `
<picture>
  <source srcset="${webp}" type="image/webp">
  <img src="${src}" alt="${alt}" class="${className}" loading="${loading}" decoding="async"${fetchAttr}>
</picture>`;
};
const toMetaDescription = (text, fallbackTitle) => {
  const stripped = stripTags(text || '').replace(/\s+/g, ' ').trim();
  if (!stripped) {
    return `Learn about ${fallbackTitle} from Stepping Stones Community Resources.`;
  }
  if (stripped.length <= 155) return stripped;
  return stripped.slice(0, 152).trim() + '...';
};
const metaOverrides = {
  '/': {
    title: 'Stepping Stones Community Resources | Addiction & Mental Health Treatment in Wilson NC',
    description: 'Confidential substance abuse and mental health treatment in Wilson, NC. Outpatient therapy, intensive programs, DWI services, and primary care. Call (919) 269-9300 today — you are not alone.'
  },
  '/individual-counseling/': {
    title: 'Individual Outpatient Therapy in Wilson NC | Stepping Stones',
    description: 'Personalized outpatient therapy for stress, anxiety, depression, and life challenges. Confidential care in Wilson, NC. Call (919) 269-9300 today.'
  },
  '/sacot/': {
    title: 'Substance Abuse Counseling in Wilson NC | Stepping Stones',
    description: 'Supportive outpatient substance abuse counseling focused on recovery and stability. Confidential treatment in Wilson, NC.'
  },
  '/saiop/': {
    title: 'Intensive Outpatient Program in Wilson NC | Stepping Stones',
    description: 'Structured intensive outpatient recovery programs providing accountability and support. Serving Wilson, NC.'
  },
  '/case-management/': {
    title: 'Behavioral Health Case Management in Wilson NC | Stepping Stones',
    description: 'Case management services connecting clients with resources, guidance, and support for lasting progress in Wilson, NC.'
  },
  '/primary-care/': {
    title: 'Primary Care in Wilson NC | Stepping Stones',
    description: 'Integrated primary care supporting whole-person wellness alongside behavioral health treatment in Wilson, NC.'
  },
  '/dwi/': {
    title: 'DWI Services in Wilson NC | Stepping Stones',
    description: 'State-approved DWI assessments and education services helping you meet requirements and move forward in Wilson, NC.'
  },
  '/general-information-contact/': {
    title: 'Contact Stepping Stones | Request an Appointment',
    description: 'Call or request an appointment with Stepping Stones Community Resources in Wilson, NC. Confidential help starts here.'
  },
  '/contact-us/': {
    title: 'Contact Stepping Stones | Request an Appointment',
    description: 'Call or request an appointment with Stepping Stones Community Resources in Wilson, NC. Confidential help starts here.'
  },
  '/about/': {
    title: 'About Stepping Stones Community Resources | Wilson NC',
    description: 'Learn about Stepping Stones Community Resources, Inc. and our compassionate outpatient services in Wilson, North Carolina.'
  },
  '/behavioral-mental-health/': {
    title: 'Mental Health Treatment in Wilson NC | Stepping Stones',
    description: 'Treatment for depression, anxiety, trauma, ADHD, and behavioral health challenges. Compassionate outpatient care in Wilson, NC.'
  },
  '/substance-abuse/': {
    title: 'Substance Abuse Treatment in Wilson NC | Stepping Stones',
    description: 'Professional substance abuse treatment with outpatient and intensive programs. Confidential recovery services in Wilson, NC.'
  },
  '/resources/': {
    title: 'Mental Health & Recovery Resources | Stepping Stones',
    description: 'Articles, updates, and educational resources about mental health, addiction recovery, and wellness from Stepping Stones in Wilson, NC.'
  },
  '/strategic-plan-2025-2026/': {
    title: 'Strategic Plan | Stepping Stones Community Resources',
    description: 'Strategic vision and community initiatives guiding Stepping Stones Community Resources in Wilson, NC.'
  },
  '/wilson-nc/': {
    title: 'Mental Health & Substance Abuse Treatment in Wilson NC | Stepping Stones',
    description: 'Serving Wilson County with confidential mental health and substance abuse treatment. Call Stepping Stones in Wilson, NC.'
  },
  '/rocky-mount-nc/': {
    title: 'Mental Health & Substance Abuse Treatment in Rocky Mount NC | Stepping Stones',
    description: 'Outpatient mental health and addiction recovery services serving Rocky Mount, NC and surrounding communities.'
  },
  '/garysburg-nc/': {
    title: 'Mental Health & Substance Abuse Treatment in Garysburg NC | Stepping Stones',
    description: 'Confidential substance abuse and mental health care serving Garysburg, NC. Call today for support.'
  },
  '/lake-benson-nc/': {
    title: 'Mental Health & Substance Abuse Treatment in Lake Benson NC | Stepping Stones',
    description: 'Compassionate outpatient treatment services serving Lake Benson, NC and nearby communities.'
  }
};
let assetMap = {};
let siteConfig = {
  sitePhoneDisplay: '(919) 269-9300',
  sitePhoneTel: '+19192699300'
};

const sanitizeContent = (html) => {
  if (!html) return '';
  let content = html;
  content = content.replace(/\[(\/)?[a-zA-Z0-9_-]+[^\]]*\]/g, '');
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
  const phonePatterns = [
    /\(919\)\s*269-9300/g,
    /919-269-9300/g,
    /919\.269\.9300/g
  ];
  phonePatterns.forEach((pattern) => {
    content = content.replace(pattern, siteConfig.sitePhoneDisplay);
  });
  content = content.replace(/<img(?![^>]*\salt=)[^>]*>/gi, (match) => {
    const srcMatch = match.match(/src=["']([^"']+)["']/i);
    let altText = 'Stepping Stones Community Resources photo';
    if (srcMatch) {
      const file = srcMatch[1].split('/').pop() || '';
      altText = file
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .trim() || altText;
    }
    return match.replace('<img', `<img alt="${altText}"`);
  });
  content = content.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    if (/loading=/.test(attrs)) return `<img${attrs}>`;
    return `<img${attrs} loading="lazy" decoding="async">`;
  });
  return content;
};

const pathFromUrl = (urlPath, rootDir) => {
  const safe = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!safe) return rootDir;
  return path.join(rootDir, safe);
};

const navItems = (items, currentPath, depth = 0) => {
  if (!items || !items.length) return '';
  const cls = depth === 0 ? 'nav-list' : 'nav-sublist';
  return `\n<ul class="${cls}">` +
    items.map((item) => {
      const title = item.title || '';
      const url = cleanUrl(item.url);
      const isHome = url === '/';
      const isActive = isHome ? currentPath === '/' : currentPath === url;
      const activeAttr = isActive ? ' aria-current="page"' : '';
      const activeClass = isActive ? ' is-active' : '';
      const hasChildren = item.children && item.children.length;
      const children = hasChildren ? navItems(item.children, currentPath, depth + 1) : '';
      return `\n<li class="nav-item${hasChildren ? ' has-children' : ''}">` +
        `<a href="${url}"${activeAttr} class="nav-link${activeClass}">${title}</a>${children}</li>`;
    }).join('') +
    '\n</ul>';
};

const renderHeader = (nav, site, currentPath) => {
  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/" aria-label="${site.name}">
      <img src="/assets/images/stepping-stones-modern-logo1.png" alt="${site.name} logo">
    </a>
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">Menu</button>
    <nav class="site-nav" aria-label="Primary navigation">
      ${navItems(nav, currentPath)}
    </nav>
    <div class="header-actions">
      <a class="btn btn-primary header-cta" href="tel:${siteConfig.sitePhoneTel}" aria-label="Call ${siteConfig.sitePhoneDisplay}">Call Now</a>
      <a class="btn btn-secondary header-cta-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
  </div>
  <div class="mobile-menu-overlay" data-menu-close></div>
  <div class="mobile-menu" id="mobileMenu" hidden>
    <div class="mobile-menu-header">
      <span class="mobile-menu-title">Menu</span>
      <button class="menu-close" type="button" aria-label="Close menu" data-menu-close>Close</button>
    </div>
    <nav class="mobile-nav" aria-label="Mobile navigation">
      ${navItems(nav, currentPath)}
    </nav>
    <div class="mobile-menu-actions">
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
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
      <p>Wilson, North Carolina</p>
      <p>Serving Wilson County and surrounding communities</p>
      <p><a href="tel:${siteConfig.sitePhoneTel}">Call ${siteConfig.sitePhoneDisplay}</a></p>
      <p class="footer-disclaimer">If this is an emergency, call 911 or go to your nearest emergency room.</p>
    </div>
    <div class="footer-grid">
      ${columns}
    </div>
  </div>
</footer>`;
};

const renderLayout = ({
  title,
  description,
  body,
  pageClass = '',
  canonicalPath = '/',
  ogTitle = '',
  ogDescription = '',
  preloadImage = '',
  extraSchema = null
}) => {
  const metaDesc = description ? `<meta name="description" content="${description}">` : '';
  const canonical = `${BASE_URL}${canonicalPath}`;
  const shareTitle = ogTitle || title;
  const shareDesc = ogDescription || description || '';
  const shareImage = `${BASE_URL}/assets/images/stepping-stones-modern-logo1.png`;
  const preloadTag = preloadImage ? `<link rel="preload" as="image" href="${preloadImage}">` : '';
  const schema = {
    "@context": "https://schema.org",
    "@type": ["MedicalOrganization", "LocalBusiness"],
    name: "Stepping Stones Community Resources, Inc.",
    url: BASE_URL,
    logo: shareImage,
    telephone: siteConfig.sitePhoneDisplay,
    serviceArea: "Wilson County and surrounding communities",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.sitePhoneDisplay,
        contactType: "customer service",
        areaServed: "US"
      }
    ],
    areaServed: [
      { "@type": "City", "name": "Wilson, NC" },
      { "@type": "City", "name": "Rocky Mount, NC" },
      { "@type": "City", "name": "Garysburg, NC" },
      { "@type": "City", "name": "Lake Benson, NC" }
    ]
  };
  if (sameAsLinks.length) {
    schema.sameAs = sameAsLinks;
  }
  const schemas = [schema];
  if (extraSchema) {
    if (Array.isArray(extraSchema)) {
      schemas.push(...extraSchema);
    } else {
      schemas.push(extraSchema);
    }
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  ${metaDesc}
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${shareTitle}">
  <meta property="og:description" content="${shareDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${shareImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${shareTitle}">
  <meta name="twitter:description" content="${shareDesc}">
  <meta name="twitter:image" content="${shareImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${preloadTag}
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="application/ld+json">${JSON.stringify(schemas)}</script>
</head>
<body class="${pageClass}">
  <a class="skip-link" href="#maincontent">Skip to content</a>
  ${body}
  <div class="mobile-call-bar" role="region" aria-label="Call Stepping Stones">
    <a href="tel:${siteConfig.sitePhoneTel}" class="btn btn-primary">Call ${siteConfig.sitePhoneDisplay}</a>
  </div>
  <script src="/assets/site.js" defer></script>
</body>
</html>`;
};

const renderHomeHero = (site) => {
  return `
<section class="home-hero" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="hero-kicker">Stepping Stones Community Resources, Inc.</p>
      <h1 id="hero-title">Substance Abuse &amp; Mental Health Treatment in Wilson, NC</h1>
      <p class="hero-subhead">Confidential, compassionate care for people facing addiction, stress, anxiety, depression, and life challenges. We offer outpatient counseling, intensive programs, DWI services, case management, and primary care—support built around you.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
        <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
      </div>
      <p class="hero-trust">Confidential care • Respectful support • You are not alone</p>
      <p class="hero-reassure">No referral required. We’ll help you understand your options and the next steps.</p>
    </div>
    <div class="hero-media">
      ${renderPicture({
        src: '/assets/images/IMG_2134.jpg',
        alt: 'Calm counseling space',
        className: 'hero-image',
        loading: 'eager',
        fetchpriority: 'high'
      })}
    </div>
  </div>
</section>`;
};

const renderFastPathTiles = (site) => {
  return `
<section class="fast-path" aria-labelledby="fast-path-title">
  <div class="container">
    <h2 id="fast-path-title" class="sr-only">Fast paths to get help</h2>
    <div class="tile-grid">
      <article class="tile-card">
        <h3>Talk to someone today</h3>
        <p>Call and we’ll listen, answer questions, and help you take the next step.</p>
        <a class="tile-link" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      </article>
      <article class="tile-card">
        <h3>Request an appointment</h3>
        <p>Send a request and we’ll follow up to schedule a time that works for you.</p>
        <a class="tile-link" href="${site.contactUrl}">Request Appointment</a>
      </article>
      <article class="tile-card">
        <h3>Explore services</h3>
        <p>Find the right program—outpatient therapy, recovery services, DWI support, and more.</p>
        <a class="tile-link" href="/services/">View Services</a>
      </article>
    </div>
  </div>
</section>`;
};

const renderServicesGrid = (services) => {
  const items = services.map((service) => {
    return `
    <article class="service-card">
      <div class="service-card-media">
        ${renderPicture({ src: service.image, alt: service.name })}
      </div>
      <div class="service-card-body">
        <h3>${service.name}</h3>
        <p>${service.summary}</p>
        <a href="${service.path}" class="service-link">${service.ctaText}</a>
      </div>
    </article>`;
  }).join('');

  return `
<section class="services-grid-section" aria-labelledby="services-title">
  <div class="container">
    <div class="section-heading">
      <h2 id="services-title">Services designed for recovery and wellness</h2>
      <p>Explore care options built around your needs, with clear next steps and supportive guidance.</p>
    </div>
    <div class="services-grid">
      ${items}
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

const renderCallProcess = () => {
  return `
<section class="call-process" aria-labelledby="call-process-title">
  <div class="container">
    <div class="section-heading">
      <h2 id="call-process-title">What happens when you call</h2>
      <p>We keep it simple and reassuring so you know what to expect.</p>
    </div>
    <div class="call-steps">
      <article class="call-step">
        <h3>Listen</h3>
        <p>Tell us what’s going on. We’ll answer immediate questions with respect and care.</p>
      </article>
      <article class="call-step">
        <h3>We explain options</h3>
        <p>We’ll review next steps and share which services may be the best fit for you.</p>
      </article>
      <article class="call-step">
        <h3>We schedule (if you choose)</h3>
        <p>If you want to move forward, we’ll schedule an appointment that works for you.</p>
      </article>
    </div>
    <p class="call-note">No referral required.</p>
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
  </div>
</section>`;
};

const renderCallProcessMini = () => {
  return `
<section class="call-process mini" aria-labelledby="call-process-mini-title">
  <div class="container">
    <h2 id="call-process-mini-title">What happens when you call</h2>
    <ol class="call-mini">
      <li>We listen and answer immediate questions.</li>
      <li>We explain your options and next steps.</li>
      <li>If you choose, we schedule an appointment.</li>
    </ol>
    <p class="call-note">No referral required.</p>
  </div>
</section>`;
};

const renderPrimaryCtaBand = ({ headline, text, includeEmergency = false }) => {
  const emergency = includeEmergency
    ? `<p class="footer-disclaimer">If this is an emergency, call 911 or go to your nearest emergency room.</p>`
    : '';
  return `
<section class="cta-band">
  <div class="container">
    <h2>${headline}</h2>
    <p>${text}</p>
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
    <p class="confidentiality">Confidential care. No referral required.</p>
    ${emergency}
  </div>
</section>`;
};

const renderContactBlocks = () => {
  return `
<section class="contact-blocks">
  <div class="container contact-grid">
    <div class="contact-card">
      <h2>Call us</h2>
      <p>Talk with our team for immediate questions or to start care.</p>
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
    </div>
    <div class="contact-card">
      <h2>Request an appointment</h2>
      <p>Send a request and we’ll follow up to schedule a time that works for you.</p>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
    <div class="contact-card">
      <h2>What happens next</h2>
      <ol>
        <li>We listen and answer questions.</li>
        <li>We explain options and next steps.</li>
        <li>We schedule a first appointment if you choose.</li>
      </ol>
      <p class="confidentiality">Confidential care. No referral required.</p>
      <p class="footer-disclaimer">If this is an emergency, call 911 or go to your nearest emergency room.</p>
    </div>
  </div>
</section>`;
};

const renderLocationIntro = (cityLabel) => {
  return `
<section class="location-intro">
  <div class="container">
    <p>We proudly serve individuals and families in ${cityLabel} with outpatient therapy, recovery services, and primary care support. Call to learn which services are the best fit for you.</p>
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
  </div>
</section>`;
};

const renderTrustBand = () => {
  return `
<section class="trust-band" aria-labelledby="trust-band-title">
  <div class="container">
    <div class="section-heading align-left">
      <h2 id="trust-band-title">Care you can count on</h2>
      <p>Reaching out can feel hard. Our team provides confidential, supportive services designed to help you feel heard, understood, and equipped for the next step—without judgment.</p>
    </div>
    <div class="trust-chips" aria-label="Trust highlights">
      <span>Confidential &amp; respectful</span>
      <span>Individualized support</span>
      <span>Clear next steps</span>
    </div>
  </div>
</section>`;
};

const renderTestimonials = () => {
  return `
<section class="testimonials" aria-labelledby="testimonials-title">
  <div class="container">
    <div class="section-heading">
      <h2 id="testimonials-title">Stories of support</h2>
    </div>
    <div class="testimonial-grid">
      <!-- Replace with approved testimonials as available. Do not add medical outcome guarantees. -->
      <article class="testimonial-card">
        <p>“From the first call, I felt listened to. The support helped me take the next step and stay consistent.”</p>
        <p class="testimonial-name">— M.T.</p>
      </article>
      <article class="testimonial-card">
        <p>“They treated me with respect and helped me understand my options. I didn’t feel alone in it anymore.”</p>
        <p class="testimonial-name">— J.R.</p>
      </article>
      <article class="testimonial-card">
        <p>“The structure and support made a difference. I’m grateful for the guidance and encouragement.”</p>
        <p class="testimonial-name">— S.L.</p>
      </article>
    </div>
  </div>
</section>`;
};

const renderHomeFaq = () => {
  return `
<section class="home-faq" aria-labelledby="faq-title">
  <div class="container">
    <div class="section-heading">
      <h2 id="faq-title">Frequently asked questions</h2>
    </div>
    <div class="faq-grid">
      <details>
        <summary>What services does Stepping Stones Community Resources provide?</summary>
        <p>We provide outpatient mental health therapy, substance abuse counseling, intensive outpatient treatment, case management, DWI services, and integrated primary care. All services are delivered with confidentiality and individualized care.</p>
      </details>
      <details>
        <summary>Who can receive services at Stepping Stones?</summary>
        <p>We serve adolescents, adults, men, and women seeking help with substance use, mental health challenges, behavioral concerns, or DWI-related requirements.</p>
      </details>
      <details>
        <summary>Do I need a referral to start treatment?</summary>
        <p>No referral is required. You can call us directly to speak with our team and schedule an assessment.</p>
      </details>
      <details>
        <summary>What happens when I call?</summary>
        <p>We listen to your needs, answer your questions, explain treatment options, and schedule your first appointment if you choose to move forward.</p>
      </details>
      <details>
        <summary>Is treatment confidential?</summary>
        <p>Yes. All services are provided in a confidential and respectful environment following professional privacy standards.</p>
      </details>
    </div>
  </div>
</section>`;
};

const renderFinalCta = (site) => {
  return `
<section class="final-cta" aria-labelledby="final-cta-title">
  <div class="container">
    <h2 id="final-cta-title">Ready to take the first step?</h2>
    <p>Call today or request an appointment. We’ll listen, answer your questions, and help you move forward.</p>
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
    <p class="confidentiality">Confidential care in a respectful environment.</p>
    <p class="footer-disclaimer">If this is an emergency, call 911 or go to your nearest emergency room.</p>
  </div>
</section>`;
};

const renderRelatedLinks = () => {
  const serviceLinks = homeServices.map((service) => {
    return `<li><a href="${service.path}">${service.name}</a></li>`;
  }).join('');
  const locationLinks = [
    { title: 'Wilson, NC', url: '/wilson-nc/' },
    { title: 'Rocky Mount, NC', url: '/rocky-mount-nc/' },
    { title: 'Garysburg, NC', url: '/garysburg-nc/' },
    { title: 'Lake Benson, NC', url: '/lake-benson-nc/' }
  ].map((loc) => `<li><a href="${loc.url}">${loc.title}</a></li>`).join('');
  return `
<section class="related-links">
  <div class="container">
    <div>
      <h2>Related services</h2>
      <ul>${serviceLinks}</ul>
    </div>
    <div>
      <h2>Service areas</h2>
      <ul>${locationLinks}</ul>
    </div>
  </div>
</section>`;
};
const shouldIncludeCallProcess = (urlPath) => {
  if (urlPath === '/' || urlPath === '/services/' || urlPath === '/resources/') return true;
  const highIntentPrefixes = [
    '/individual-outpatient-therapy-request-an-appointment/',
    '/substance-abusemental-health-contact/',
    '/primary-care-request-an-appointment/',
    '/dwi-2/',
    '/general-information-contact/'
  ];
  if (highIntentPrefixes.includes(urlPath)) return true;
  const slug = urlPath.replace(/^\/|\/$/g, '');
  if (allowedServiceSlugs.has(slug)) return true;
  if (urlPath.endsWith('-nc/')) return true;
  return false;
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
    <article class="resource-card">
      <h3>${resource.title}</h3>
      <p>${resource.summary}</p>
      <a href="${resource.path}" class="service-link">Read ${resource.title}</a>
    </article>`;
  }).join('');

  return `
<section class="services-index">
  <div class="container">
    <div class="section-heading">
      <h2>Resources</h2>
      <p>Helpful information, program details, and community resources.</p>
    </div>
    <div class="resource-grid">
      ${cards}
    </div>
  </div>
</section>`;
};
const renderServiceDetail = (service, pageContent) => {
  const serviceH1Overrides = {
    'individual-counseling': 'Individual Outpatient Therapy in Wilson, NC',
    sacot: 'Substance Abuse Counseling in Wilson, NC',
    saiop: 'Substance Abuse Intensive Outpatient Program in Wilson, NC',
    'case-management': 'Case Management Services in Wilson, NC',
    'primary-care': 'Primary Care Services in Wilson, NC',
    dwi: 'DWI Services in Wilson, NC'
  };
  const serviceHeading = serviceH1Overrides[service.slug] || `${service.name} in Wilson, NC`;
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
      <h1>${serviceHeading}</h1>
      <p>${service.summary}</p>
      <div class="call-actions">
        <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
        <a class="btn btn-secondary" href="${service.ctaUrl}">Request an Appointment</a>
      </div>
      <p class="confidentiality">Confidential care. No referral required.</p>
    </div>
    ${renderPicture({ src: service.image, alt: service.name })}
  </div>
</section>
<section class="service-content">
  <div class="container service-content-grid">
    <div>
      <h2>What this service is</h2>
      <p>${service.summary}</p>
      ${pageContent}
    </div>
    <div>
      <h2>Who it’s for</h2>
      <p>People seeking support for recovery, mental wellness, or life challenges who want structured, compassionate care.</p>
      <h2>Benefits</h2>
      <ul>
        <li>Clear next steps and supportive guidance</li>
        <li>Confidential, respectful care</li>
        <li>Coordinated support tailored to you</li>
      </ul>
    </div>
  </div>
</section>
<section class="expectations">
  <div class="container">
    <h2>What to expect</h2>
    <ul>${expectations}</ul>
  </div>
</section>
${renderCallProcessMini()}
<section class="faq">
  <div class="container">
    <h2>FAQ</h2>
    <div class="faq-list">${faqs}</div>
  </div>
</section>
${renderPrimaryCtaBand({
  headline: 'Ready to take the next step?',
  text: 'Call today or request an appointment. We’ll listen, answer your questions, and help you move forward.',
  includeEmergency: false
})}`;
};

const renderPostList = (posts) => {
  if (!posts.length) return '';
  const items = posts.map((post) => {
    const date = new Date(post.date);
    const hasDate = !Number.isNaN(date.getTime());
    const dateLabel = hasDate
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '';
    const dateTag = hasDate
      ? `<time datetime="${date.toISOString()}">${dateLabel}</time>`
      : '';
    return `
    <article class="post-card">
      <p class="post-date">${dateTag}</p>
      <h3><a href="${new URL(post.link).pathname}">${post.title}</a></h3>
      <p>${post.excerpt}</p>
    </article>`;
  }).join('');
  return `
<section class="post-list" aria-labelledby="posts-title">
  <div class="container">
    <div class="section-heading">
      <h2 id="posts-title">Recent posts</h2>
      <p>Updates, events, and resources from Stepping Stones.</p>
    </div>
    <div class="post-grid">
      ${items}
    </div>
  </div>
</section>`;
};

const renderRelatedPosts = (posts, currentSlug) => {
  const related = posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
  if (!related.length) return '';
  const items = related.map((post) => {
    return `<li><a href="${new URL(post.link).pathname}">${post.title}</a></li>`;
  }).join('');
  return `
<section class="related-posts">
  <div class="container">
    <h2>Related posts</h2>
    <ul>${items}</ul>
  </div>
</section>`;
};

const pages = readJson(path.join(dataDir, 'pages.json'));
const posts = readJson(path.join(dataDir, 'posts.json'));
const categories = readJson(path.join(dataDir, 'categories.json'));
const nav = readJson(path.join(dataDir, 'nav.json'));
const services = readJson(path.join(dataDir, 'services.json'));
const site = readJson(path.join(dataDir, 'site.json'));
const socialDomains = ['facebook.com', 'twitter.com', 'youtube.com', 'linkedin.com', 'instagram.com'];
const sameAsLinks = (nav.footer || [])
  .map((item) => item.url)
  .filter((url) => socialDomains.some((domain) => url.includes(domain)));
const assetMapPath = path.join(dataDir, 'asset-map.json');
if (fs.existsSync(assetMapPath)) {
  assetMap = readJson(assetMapPath);
}
const siteConfigPath = path.join(dataDir, 'siteConfig.json');
if (fs.existsSync(siteConfigPath)) {
  siteConfig = readJson(siteConfigPath);
}

const homeServiceOrder = [
  {
    slug: 'individual-counseling',
    name: 'Individual Outpatient Therapy',
    summary: 'Personalized therapy to help you manage stress, mood, behavior, and life challenges—one step at a time.',
    image: '/assets/images/Hello-my-name-is-2.jpg',
    ctaText: 'Learn about Individual Outpatient Therapy'
  },
  {
    slug: 'sacot',
    name: 'Substance Abuse Counseling Outpatient Treatment (SACOT)',
    summary: 'Supportive outpatient counseling focused on recovery skills, stability, and long-term change.',
    image: '/assets/images/SACOT-Pic.jpg',
    ctaText: 'Learn about Substance Abuse Counseling (SACOT)'
  },
  {
    slug: 'saiop',
    name: 'Substance Abuse Intensive Outpatient Program (SAIOP)',
    summary: 'A structured program with more support and accountability—designed to strengthen recovery.',
    image: '/assets/images/SAIOP-Pic.jpg',
    ctaText: 'Learn about Intensive Outpatient (SAIOP)'
  },
  {
    slug: 'case-management',
    name: 'Case Management',
    summary: 'Guidance connecting you to services, resources, and practical support to stay on track.',
    image: '/assets/images/Case-Management-Pic.jpg',
    ctaText: 'Learn about Case Management'
  },
  {
    slug: 'primary-care',
    name: 'Primary Care',
    summary: 'Whole-person wellness through primary care services that support your overall health.',
    image: '/assets/images/handshake.jpg',
    ctaText: 'Learn about Primary Care'
  },
  {
    slug: 'dwi',
    name: 'DWI Services',
    summary: 'Assessments and services to help you meet requirements and move forward with confidence.',
    image: '/assets/images/Drivers-Licensed-2.jpg',
    ctaText: 'Learn about DWI Services'
  }
];

const allowedServiceSlugs = new Set(homeServiceOrder.map((service) => service.slug));

const serviceNameOverrides = {
  sacot: 'Substance Abuse Counseling Outpatient Treatment',
  saiop: 'Substance Abuse Intensive Outpatient Program',
  'individual-counseling': 'Individual Outpatient Therapy',
  'dwi': 'DWI Services',
  'primary-care': 'Primary Care'
};

const serviceBySlug = new Map(services.map((service) => [service.slug, service]));

const filteredServices = services
  .filter((service) => allowedServiceSlugs.has(service.slug))
  .map((service) => ({
    ...service,
    name: serviceNameOverrides[service.slug] || service.name
  }));

const homeServices = homeServiceOrder.map((service) => {
  const matched = serviceBySlug.get(service.slug);
  return {
    ...service,
    path: matched ? matched.path : '#'
  };
});

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

const servicesFooterItems = homeServices.map((service) => ({
  title: service.name,
  url: service.path
}));

  const footerSections = [
    {
      title: 'Quick Links',
      items: [
        { title: 'About', url: '/about/' },
        { title: 'Services', url: '/services/' },
        { title: 'Resources', url: '/resources/' },
        { title: 'Contact Us', url: site.contactUrl },
        { title: 'Strategic Plan', url: '/strategic-plan-2025-2026/' }
      ]
  },
  {
    title: 'Services',
    items: servicesFooterItems
  },
  {
    title: 'Locations',
    items: [
      { title: 'Wilson, NC', url: '/wilson-nc/' },
      { title: 'Rocky Mount, NC', url: '/rocky-mount-nc/' },
      { title: 'Garysburg, NC', url: '/garysburg-nc/' },
      { title: 'Lake Benson, NC', url: '/lake-benson-nc/' }
    ]
  }
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

const renderBasePage = ({ title, description, content, pageClass, footerSections, canonicalPath, preloadImage, extraSchema }) => {
  const header = renderHeader(nav.header, site, canonicalPath);
  const footer = renderFooter(site, footerSections);
  const body = `${header}\n<main id="maincontent" tabindex="-1">${content}</main>\n${footer}`;
  return renderLayout({ title, description, body, pageClass, canonicalPath, preloadImage, extraSchema });
};

pages.forEach((page) => {
  const urlPath = new URL(page.link).pathname;
  const dir = pathFromUrl(urlPath, distDir);
  const sourceDir = pathFromUrl(urlPath, sourcePagesDir);
  const outputPath = path.join(dir, 'index.html');
  const sourcePath = path.join(sourceDir, 'index.html');
  let description = toMetaDescription(page.excerpt || page.content, page.title);
  let fullTitle = `${page.title} | Stepping Stones Community Resources`;
  const metaOverride = metaOverrides[urlPath];
  if (metaOverride) {
    fullTitle = metaOverride.title;
    description = metaOverride.description;
  }
  const sanitized = sanitizeContent(page.content);
  const isContactPage = urlPath.includes('contact') || urlPath.includes('request-an-appointment');
  const isLocationPage = urlPath.endsWith('-nc/') && urlPath !== '/';
  const callProcessBlock = shouldIncludeCallProcess(urlPath) ? renderCallProcessMini() : '';
  const heroExcerpt = page.excerpt ? sanitizeContent(page.excerpt) : '';
  const heroCta = `
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
    <p class="confidentiality">Confidential care. No referral required.</p>
  `;
  let extraSchema = null;
  let heroTitle = page.title;
  if (isLocationPage) {
    heroTitle = `Mental Health & Substance Abuse Treatment in ${page.title}`;
  }
  if (urlPath === '/general-information-contact/') {
    heroTitle = 'Contact Stepping Stones Community Resources';
  }
  if (urlPath === '/about/') {
    heroTitle = 'About Stepping Stones';
  }
  if (urlPath === '/resources/') {
    heroTitle = 'Resources & Articles';
  }

  if (urlPath === '/strategic-plan-2025-2026/') {
    heroTitle = 'Strategic Plan';
  }
  const content = `<section class="page-hero"><div class="container"><h1>${heroTitle}</h1><p>${heroExcerpt}</p>${heroCta}</div></section>` +
    `${isLocationPage ? renderLocationIntro(page.title) : ''}` +
    `<section class="content-section"><div class="container">${sanitized}</div></section>` +
    `${isContactPage ? renderContactBlocks() : callProcessBlock}` +
    `${renderPrimaryCtaBand({
      headline: 'Ready to take the next step?',
      text: 'Call today or request an appointment. We’ll listen, answer your questions, and help you move forward.',
      includeEmergency: isContactPage
    })}`;

  let pageContent = content;

  if (urlPath === '/') {
    const homeMeta = metaOverrides['/'];
    if (homeMeta) {
      fullTitle = homeMeta.title;
      description = homeMeta.description;
    } else {
      fullTitle = 'Substance Abuse & Mental Health Treatment in Wilson, NC | Stepping Stones';
      description = 'Compassionate outpatient treatment, mental health support, and primary care serving Wilson and surrounding North Carolina communities.';
    }
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What services does Stepping Stones Community Resources provide?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We provide outpatient mental health therapy, substance abuse counseling, intensive outpatient treatment, case management, DWI services, and integrated primary care. All services are delivered with confidentiality and individualized care."
          }
        },
        {
          "@type": "Question",
          name: "Who can receive services at Stepping Stones?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We serve adolescents, adults, men, and women seeking help with substance use, mental health challenges, behavioral concerns, or DWI-related requirements."
          }
        },
        {
          "@type": "Question",
          name: "Do I need a referral to start treatment?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No referral is required. You can call us directly to speak with our team and schedule an assessment."
          }
        },
        {
          "@type": "Question",
          name: "What happens when I call?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We listen to your needs, answer your questions, explain treatment options, and schedule your first appointment if you choose to move forward."
          }
        },
        {
          "@type": "Question",
          name: "Is treatment confidential?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All services are provided in a confidential and respectful environment following professional privacy standards."
          }
        }
      ]
    };
    const offerCatalog = {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: homeServices.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: `${BASE_URL}${service.path}`
        }
      }))
    };
    pageContent = `${renderHomeHero(site)}${renderFastPathTiles(site)}${renderServicesGrid(homeServices)}${renderCallProcess()}${renderTrustBand()}${renderTestimonials()}${renderHomeFaq()}${renderPostList(posts.slice(0, 3))}${renderFinalCta(site)}`;
    const html = renderBasePage({
      title: fullTitle,
      description,
      content: pageContent,
      pageClass: 'page',
      footerSections,
      canonicalPath: urlPath,
      preloadImage: '/assets/images/IMG_2134.webp',
      extraSchema: [faqSchema, offerCatalog]
    });
    writeFile(outputPath, html);
    writeFile(sourcePath, html);
    return;
  }

  if (urlPath === '/services/') {
    pageContent = `${renderServicesIndex(filteredServices)}${renderPrimaryCtaBand({
      headline: 'Not sure which service fits?',
      text: 'Call now and we’ll help you choose the right next step.',
      includeEmergency: false
    })}`;
    extraSchema = {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: homeServices.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: `${BASE_URL}${service.path}`
        }
      }))
    };
  }

  if (serviceByPath.has(urlPath)) {
    const service = serviceByPath.get(urlPath);
    pageContent = `${renderServiceDetail(service, sanitized)}${renderRelatedLinks()}`;
    extraSchema = {
      "@context": "https://schema.org",
      "@type": "Offer",
      itemOffered: {
        "@type": "MedicalProcedure",
        name: service.name,
        areaServed: "Wilson, NC",
        provider: {
          "@type": "MedicalOrganization",
          name: "Stepping Stones Community Resources, Inc."
        }
      }
    };
  }

  if (urlPath.endsWith('-nc/') || urlPath === '/locations/') {
    pageContent = `${pageContent}${renderRelatedLinks()}${renderCallProcessMini()}${renderPrimaryCtaBand({
      headline: 'Ready to get started?',
      text: 'Call today or request an appointment. We’re here to help.',
      includeEmergency: false
    })}`;
    if (isLocationPage) {
      const cityName = page.title.replace(/\s*NC\b/i, '').trim();
      const locationMeta = metaOverrides[urlPath];
      if (locationMeta) {
        heroTitle = `Mental Health & Substance Abuse Treatment in ${cityName}, NC`;
      }
      extraSchema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Stepping Stones Community Resources, Inc.",
        telephone: siteConfig.sitePhoneDisplay,
        areaServed: `${cityName}, NC`,
        address: {
          "@type": "PostalAddress",
          addressLocality: cityName,
          addressRegion: "NC",
          addressCountry: "US"
        }
      };
    }
  }

  if (isContactPage) {
    extraSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Stepping Stones Community Resources, Inc.",
      telephone: siteConfig.sitePhoneDisplay,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Wilson",
        addressRegion: "NC",
        addressCountry: "US"
      }
    };
  }

  const html = renderBasePage({
    title: fullTitle,
    description,
    content: pageContent,
    pageClass: 'page',
    footerSections,
    canonicalPath: urlPath,
    extraSchema
  });
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
  const summarySource = stripTags(post.excerpt || post.content).split('. ').shift() || post.title;
  const postDescription = `${summarySource.replace(/\.$/, '')}. Learn more from Stepping Stones in Wilson, NC.`;
  const content = `
  <section class="page-hero"><div class="container"><h1>${post.title}</h1><p>${post.excerpt || ''}</p>
    <div class="call-actions">
      <a class="btn btn-primary" href="tel:${siteConfig.sitePhoneTel}">Call Now</a>
      <a class="btn btn-secondary" href="${site.contactUrl}">Request an Appointment</a>
    </div>
  </div></section>
  <section class="content-section"><div class="container">${sanitized}</div></section>
  ${renderPrimaryCtaBand({
    headline: 'Questions about support?',
    text: 'Call today or request an appointment. We’re here to help.',
    includeEmergency: false
  })}
  ${renderRelatedPosts(posts, post.slug)}`;

  const fullTitle = `${post.title} | Stepping Stones Community Resources`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    mainEntityOfPage: `${BASE_URL}${urlPath}`,
    publisher: {
      "@type": "Organization",
      name: "Stepping Stones Community Resources, Inc."
    }
  };
  const html = renderBasePage({
    title: fullTitle,
    description: postDescription,
    content,
    pageClass: 'post',
    footerSections,
    canonicalPath: urlPath,
    extraSchema: articleSchema
  });
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
  const html = renderBasePage({
    title: `${category.name} | Stepping Stones Community Resources`,
    description: toMetaDescription(category.name, category.name),
    content,
    pageClass: 'archive',
    footerSections,
    canonicalPath: urlPath
  });
  writeFile(outputPath, html);
  writeFile(sourcePath, html);
});

const servicesIndexHtml = renderBasePage({
  title: 'Services | Stepping Stones Community Resources',
  description: 'Explore Stepping Stones services and care options.',
  content: `${renderServicesIndex(filteredServices)}${renderPrimaryCtaBand({
    headline: 'Not sure which service fits?',
    text: 'Call now and we’ll help you choose the right next step.',
    includeEmergency: false
  })}`,
  pageClass: 'services-index',
  footerSections,
  canonicalPath: '/services/'
});
const servicesDir = pathFromUrl('/services/', distDir);
const servicesSourceDir = pathFromUrl('/services/', sourcePagesDir);
writeFile(path.join(servicesDir, 'index.html'), servicesIndexHtml);
writeFile(path.join(servicesSourceDir, 'index.html'), servicesIndexHtml);

const resourcesIndexHtml = renderBasePage({
  title: 'Resources | Stepping Stones Community Resources',
  description: 'Resource guides, community information, and program materials.',
  content: `${renderResourcesIndex(resources)}${renderPrimaryCtaBand({
    headline: 'Need support right now?',
    text: 'Call today or request an appointment. We’re here to help.',
    includeEmergency: false
  })}`,
  pageClass: 'resources-index',
  footerSections,
  canonicalPath: '/resources/'
});
const resourcesDir = pathFromUrl('/resources/', distDir);
const resourcesSourceDir = pathFromUrl('/resources/', sourcePagesDir);
writeFile(path.join(resourcesDir, 'index.html'), resourcesIndexHtml);
writeFile(path.join(resourcesSourceDir, 'index.html'), resourcesIndexHtml);

const buildRouteSet = () => {
  const routes = new Set();
  pages.forEach((page) => {
    routes.add(new URL(page.link).pathname);
  });
  posts.forEach((post) => {
    routes.add(new URL(post.link).pathname);
  });
  categories.forEach((category) => {
    routes.add(`/category/${category.slug}/`);
  });
  routes.add('/services/');
  routes.add('/resources/');
  if (!routes.has('/')) routes.add('/');
  return routes;
};

const routes = buildRouteSet();
const sitemapEntries = [...routes]
  .sort()
  .map((route) => {
    return `  <url><loc>${BASE_URL}${route}</loc></url>`;
  })
  .join('\n');
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml);
writeFile(path.join(sourcePagesDir, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}/sitemap.xml\n`;
writeFile(path.join(distDir, 'robots.txt'), robotsTxt);
writeFile(path.join(sourcePagesDir, 'robots.txt'), robotsTxt);

console.log('Build complete.');

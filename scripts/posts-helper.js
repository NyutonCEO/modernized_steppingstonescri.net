const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '..', 'src', 'data', 'posts.json');

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const saveJson = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

const parseFrontmatter = (text) => {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return { meta: {}, body: text };
  const meta = {};
  let i = 1;
  for (; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === '---') {
      i += 1;
      break;
    }
    const [key, ...rest] = line.split(':');
    if (!key) continue;
    meta[key.trim()] = rest.join(':').trim();
  }
  const body = lines.slice(i).join('\n').trim();
  return { meta, body };
};

const parseCsv = (text) => {
  const rows = [];
  let current = '';
  let inQuotes = false;
  const pushCell = (row) => {
    row.push(current);
    current = '';
  };
  let row = [];
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      pushCell(row);
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      pushCell(row);
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      current += char;
    }
  }
  if (current.length || row.length) {
    pushCell(row);
    rows.push(row);
  }
  const headers = rows.shift().map((h) => h.trim());
  return rows.map((cells) => {
    const obj = {};
    headers.forEach((key, idx) => {
      obj[key] = (cells[idx] || '').trim();
    });
    return obj;
  });
};

const sanitizeContent = (html) => {
  if (!html) return '';
  let cleaned = html;
  cleaned = cleaned.replace(/<!--\s*wp:[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/\[[^\]]+\]/g, '');
  cleaned = cleaned.replace(/\sclass=\"[^\"]*\"/g, '');
  cleaned = cleaned.replace(/\sstyle=\"[^\"]*\"/g, '');
  return cleaned.trim();
};

const deriveExcerpt = (text, fallback) => {
  const stripped = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (stripped) {
    return stripped.split(' ').slice(0, 28).join(' ');
  }
  return fallback || '';
};

const REQUIRED_FIELDS = ['title', 'slug', 'date', 'excerpt', 'content'];

const normalizePost = (post, nextId) => {
  const slug = post.slug || post.title.toLowerCase().replace(/\s+/g, '-');
  const link = post.link || `https://steppingstonescri.net/${slug}/`;
  const categories = post.categories
    ? post.categories.split(',').map((c) => Number(c.trim())).filter(Boolean)
    : [];
  return {
    id: post.id || nextId,
    title: post.title || 'Untitled',
    slug,
    link,
    excerpt: post.excerpt || '',
    date: post.date || new Date().toISOString(),
    categories,
    content: sanitizeContent(post.content || '')
  };
};

const validatePosts = (posts) => {
  const errors = [];
  posts.forEach((post, index) => {
    REQUIRED_FIELDS.forEach((field) => {
      if (!post[field] || String(post[field]).trim() === '') {
        errors.push(`Row ${index + 1}: missing ${field}`);
      }
    });
  });
  if (errors.length) {
    console.error('Validation failed:');
    errors.forEach((err) => console.error(`- ${err}`));
    process.exit(1);
  }
};

const upsertPosts = (incoming, posts) => {
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  let nextId = posts.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
  incoming.forEach((item) => {
    const normalized = normalizePost(item, nextId);
    if (!bySlug.has(normalized.slug)) {
      nextId += 1;
      posts.push(normalized);
      bySlug.set(normalized.slug, normalized);
    } else {
      const existing = bySlug.get(normalized.slug);
      Object.assign(existing, normalized, { id: existing.id || normalized.id });
    }
  });
  return posts;
};

const loadFromMarkdown = (dir) => {
  const entries = fs.readdirSync(dir).filter((file) => file.endsWith('.md') && file !== 'README.md');
  return entries.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const { meta, body } = parseFrontmatter(content);
    const slug = meta.slug || file.replace(/\.md$/, '');
    const title = meta.title || slug.replace(/-/g, ' ');
    const date = meta.date || new Date().toISOString();
    const excerpt = meta.excerpt || deriveExcerpt(body, title);
    return {
      title,
      slug,
      date,
      excerpt,
      link: meta.link || '',
      categories: meta.categories || '',
      content: sanitizeContent(body)
    };
  });
};

const loadFromCsv = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseCsv(content).map((row) => ({
    title: row.title || '',
    slug: row.slug || '',
    date: row.date || '',
    excerpt: row.excerpt || deriveExcerpt(row.content || '', row.title || ''),
    link: row.link || '',
    categories: row.categories || '',
    content: sanitizeContent(row.content || '')
  }));
};

const args = process.argv.slice(2);
const sourceType = args[0];
const sourcePath = args[1];
if (!sourceType || !sourcePath) {
  console.log('Usage: node scripts/posts-helper.js --from-md content/posts');
  console.log('   or: node scripts/posts-helper.js --from-csv content/posts.csv');
  process.exit(1);
}

const existingPosts = loadJson(dataPath);
let incoming = [];

if (sourceType === '--from-md') {
  incoming = loadFromMarkdown(path.resolve(process.cwd(), sourcePath));
} else if (sourceType === '--from-csv') {
  incoming = loadFromCsv(path.resolve(process.cwd(), sourcePath));
} else {
  console.log('Unknown source type. Use --from-md or --from-csv.');
  process.exit(1);
}

validatePosts(incoming);
const updated = upsertPosts(incoming, existingPosts);
saveJson(dataPath, updated);
console.log(`Updated posts: ${updated.length}`);

const buildPath = path.resolve(__dirname, 'build.js');
if (fs.existsSync(buildPath)) {
  const { spawnSync } = require('child_process');
  const result = spawnSync('node', [buildPath], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

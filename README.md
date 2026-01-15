# Stepping Stones Static Site

This project recreates the Stepping Stones Community Resources, Inc. website as a modern static site. Content is pulled from the live site, normalized into JSON data sources, and compiled into static HTML under `dist/`.

## Build locally

1. Build the site:

```
node scripts/build.js
```

2. Run the link checker:

```
node scripts/link-check.js
```

3. Preview locally:

```
python3 -m http.server 8000 --directory dist
```

## Deploy to Bluehost

1. Run the build (`node scripts/build.js`).
2. Upload the contents of `dist/` to your Bluehost `public_html` directory.

## Data sources

- `src/data/pages.json`: All pages from the live site
- `src/data/posts.json`: Blog posts
- `src/data/categories.json`: Category archives
- `src/data/nav.json`: Header and footer navigation
- `src/data/services.json`: Services used by the services index + home slider
- `src/data/hero-slider.json`: Home hero slider content
- `src/data/site.json`: Global info like phone and contact URL

## Add a new service

1. Add a service object to `src/data/services.json` with `name`, `summary`, `path`, and `ctaUrl`.
2. Ensure the corresponding page exists in `src/data/pages.json` and is built into `dist/`.
3. Rebuild (`node scripts/build.js`).

## Add or edit a page

1. Update `src/data/pages.json` with the new page content (title, slug, link, excerpt, content).
2. Rebuild (`node scripts/build.js`).

## Notes

- The build generates static HTML files in both `src/pages/` and `dist/` to keep sources organized and outputs ready for deployment.
- The link checker verifies internal links in `dist/` and fails if any are missing.


## Update recent posts faster

Use the helper script to append or update posts from Markdown or CSV:

```
node scripts/posts-helper.js --from-md content/posts
```

```
node scripts/posts-helper.js --from-csv content/posts.csv
```


The helper script will auto-run `node scripts/build.js` after importing posts so the site updates immediately.

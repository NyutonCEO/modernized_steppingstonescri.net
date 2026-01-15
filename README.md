# Stepping Stones Static Site

This project recreates the Stepping Stones Community Resources, Inc. website as a modern static site. Content is pulled from the live site, normalized into JSON data sources, and compiled into static HTML under `dist/`.

## Build locally

1. Build the site:

```
node scripts/build.js
```

2. Run the QA checks:

```
node scripts/link-check.js
```

```
node scripts/qa-check.js
```

3. Preview locally:

```
python3 -m http.server 8000 --directory dist
```

## Deploy to Google (Firebase Hosting)

See `docs/hosting-google.md` for setup and DNS steps.

1. Build the site (`node scripts/build.js`).
2. Deploy: `firebase deploy --only hosting`.

## Deploy to Bluehost (legacy option)

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
- `src/data/siteConfig.json`: Single source for phone display/tel
- `src/data/asset-map.json`: Maps remote media URLs to local assets

## SEO + structured data

- Meta titles/descriptions are generated in `scripts/build.js` using `page.title`, `page.excerpt`, and `page.content`.
- Homepage meta title/description, FAQ content, and JSON-LD schema are defined in `scripts/build.js` (search for `metaOverrides` and `renderHomeFaq`).
- Homepage structured data (LocalBusiness/MedicalOrganization + FAQ + OfferCatalog) is defined in `scripts/build.js`.
- Social links for schema are pulled from `src/data/nav.json` footer items.

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
- The QA checker validates metadata, canonical tags, phone CTA presence, and image locality.

## Navigation + header updates

- Edit header/footer nav links in `src/data/nav.json`.
- Update the phone number in `src/data/siteConfig.json` (display + tel) and `src/data/site.json`.
- Update the appointment URL in `src/data/site.json` (`contactUrl`).
- Glass header styles and breakpoints live in `src/assets/styles.css` under `.site-header` and the `@media (max-width: 1024px)` block.
- The mobile sticky call CTA is rendered in `scripts/build.js` (search for `mobile-call-bar`).


## Update recent posts faster

Use the helper script to append or update posts from Markdown or CSV:

```
node scripts/posts-helper.js --from-md content/posts
```

```
node scripts/posts-helper.js --from-csv content/posts.csv
```


The helper script will auto-run `node scripts/build.js` after importing posts so the site updates immediately.

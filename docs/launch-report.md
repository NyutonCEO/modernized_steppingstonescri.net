# Launch Report

## Build + Deploy
- Build: `node scripts/build.js`
- Link check: `node scripts/link-check.js`
- QA check: `node scripts/qa-check.js`
- Deploy (Firebase): `firebase deploy --only hosting`

## What Changed
- Added Firebase Hosting config and deployment docs.
- Added sitemap.xml and robots.txt generation.
- Added schema, canonical, OG/Twitter metadata enhancements.
- Added phone-first CTA system (header/footer/sticky + above-the-fold on high-intent pages).
- Ensured services, locations, and related links are connected for internal navigation.
- Sanitized shortcodes in page/post content output.
- Mapped external images to local assets or placeholders.

## Remaining Risks / TODOs
- Missing original image files are currently replaced with placeholders; replace with real assets when available.
- Address/NAP details are not present in site data; add verified address if required for local SEO.
- Several images exceed 500kb; consider compressing/encoding to WebP for performance.

## Redirect Plan
- Use Firebase Hosting console to redirect `www.steppingstonescri.net` to `https://steppingstonescri.net`.
- Confirm any legacy WordPress slugs are preserved; otherwise add explicit redirects in `firebase.json`.

## Rollback
- Firebase Hosting release history rollback (console) or CLI clone command.

## 30-Day Monitoring
- Verify Search Console indexing status and sitemap submission.
- Monitor call CTA clicks (add analytics if desired).
- Spot-check top service pages for bounce rate and time on page.

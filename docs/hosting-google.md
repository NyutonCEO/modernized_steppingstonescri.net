# Google Hosting (Firebase)

## Prerequisites
- Google account with access to the `steppingstonescri.net` domain.
- Firebase CLI installed: `npm i -g firebase-tools`.

## Initialize Firebase Hosting
1. `firebase login`
2. `firebase init hosting`
   - Select or create the Firebase project.
   - Public directory: `dist`
   - Configure as a single-page app: **No**
   - Overwrite `dist/index.html`: **No**

## Deploy
1. Build the site: `node scripts/build.js`
2. Deploy: `firebase deploy --only hosting`

## Domain + DNS
1. In Firebase Hosting, add custom domain: `steppingstonescri.net`.
2. Verify domain ownership via the TXT record Firebase provides.
3. Add A records for `steppingstonescri.net` to Firebase IPs.
4. Add `www.steppingstonescri.net` as a second domain and configure Firebase's built-in redirect to the non-www domain.

## HTTPS
Firebase provisions HTTPS automatically after DNS verification. Allow time for certificate issuance.

## Rollback
- Firebase console -> Hosting -> Release history -> choose a prior release -> Roll back.
- Or CLI: `firebase hosting:clone SOURCE_SITE_ID:CHANNEL_ID TARGET_SITE_ID`.

## Notes
- Canonical domain is non-www: `https://steppingstonescri.net`.
- `firebase.json` is already configured for cache headers and clean URLs.

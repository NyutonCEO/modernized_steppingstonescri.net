# Posts Helper

This folder contains markdown files used to update `src/data/posts.json`.

## Markdown format

Use simple frontmatter with `---` delimiters:

```
---
title: Post Title
slug: post-title
date: 2026-01-14T12:00:00Z
excerpt: Short summary for lists and previews.
link: https://steppingstonescri.net/post-title/
categories: 1,2
---

<p>HTML content is allowed here.</p>
```

## CSV format

Headers supported: `title,slug,date,excerpt,link,categories,content`

Example:

```
title,slug,date,excerpt,link,categories,content
"Post Title","post-title","2026-01-14T12:00:00Z","Short summary","https://steppingstonescri.net/post-title/","1,2","<p>HTML content here</p>"
```

## Update posts.json

From markdown files:

```
node scripts/posts-helper.js --from-md content/posts
```

From CSV:

```
node scripts/posts-helper.js --from-csv content/posts.csv
```

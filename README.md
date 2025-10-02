# Miguel Machado's Blog - Built with Astro

A modern, fast markdown blog built with [Astro](https://astro.build) using content collections.

## 🚀 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   └── blog/           # Your markdown blog posts
│   │       ├── getting-started.md
│   │       ├── content-collections.md
│   │       └── performance.md
│   ├── pages/
│   │   ├── index.astro     # Home page
│   │   └── blog/
│   │       ├── index.astro      # Blog listing page
│   │       └── [slug].astro     # Dynamic blog post pages
│   └── content.config.ts   # Content collections configuration
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

## 📝 Adding New Blog Posts

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields:

```markdown
---
title: 'Your Post Title'
description: 'A brief description of your post'
pubDate: 2025-10-01
author: 'Your Name'
tags: ['tag1', 'tag2']
draft: false
---

# Your Content Here

Write your post content using Markdown...
```

### Required Frontmatter Fields

- `title` (string) - The post title
- `description` (string) - A brief description
- `pubDate` (date) - Publication date in YYYY-MM-DD format
- `author` (string) - Author name (defaults to 'Anonymous')
- `tags` (array) - Array of tag strings
- `draft` (boolean) - Set to `true` to hide from production

### Optional Frontmatter Fields

- `image` (object) - Post image with `url` and `alt` properties

## 🎨 Features

- ✅ **Content Collections** - Type-safe content management with Zod validation
- ✅ **Markdown Support** - Write posts in Markdown
- ✅ **Dynamic Routing** - Automatic page generation for blog posts
- ✅ **Tag System** - Organize posts with tags
- ✅ **Draft Posts** - Hide posts from production with `draft: true`
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **SEO Ready** - Meta tags and semantic HTML
- ✅ **Fast Performance** - Zero JavaScript by default

## 📚 Learn More

- [Astro Documentation](https://docs.astro.build)
- [Content Collections Guide](https://docs.astro.build/en/guides/content-collections/)
- [Markdown in Astro](https://docs.astro.build/en/guides/markdown-content/)

## 🚀 Deployment

Build the site for production:

```bash
npm run build
```

The built site will be in the `./dist/` folder, ready to deploy to any static hosting service like:

- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)


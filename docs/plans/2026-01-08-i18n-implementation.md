# i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add internationalization support with Portuguese (default at `/`) and English (at `/en/`) with translated URLs for SEO.

**Architecture:** Two separate content collections (`blogPt`, `blogEn`) with matching filenames to link translations. TypeScript-based UI translations with type safety. Language-aware routing via folder structure in `src/pages/`.

**Tech Stack:** Astro content collections, TypeScript, no external i18n libraries.

---

## Task 1: Create i18n Translation System

**Files:**
- Create: `src/i18n/pt.ts`
- Create: `src/i18n/en.ts`
- Create: `src/i18n/index.ts`

**Step 1: Create Portuguese translations file**

```typescript
// src/i18n/pt.ts
export const pt = {
  meta: {
    locale: "pt_BR",
    htmlLang: "pt-BR",
    language: "Portuguese",
  },
  nav: {
    home: "Home",
    search: "Buscar",
  },
  sidebar: {
    bio: "Apaixonado por desenvolvimento web, backend e games. Trabalhando com TypeScript, React, Next.js, Golang e mais :)",
  },
  blog: {
    backToHome: "Voltar ao início",
    previousPost: "Post Anterior",
    nextPost: "Próximo Post",
    readingTime: "min de leitura",
  },
  search: {
    title: "Buscar Posts",
    description: "Busque por artigos sobre desenvolvimento web moderno, Golang, TypeScript, React, arquitetura de software, performance e boas práticas de engenharia. Conteúdo técnico especializado para desenvolvedores.",
  },
  home: {
    title: "Miguel Machado - Senior Software Engineer",
    description: "Engenheiro de Software Sênior com 7+ anos de experiência em Golang, Node.js, React e TypeScript. Blog sobre desenvolvimento web moderno, arquitetura de software, performance e boas práticas. Conteúdo especializado em backend, frontend e tecnologias escaláveis.",
  },
  notFound: {
    title: "404 - Página não encontrada",
    message: "A página que você está procurando não existe.",
    backHome: "Voltar ao início",
  },
} as const;

export type Translations = typeof pt;
```

**Step 2: Create English translations file**

```typescript
// src/i18n/en.ts
import type { Translations } from "./pt";

export const en: Translations = {
  meta: {
    locale: "en_US",
    htmlLang: "en",
    language: "English",
  },
  nav: {
    home: "Home",
    search: "Search",
  },
  sidebar: {
    bio: "Passionate about web development, backend and games. Working with TypeScript, React, Next.js, Golang and more :)",
  },
  blog: {
    backToHome: "Back to home",
    previousPost: "Previous Post",
    nextPost: "Next Post",
    readingTime: "min read",
  },
  search: {
    title: "Search Posts",
    description: "Search for articles about modern web development, Golang, TypeScript, React, software architecture, performance and engineering best practices. Specialized technical content for developers.",
  },
  home: {
    title: "Miguel Machado - Senior Software Engineer",
    description: "Senior Software Engineer with 7+ years of experience in Golang, Node.js, React and TypeScript. Blog about modern web development, software architecture, performance and best practices. Specialized content in backend, frontend and scalable technologies.",
  },
  notFound: {
    title: "404 - Page not found",
    message: "The page you are looking for does not exist.",
    backHome: "Back to home",
  },
} as const;
```

**Step 3: Create i18n index with helpers**

```typescript
// src/i18n/index.ts
import { pt } from "./pt";
import { en } from "./en";

export type Lang = "pt" | "en";

export const languages: Record<Lang, string> = {
  pt: "Português",
  en: "English",
};

export const defaultLang: Lang = "pt";

export function getTranslations(lang: Lang) {
  return lang === "en" ? en : pt;
}

export function getLangFromUrl(url: URL): Lang {
  const pathname = url.pathname;
  if (pathname.startsWith("/en/") || pathname === "/en") {
    return "en";
  }
  return "pt";
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove leading slash for consistency
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  if (lang === "en") {
    return `/en/${cleanPath}`;
  }
  // Portuguese is default, no prefix
  return `/${cleanPath}`;
}

export function getHomePath(lang: Lang): string {
  return lang === "en" ? "/en" : "/";
}

export function getSearchPath(lang: Lang): string {
  return lang === "en" ? "/en/search" : "/search";
}

export function formatDate(date: Date, lang: Lang): string {
  const locale = lang === "en" ? "en-US" : "pt-BR";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export { pt, en };
```

**Step 4: Verify TypeScript compiles**

Run: `cd C:\www\miguelmachado.dev.astro\.worktrees\i18n && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat(i18n): add translation system with PT/EN support"
```

---

## Task 2: Update Content Collections Configuration

**Files:**
- Modify: `src/content.config.ts`

**Step 1: Update content config for two collections**

Replace the entire file content:

```typescript
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogSchema = ({ image }: { image: Function }) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("Anonymous"),
    layout: z.string().optional(),
    mainClass: z.string().optional(),
    color: z.string().optional(),
    slug: z.string().optional(),
    image: z
      .union([
        image(),
        z.object({
          url: z.string(),
          alt: z.string(),
        }),
      ])
      .optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  });

const blogPt = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog/pt" }),
  schema: blogSchema,
});

const blogEn = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog/en" }),
  schema: blogSchema,
});

export const collections = { blogPt, blogEn };
```

**Step 2: Commit**

```bash
git add src/content.config.ts
git commit -m "feat(i18n): configure separate PT/EN content collections"
```

---

## Task 3: Migrate Existing Content to Portuguese Folder

**Files:**
- Move: `src/content/blog/*.md` → `src/content/blog/pt/*.md`

**Step 1: Create the pt directory and move files**

```bash
cd C:\www\miguelmachado.dev.astro\.worktrees\i18n
mkdir -p src/content/blog/pt
mv src/content/blog/*.md src/content/blog/pt/
```

**Step 2: Create empty en directory for future content**

```bash
mkdir -p src/content/blog/en
```

**Step 3: Verify build still works**

Run: `npm run build`
Expected: Build completes successfully (may show 0 posts until pages are updated)

**Step 4: Commit**

```bash
git add src/content/blog/
git commit -m "feat(i18n): migrate existing posts to pt/ folder"
```

---

## Task 4: Create Post Helper Library

**Files:**
- Create: `src/lib/posts.ts`

**Step 1: Create posts helper**

```typescript
// src/lib/posts.ts
import { getCollection } from "astro:content";
import type { Lang } from "../i18n";

export async function getPublishedPosts(lang: Lang) {
  const collectionName = lang === "en" ? "blogEn" : "blogPt";
  const posts = await getCollection(collectionName, ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostSlug(post: { data: { slug?: string }; id: string }): string {
  return post.data.slug || post.id;
}

export function getPostUrl(post: { data: { slug?: string }; id: string }, lang: Lang): string {
  const slug = getPostSlug(post);
  return lang === "en" ? `/en/${slug}` : `/${slug}`;
}

export async function getTranslationSlug(
  currentFilename: string,
  targetLang: Lang
): Promise<string | null> {
  const collectionName = targetLang === "en" ? "blogEn" : "blogPt";
  const posts = await getCollection(collectionName);

  // Find post with matching filename (id)
  const translatedPost = posts.find((post) => post.id === currentFilename);

  if (translatedPost) {
    return translatedPost.data.slug || translatedPost.id;
  }
  return null;
}

// Map tags to colors (shared between languages)
export const tagColorMap: Record<string, string> = {
  astro: "blue",
  golang: "go",
  go: "go",
  typescript: "js",
  javascript: "js",
  protobuf: "proto",
  "protocol buffers": "proto",
  acessibilidade: "acessibilidade",
  accessibility: "acessibilidade",
  eslint: "eslint",
  alexa: "alexa",
};
```

**Step 2: Commit**

```bash
git add src/lib/posts.ts
git commit -m "feat(i18n): add posts helper library with language support"
```

---

## Task 5: Create Language Switcher Component

**Files:**
- Create: `src/components/LanguageSwitcher.astro`

**Step 1: Create the component**

```astro
---
// src/components/LanguageSwitcher.astro
import { getLangFromUrl, languages, type Lang } from "../i18n";

interface Props {
  translationSlug?: string | null;
  compact?: boolean;
}

const { translationSlug, compact = false } = Astro.props;
const currentLang = getLangFromUrl(Astro.url);
const targetLang: Lang = currentLang === "pt" ? "en" : "pt";

// Build alternate URL
let alternateUrl: string;
if (translationSlug) {
  alternateUrl = targetLang === "en" ? `/en/${translationSlug}` : `/${translationSlug}`;
} else {
  // For static pages (home, search), derive from current path
  const currentPath = Astro.url.pathname;
  if (currentLang === "pt") {
    // Going to English
    if (currentPath === "/" || currentPath === "") {
      alternateUrl = "/en";
    } else {
      alternateUrl = `/en${currentPath}`;
    }
  } else {
    // Going to Portuguese - remove /en prefix
    const ptPath = currentPath.replace(/^\/en\/?/, "/");
    alternateUrl = ptPath || "/";
  }
}

const targetLabel = languages[targetLang];
---

{compact ? (
  <a
    href={alternateUrl}
    class="lang-switch-compact"
    aria-label={`Switch to ${targetLabel}`}
    title={`Switch to ${targetLabel}`}
  >
    {targetLang === "en" ? "EN" : "BR"}
  </a>
) : (
  <a href={alternateUrl} class="lang-switch" aria-label={`Switch to ${targetLabel}`}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
    <span>{targetLabel}</span>
  </a>
)}

<style>
  .lang-switch {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    color: var(--text-secondary);
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .lang-switch:hover {
    background-color: var(--bg-card);
    color: var(--text-primary);
  }

  .lang-switch-compact {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    color: var(--text-secondary);
    transition: all 0.2s;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .lang-switch-compact:hover {
    background-color: var(--bg-card);
    color: var(--text-primary);
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/LanguageSwitcher.astro
git commit -m "feat(i18n): add language switcher component"
```

---

## Task 6: Update BaseLayout for i18n SEO

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Update BaseLayout props and imports**

Add to the frontmatter section at the top, replacing the existing Props interface and destructuring:

```astro
---
import faviconImg from "../assets/img/mmcoding-icon.png";
import { getLangFromUrl, getTranslations, type Lang } from "../i18n";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  articleDate?: Date;
  articleTags?: string[];
  canonical?: string;
  lang?: Lang;
  alternateSlug?: string | null;
}

const {
  title,
  description,
  ogImage,
  ogType = "website",
  articleDate,
  articleTags,
  canonical,
  lang: propLang,
  alternateSlug,
} = Astro.props;

const lang = propLang || getLangFromUrl(Astro.url);
const t = getTranslations(lang);

const currentUrl = new URL(
  Astro.url.pathname,
  Astro.site || "https://miguelmachado.dev"
);

// Ensure canonical URL never has trailing slash (except homepage)
let normalizedHref = currentUrl.href;
if (normalizedHref.endsWith('/') && currentUrl.pathname !== '/') {
  normalizedHref = normalizedHref.slice(0, -1);
}
const canonicalUrl = canonical || normalizedHref;

// Build alternate language URLs for hreflang
const siteBase = Astro.site?.href || "https://miguelmachado.dev";
const currentPath = Astro.url.pathname;

let ptUrl: string;
let enUrl: string;

if (alternateSlug !== undefined) {
  // For blog posts with specific translation slugs
  if (lang === "pt") {
    ptUrl = `${siteBase}${currentPath.replace(/^\//, "")}`;
    enUrl = alternateSlug ? `${siteBase}en/${alternateSlug}` : "";
  } else {
    enUrl = `${siteBase}${currentPath.replace(/^\//, "")}`;
    ptUrl = alternateSlug ? `${siteBase}${alternateSlug}` : "";
  }
} else {
  // For static pages (home, search, 404)
  if (lang === "pt") {
    ptUrl = canonicalUrl;
    enUrl = `${siteBase}en${currentPath === "/" ? "" : currentPath}`;
  } else {
    enUrl = canonicalUrl;
    const ptPath = currentPath.replace(/^\/en\/?/, "/");
    ptUrl = `${siteBase}${ptPath.replace(/^\//, "")}`;
  }
}
---
```

**Step 2: Update the HTML tag and add hreflang tags**

Replace `<html lang="pt-BR">` with:

```html
<html lang={t.meta.htmlLang}>
```

After the canonical link tag, add hreflang tags:

```astro
    <link rel="canonical" href={canonicalUrl} />
    {ptUrl && <link rel="alternate" hreflang="pt-BR" href={ptUrl} />}
    {enUrl && <link rel="alternate" hreflang="en" href={enUrl} />}
    {ptUrl && <link rel="alternate" hreflang="x-default" href={ptUrl} />}
```

**Step 3: Update og:locale meta tag**

Replace `<meta property="og:locale" content="pt_BR" />` with:

```astro
    <meta property="og:locale" content={t.meta.locale} />
```

**Step 4: Update language meta tag**

Replace `<meta name="language" content="Portuguese" />` with:

```astro
    <meta name="language" content={t.meta.language} />
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Build completes successfully

**Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat(i18n): add hreflang tags and dynamic locale to BaseLayout"
```

---

## Task 7: Update Sidebar Component

**Files:**
- Modify: `src/components/Sidebar.astro`

**Step 1: Add i18n imports and language switcher**

Update the frontmatter:

```astro
---
import { Image } from "astro:assets";
import { getLangFromUrl, getTranslations, getHomePath, getSearchPath } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher.astro";

interface Props {
  translationSlug?: string | null;
}

const { translationSlug } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const t = getTranslations(lang);
const homePath = getHomePath(lang);
const searchPath = getSearchPath(lang);
---
```

**Step 2: Update navigation links**

Replace the bio text:

```astro
          <p class="bio">
            {t.sidebar.bio}
          </p>
```

Update the nav links to use dynamic paths:

```astro
    <nav class="main-nav">
      <ul>
        <li>
          <a
            href={homePath}
            data-nav-link={homePath}
            class={Astro.url.pathname === homePath || Astro.url.pathname === `${homePath}/` ? "active" : ""}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>{t.nav.home}</span>
          </a>
        </li>
        <li>
          <a
            href={searchPath}
            data-nav-link={searchPath}
            class={Astro.url.pathname === searchPath || Astro.url.pathname === `${searchPath}/` ? "active" : ""}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>{t.nav.search}</span>
          </a>
        </li>
        <li>
          <LanguageSwitcher translationSlug={translationSlug} />
        </li>
      </ul>
    </nav>
```

**Step 3: Commit**

```bash
git add src/components/Sidebar.astro
git commit -m "feat(i18n): add language support to Sidebar component"
```

---

## Task 8: Update BottomNav Component

**Files:**
- Modify: `src/components/BottomNav.astro`

**Step 1: Add i18n support**

Update the frontmatter:

```astro
---
import { getLangFromUrl, getHomePath, getSearchPath } from "../i18n";
import LanguageSwitcher from "./LanguageSwitcher.astro";

interface Props {
  activePage?: "home" | "search" | "post";
  translationSlug?: string | null;
}

const { activePage = "home", translationSlug } = Astro.props;
const lang = getLangFromUrl(Astro.url);
const homePath = getHomePath(lang);
const searchPath = getSearchPath(lang);
---
```

**Step 2: Update nav links and add language switcher**

```astro
<div class="bottom-nav">
  <a
    href={homePath}
    class={`nav-item ${activePage === "home" ? "active" : ""}`}
    title="Go to home"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
    </svg>
  </a>
  <a
    href={searchPath}
    class={`nav-item ${activePage === "search" ? "active" : ""}`}
    title="Search for a post"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  </a>
  <LanguageSwitcher translationSlug={translationSlug} compact={true} />
  <button
    class={`nav-item scroll-to-top ${activePage === "post" ? "active" : ""}`}
    title="Scroll to top"
    type="button"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  </button>
</div>
```

**Step 3: Commit**

```bash
git add src/components/BottomNav.astro
git commit -m "feat(i18n): add language support to BottomNav component"
```

---

## Task 9: Update Portuguese Home Page

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Update imports and data fetching**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Sidebar from "../components/Sidebar.astro";
import PostCard from "../components/PostCard.astro";
import BottomNav from "../components/BottomNav.astro";
import { ogImageServiceUrl } from "../config/constants";
import { getPublishedPosts, getPostSlug, tagColorMap } from "../lib/posts";
import { getTranslations } from "../i18n";

const lang = "pt";
const t = getTranslations(lang);

const allPosts = await getPublishedPosts(lang);

const homeUrl = new URL("/", Astro.site || "https://miguelmachado.dev").href;
const homeOgImage = `${ogImageServiceUrl}?title=${encodeURIComponent(t.home.title)}`;
---
```

**Step 2: Update BaseLayout props**

```astro
<BaseLayout
  title={t.home.title}
  description={t.home.description}
  ogImage={homeOgImage}
  canonical={homeUrl}
  lang={lang}
>
```

**Step 3: Update post rendering**

```astro
          {
            allPosts.map((post) => {
              const firstTag = post.data.tags?.[0]?.toLowerCase() || "";
              const tagColor = tagColorMap[firstTag] || "blue";

              return (
                <PostCard
                  title={post.data.title}
                  description={post.data.description}
                  slug={getPostSlug(post)}
                  tag={post.data.tags?.[0]?.toUpperCase()}
                  tagColor={tagColor}
                  lang={lang}
                />
              );
            })
          }
```

**Step 4: Update Sidebar and BottomNav**

```astro
    <Sidebar />
    ...
    <BottomNav activePage="home" />
```

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(i18n): update PT home page with i18n support"
```

---

## Task 10: Update PostCard Component

**Files:**
- Modify: `src/components/PostCard.astro`

**Step 1: Read and update PostCard**

First, read the current file to see its structure, then add lang prop and update the link:

Add to Props interface:
```typescript
lang?: "pt" | "en";
```

Add to destructuring:
```typescript
const { title, description, slug, tag, tagColor, lang = "pt" } = Astro.props;
```

Update the link href:
```astro
<a href={lang === "en" ? `/en/${slug}` : `/${slug}`} class="post-card">
```

**Step 2: Commit**

```bash
git add src/components/PostCard.astro
git commit -m "feat(i18n): add language support to PostCard component"
```

---

## Task 11: Update Portuguese Blog Post Page

**Files:**
- Modify: `src/pages/[slug].astro`

**Step 1: Update imports**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Sidebar from "../components/Sidebar.astro";
import BottomNav from "../components/BottomNav.astro";
import { Image } from "astro:assets";
import { getCollection, render } from "astro:content";
import { ogImageServiceUrl } from "../config/constants";
import { getTranslations, formatDate } from "../i18n";
import { getTranslationSlug, getPostSlug, getPostUrl } from "../lib/posts";

const lang = "pt";
const t = getTranslations(lang);
```

**Step 2: Update getStaticPaths**

```astro
export async function getStaticPaths() {
  const blogEntries = await getCollection("blogPt");
  const sortedEntries = blogEntries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return sortedEntries.map((entry, index) => {
    const prevPost =
      index < sortedEntries.length - 1 ? sortedEntries[index + 1] : null;
    const nextPost = index > 0 ? sortedEntries[index - 1] : null;

    const slug = entry.data.slug || entry.id;

    return {
      params: { slug },
      props: { entry, prevPost, nextPost },
    };
  });
}
```

**Step 3: Add translation slug lookup**

After the `Astro.props` destructuring:

```astro
const { entry, prevPost, nextPost } = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await render(entry);

// Get translation slug for language switcher
const translationSlug = await getTranslationSlug(entry.id, "en");
```

**Step 4: Update BaseLayout call**

```astro
<BaseLayout
  title={`${entry.data.title} - Miguel Machado`}
  description={entry.data.description}
  ogType="article"
  ogImage={ogImageUrl}
  articleDate={entry.data.pubDate}
  articleTags={entry.data.tags}
  canonical={postUrl}
  lang={lang}
  alternateSlug={translationSlug}
>
```

**Step 5: Update Sidebar and BottomNav**

```astro
    <Sidebar translationSlug={translationSlug} />
    ...
    <BottomNav activePage="post" translationSlug={translationSlug} />
```

**Step 6: Update back link text**

```astro
          <a href="/" class="back-link" data-pagefind-ignore>
            <svg ...></svg>
            {t.blog.backToHome}
          </a>
```

**Step 7: Update date formatting**

```astro
              <time datetime={entry.data.pubDate.toISOString()}>
                {formatDate(entry.data.pubDate, lang)}
              </time>
```

**Step 8: Update prev/next labels**

```astro
                    <span class="nav-label">
                      <svg ...></svg>
                      {t.blog.previousPost}
                    </span>
```

```astro
                    <span class="nav-label">
                      {t.blog.nextPost}
                      <svg ...></svg>
                    </span>
```

**Step 9: Commit**

```bash
git add src/pages/[slug].astro
git commit -m "feat(i18n): update PT blog post page with i18n support"
```

---

## Task 12: Update Portuguese Search Page

**Files:**
- Modify: `src/pages/search.astro`

**Step 1: Update imports and add translations**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Sidebar from "../components/Sidebar.astro";
import BottomNav from "../components/BottomNav.astro";
import { ogImageServiceUrl } from "../config/constants";
import { getTranslations } from "../i18n";

const lang = "pt";
const t = getTranslations(lang);

const searchUrl = new URL("/search", Astro.site || "https://miguelmachado.dev")
  .href;
const searchOgImage = `${ogImageServiceUrl}?title=${encodeURIComponent(t.search.title)}&url=${searchUrl}`;
---
```

**Step 2: Update BaseLayout and title**

```astro
<BaseLayout
  title={t.search.title}
  description={t.search.description}
  ogImage={searchOgImage}
  canonical={searchUrl}
  lang={lang}
>
```

```astro
          <h1 class="search-title">{t.search.title}</h1>
```

**Step 3: Commit**

```bash
git add src/pages/search.astro
git commit -m "feat(i18n): update PT search page with i18n support"
```

---

## Task 13: Create English Pages Directory Structure

**Files:**
- Create: `src/pages/en/index.astro`
- Create: `src/pages/en/[slug].astro`
- Create: `src/pages/en/search.astro`
- Create: `src/pages/en/404.astro`

**Step 1: Create English home page**

```astro
---
// src/pages/en/index.astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import Sidebar from "../../components/Sidebar.astro";
import PostCard from "../../components/PostCard.astro";
import BottomNav from "../../components/BottomNav.astro";
import { ogImageServiceUrl } from "../../config/constants";
import { getPublishedPosts, getPostSlug, tagColorMap } from "../../lib/posts";
import { getTranslations } from "../../i18n";

const lang = "en";
const t = getTranslations(lang);

const allPosts = await getPublishedPosts(lang);

const homeUrl = new URL("/en", Astro.site || "https://miguelmachado.dev").href;
const homeOgImage = `${ogImageServiceUrl}?title=${encodeURIComponent(t.home.title)}`;
---

<BaseLayout
  title={t.home.title}
  description={t.home.description}
  ogImage={homeOgImage}
  canonical={homeUrl}
  lang={lang}
>
  <div class="app-container" data-pagefind-ignore="all">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <div class="posts-grid">
          {
            allPosts.map((post) => {
              const firstTag = post.data.tags?.[0]?.toLowerCase() || "";
              const tagColor = tagColorMap[firstTag] || "blue";

              return (
                <PostCard
                  title={post.data.title}
                  description={post.data.description}
                  slug={getPostSlug(post)}
                  tag={post.data.tags?.[0]?.toUpperCase()}
                  tagColor={tagColor}
                  lang={lang}
                />
              );
            })
          }
        </div>
      </div>

      <BottomNav activePage="home" />
    </main>
  </div>
</BaseLayout>

<style>
  .app-container {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    padding-bottom: 5rem;
  }

  .content-wrapper {
    max-width: 900px;
    margin: 0 auto;
  }

  .posts-grid {
    display: grid;
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
    }

    .main-content {
      margin-left: 0;
      padding: 1.5rem 1rem;
      padding-bottom: 6rem;
    }
  }
</style>
```

**Step 2: Create English blog post page**

```astro
---
// src/pages/en/[slug].astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import Sidebar from "../../components/Sidebar.astro";
import BottomNav from "../../components/BottomNav.astro";
import { Image } from "astro:assets";
import { getCollection, render } from "astro:content";
import { ogImageServiceUrl } from "../../config/constants";
import { getTranslations, formatDate } from "../../i18n";
import { getTranslationSlug, getPostSlug, getPostUrl } from "../../lib/posts";

const lang = "en";
const t = getTranslations(lang);

export async function getStaticPaths() {
  const blogEntries = await getCollection("blogEn");
  const sortedEntries = blogEntries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return sortedEntries.map((entry, index) => {
    const prevPost =
      index < sortedEntries.length - 1 ? sortedEntries[index + 1] : null;
    const nextPost = index > 0 ? sortedEntries[index - 1] : null;

    const slug = entry.data.slug || entry.id;

    return {
      params: { slug },
      props: { entry, prevPost, nextPost },
    };
  });
}

const { entry, prevPost, nextPost } = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await render(entry);

// Get translation slug for language switcher
const translationSlug = await getTranslationSlug(entry.id, "pt");

// SEO data
const slug = entry.data.slug || entry.id;
const postUrl = new URL(`/en/${slug}`, Astro.site || "https://miguelmachado.dev")
  .href;
const ogImageUrl = `${ogImageServiceUrl}?title=${encodeURIComponent(entry.data.title)}&url=${postUrl}`;
---

<BaseLayout
  title={`${entry.data.title} - Miguel Machado`}
  description={entry.data.description}
  ogType="article"
  ogImage={ogImageUrl}
  articleDate={entry.data.pubDate}
  articleTags={entry.data.tags}
  canonical={postUrl}
  lang={lang}
  alternateSlug={translationSlug}
>
  <div class="app-container">
    <Sidebar translationSlug={translationSlug} />

    <main class="main-content">
      <div class="content-wrapper">
        <article class="post-article">
          <a href="/en" class="back-link" data-pagefind-ignore>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            {t.blog.backToHome}
          </a>

          <header class="post-header">
            <div class="post-meta-top" data-pagefind-ignore>
              <time datetime={entry.data.pubDate.toISOString()}>
                {formatDate(entry.data.pubDate, lang)}
              </time>
              <span>•</span>
              <span>{remarkPluginFrontmatter.minutesRead}</span>
            </div>

            <h1 class="post-title" data-pagefind-meta="title">
              {entry.data.title}
            </h1>

            <p class="post-description">{entry.data.description}</p>

            {
              entry.data.tags && entry.data.tags.length > 0 && (
                <div class="post-tags" data-pagefind-ignore>
                  {entry.data.mainClass && (
                    <span class={`tag-badge tag-${entry.data.mainClass}`}>
                      {entry.data.mainClass.toUpperCase()}
                    </span>
                  )}
                  {entry.data.tags.map((tag) => (
                    <span class="tag">#{tag}</span>
                  ))}
                </div>
              )
            }
          </header>

          {
            entry.data.image && (
              <div class="post-image" data-pagefind-ignore>
                {typeof entry.data.image === "object" &&
                "src" in entry.data.image ? (
                  <Image
                    src={entry.data.image}
                    alt={entry.data.title}
                    loading="eager"
                    fetchpriority="high"
                    quality={90}
                  />
                ) : typeof entry.data.image === "object" &&
                  "url" in entry.data.image ? (
                  <img
                    src={entry.data.image.url}
                    alt={entry.data.image.alt}
                    fetchpriority="high"
                  />
                ) : null}
              </div>
            )
          }

          <div class="post-content prose" data-pagefind-body>
            <Content />
          </div>

          {
            (prevPost || nextPost) && (
              <nav class="post-navigation" data-pagefind-ignore>
                {prevPost && (
                  <a
                    href={`/en/${prevPost.data.slug || prevPost.id}`}
                    class="nav-post prev-post"
                  >
                    <span class="nav-label">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      {t.blog.previousPost}
                    </span>
                    <span class="nav-title">{prevPost.data.title}</span>
                  </a>
                )}

                {nextPost && (
                  <a
                    href={`/en/${nextPost.data.slug || nextPost.id}`}
                    class="nav-post next-post"
                  >
                    <span class="nav-label">
                      {t.blog.nextPost}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <span class="nav-title">{nextPost.data.title}</span>
                  </a>
                )}
              </nav>
            )
          }
        </article>
      </div>

      <BottomNav activePage="post" translationSlug={translationSlug} />
    </main>
  </div>
</BaseLayout>

<style>
  /* Copy all styles from src/pages/[slug].astro */
  .app-container {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    padding-bottom: 5rem;
  }

  .content-wrapper {
    max-width: 900px;
    margin: 0 auto;
  }

  .post-article {
    background-color: var(--bg-card);
    border-radius: 12px;
    padding: 3rem;
    box-shadow: var(--card-shadow);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.938rem;
    margin-bottom: 2rem;
    transition: color 0.2s;
    font-weight: 500;
  }

  .back-link:hover {
    color: var(--accent-purple-hover);
  }

  .back-link svg {
    transition: transform 0.2s;
  }

  .back-link:hover svg {
    transform: translateX(-3px);
  }

  .post-header {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
  }

  .post-meta-top {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.938rem;
    margin-bottom: 1.5rem;
  }

  .post-meta-top time {
    color: var(--accent-cyan);
  }

  .post-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .post-description {
    font-size: 1.125rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .post-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .tag-badge {
    padding: 0.35rem 0.875rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tag-badge.tag-go {
    background: #00add8;
    color: #fff;
  }

  .tag-badge.tag-proto {
    background: #a277ff;
    color: #fff;
  }

  .tag-badge.tag-dev {
    background: #a277ff;
    color: #fff;
  }

  .tag {
    color: var(--text-secondary);
    padding: 0.35rem 0.5rem;
    font-size: 0.813rem;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  .post-image {
    margin: 2rem 0;
    border-radius: 12px;
    overflow: hidden;
  }

  .post-image img {
    width: 100%;
    height: auto;
    display: block;
  }

  .post-content {
    color: var(--text-primary);
  }

  .post-navigation {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

  .nav-post {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    min-height: 100px;
    box-shadow: var(--card-shadow);
    position: relative;
    overflow: hidden;
  }

  .nav-post::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--accent-purple);
    opacity: 0.9;
    transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .nav-post:hover {
    border-color: var(--accent-purple);
    box-shadow: var(--card-shadow-hover-strong), var(--card-shadow-hover-light);
    transform: translateY(-5px);
  }

  .nav-post:hover::before {
    opacity: 1;
  }

  .prev-post {
    text-align: left;
  }

  .next-post {
    text-align: right;
    grid-column: 2;
  }

  .nav-post:only-child {
    grid-column: 1 / -1;
    max-width: 50%;
  }

  .nav-post:only-child.next-post {
    margin-left: auto;
  }

  .nav-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
  }

  .next-post .nav-label {
    justify-content: flex-end;
  }

  .nav-post:hover .nav-label {
    color: var(--accent-purple-hover);
  }

  .nav-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .nav-post svg {
    transition: transform 0.3s ease;
  }

  .prev-post:hover svg {
    transform: translateX(-3px);
  }

  .next-post:hover svg {
    transform: translateX(3px);
  }

  /* Prose styles - copy from [slug].astro */
  .prose :global(h1),
  .prose :global(h2),
  .prose :global(h3),
  .prose :global(h4),
  .prose :global(h5),
  .prose :global(h6) {
    color: var(--text-primary);
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  .prose :global(h1) { font-size: 2rem; }
  .prose :global(h2) { font-size: 1.75rem; }
  .prose :global(h3) { font-size: 1.5rem; }

  .prose :global(p) {
    margin-bottom: 1.25rem;
    line-height: 1.8;
    color: var(--text-secondary);
  }

  .prose :global(a) {
    color: var(--accent-purple);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;
  }

  .prose :global(a:hover) {
    color: var(--accent-purple-hover);
    border-bottom-color: var(--accent-purple-hover);
  }

  .prose :global(ul),
  .prose :global(ol) {
    margin-bottom: 1.25rem;
    padding-left: 1.75rem;
    color: var(--text-secondary);
  }

  .prose :global(li) { margin-bottom: 0.5rem; }

  .prose :global(strong) {
    color: var(--text-primary);
    font-weight: 600;
  }

  .prose :global(code) {
    background: rgba(255, 255, 255, 0.05);
    color: var(--accent-cyan);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: "Geist Mono", "Courier New", Courier, monospace;
  }

  .prose :global(pre) {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    line-height: 1.6;
    font-family: "Geist Mono", "Courier New", Courier, monospace;
  }

  .prose :global(pre code) {
    background: none;
    padding: 0;
    color: var(--text-primary);
    font-size: 0.875rem;
  }

  .prose :global(blockquote) {
    border-left: 3px solid var(--accent-purple);
    padding-left: 1.5rem;
    margin: 1.5rem 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  .prose :global(img) {
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  .prose :global(hr) {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 2rem 0;
  }

  .prose :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }

  .prose :global(th),
  .prose :global(td) {
    border: 1px solid var(--border-color);
    padding: 0.75rem;
    text-align: left;
  }

  .prose :global(th) {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .app-container { flex-direction: column; }
    .main-content {
      margin-left: 0;
      padding: 1.5rem 1rem;
      padding-bottom: 6rem;
    }
    .post-article { padding: 2rem 1.5rem; }
    .back-link {
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }
    .post-title { font-size: 2rem; }
    .post-description { font-size: 1rem; }
    .post-meta-top { font-size: 0.875rem; }
    .post-navigation {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
    }
    .next-post { grid-column: 1; }
    .nav-post:only-child { max-width: 100%; }
    .nav-post { padding: 1.25rem; }
    .nav-title { font-size: 1rem; }
  }
</style>
```

**Step 3: Create English search page**

```astro
---
// src/pages/en/search.astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import Sidebar from "../../components/Sidebar.astro";
import BottomNav from "../../components/BottomNav.astro";
import { ogImageServiceUrl } from "../../config/constants";
import { getTranslations } from "../../i18n";

const lang = "en";
const t = getTranslations(lang);

const searchUrl = new URL("/en/search", Astro.site || "https://miguelmachado.dev")
  .href;
const searchOgImage = `${ogImageServiceUrl}?title=${encodeURIComponent(t.search.title)}&url=${searchUrl}`;
---

<BaseLayout
  title={t.search.title}
  description={t.search.description}
  ogImage={searchOgImage}
  canonical={searchUrl}
  lang={lang}
>
  <div class="app-container" data-pagefind-ignore="all">
    <Sidebar />

    <main class="main-content">
      <div class="content-wrapper">
        <div class="search-container">
          <h1 class="search-title">{t.search.title}</h1>
          <div id="search"></div>
        </div>
      </div>

      <BottomNav activePage="search" />
    </main>
  </div>

  <link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
  <script is:inline src="/pagefind/pagefind-ui.js"></script>

  <script>
    // @ts-expect-error - Pagefind UI is loaded via script tag
    import { PagefindUI } from "@pagefind/default-ui";

    function initializeSearch() {
      const searchElement = document.querySelector("#search");
      if (!searchElement) return;

      searchElement.innerHTML = "";

      new PagefindUI({
        element: "#search",
        showSubResults: true,
        autofocus: true,
      });

      const el = document.querySelector(".pagefind-ui");
      const input = el?.querySelector<HTMLInputElement>(`input[type="text"]`);
      const clearButton = el?.querySelector(".pagefind-ui__search-clear");

      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const query = params.get("q");

      if (query && input) {
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      input?.addEventListener("input", (e) => {
        const input = e.target as HTMLInputElement;
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        params.set("q", input.value);
        window.history.replaceState({}, "", `${url.pathname}?${params}`);
      });

      clearButton?.addEventListener("click", () => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        params.delete("q");
        window.history.replaceState({}, "", `${url.pathname}`);
      });
    }

    document.addEventListener("DOMContentLoaded", initializeSearch);
    document.addEventListener("astro:page-load", initializeSearch);
  </script>
</BaseLayout>

<style>
  /* Copy all styles from src/pages/search.astro */
  .app-container {
    display: flex;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    padding-bottom: 5rem;
    width: calc(100% - 280px);
    max-width: 100vw;
    box-sizing: border-box;
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .search-container {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    backdrop-filter: blur(10px);
    width: 100%;
    box-sizing: border-box;
  }

  .search-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }

  /* Include all the Pagefind UI styles from search.astro */
  :global(.pagefind-ui) { width: 100% !important; }
  :global(.pagefind-ui__form) { position: relative !important; display: block !important; }
  :global(.pagefind-ui__form:before) { display: none !important; }
  :global(.pagefind-ui__search-input) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    color: var(--text-primary) !important;
    padding: 0.875rem 3.5rem 0.875rem 1rem !important;
    font-size: 1rem !important;
    width: 100% !important;
    transition: all 0.2s ease !important;
  }
  :global(.pagefind-ui__search-input:focus) {
    border-color: var(--accent-purple) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(162, 119, 255, 0.1) !important;
  }
  :global(.pagefind-ui__result) {
    background-color: var(--bg-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    padding: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  :global(.pagefind-ui__result:hover) {
    border-color: var(--accent-purple) !important;
    transform: translateY(-2px) !important;
  }

  @media (max-width: 768px) {
    .app-container { flex-direction: column; overflow-x: hidden; }
    .main-content {
      margin-left: 0;
      padding: 1rem;
      padding-bottom: 6rem;
      width: 100%;
      max-width: 100vw;
    }
    .search-container { padding: 1rem; }
    .search-title { font-size: 1.5rem; margin-bottom: 1.5rem; }
  }
</style>
```

**Step 4: Create English 404 page**

```astro
---
// src/pages/en/404.astro
import BaseLayout from "../../layouts/BaseLayout.astro";
import { getTranslations } from "../../i18n";

const lang = "en";
const t = getTranslations(lang);
---

<BaseLayout
  title={t.notFound.title}
  description={t.notFound.message}
  lang={lang}
>
  <div class="not-found">
    <h1>404</h1>
    <p>{t.notFound.message}</p>
    <a href="/en">{t.notFound.backHome}</a>
  </div>
</BaseLayout>

<style>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 6rem;
    color: var(--accent-purple);
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  a {
    color: var(--accent-purple);
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--accent-purple);
    border-radius: 8px;
    transition: all 0.2s;
  }

  a:hover {
    background: var(--accent-purple);
    color: var(--bg-primary);
  }
</style>
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Build completes (EN pages may be empty until content is added)

**Step 6: Commit**

```bash
git add src/pages/en/
git commit -m "feat(i18n): add English page structure"
```

---

## Task 14: Create Sample English Post for Testing

**Files:**
- Create: `src/content/blog/en/entendendo-closures.md`

**Step 1: Create a sample English post**

Create a simple test post with matching filename to one of your Portuguese posts:

```markdown
---
title: Understanding Closures in JavaScript
description: Learn how closures work in JavaScript with practical examples and use cases
pubDate: 2025-04-07
author: Miguel Machado
mainClass: js
tags: ['javascript', 'concepts']
draft: false
slug: understanding-closures-in-javascript
image: ../../assets/img/entendendo-closures-em-javascript.png
---

# Understanding Closures in JavaScript

Closures are one of the most powerful features in JavaScript...

(This is a test post - translate the full content later)
```

**Step 2: Verify build with both languages**

Run: `npm run build`
Expected: Build shows both PT and EN posts

**Step 3: Commit**

```bash
git add src/content/blog/en/
git commit -m "feat(i18n): add sample English post for testing"
```

---

## Task 15: Update PT 404 Page

**Files:**
- Modify: `src/pages/404.astro`

**Step 1: Read current 404 and update with translations**

Add i18n support to the Portuguese 404 page:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { getTranslations } from "../i18n";

const lang = "pt";
const t = getTranslations(lang);
---

<BaseLayout
  title={t.notFound.title}
  description={t.notFound.message}
  lang={lang}
>
  <div class="not-found">
    <h1>404</h1>
    <p>{t.notFound.message}</p>
    <a href="/">{t.notFound.backHome}</a>
  </div>
</BaseLayout>

<style>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 6rem;
    color: var(--accent-purple);
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }

  a {
    color: var(--accent-purple);
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border: 1px solid var(--accent-purple);
    border-radius: 8px;
    transition: all 0.2s;
  }

  a:hover {
    background: var(--accent-purple);
    color: var(--bg-primary);
  }
</style>
```

**Step 2: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat(i18n): update PT 404 page with translations"
```

---

## Task 16: Final Build Verification

**Step 1: Run full build**

```bash
cd C:\www\miguelmachado.dev.astro\.worktrees\i18n
npm run build
```

Expected output:
- PT pages at root (`/`, `/search`, `/404.html`, `/{slug}.html`)
- EN pages at `/en/` (`/en/index.html`, `/en/search.html`, `/en/404.html`, `/en/{slug}.html`)
- No TypeScript errors
- No build errors

**Step 2: Test locally**

```bash
npm run preview
```

Verify:
- [ ] `/` shows Portuguese home with posts
- [ ] `/en` shows English home
- [ ] Language switcher works in sidebar
- [ ] Language switcher works in bottom nav
- [ ] Blog post pages have correct translations
- [ ] hreflang tags are present in HTML source
- [ ] Date formatting respects locale

**Step 3: Commit final state**

```bash
git add -A
git commit -m "feat(i18n): complete i18n implementation"
```

---

## Summary

This plan implements:
1. **Translation system** - TypeScript-based with type safety
2. **Content collections** - Separate PT/EN collections with matching filenames
3. **Routing** - PT at root, EN at `/en/`
4. **SEO** - hreflang tags, dynamic og:locale, translated URLs
5. **Language switcher** - In sidebar and bottom nav
6. **All pages** - Home, blog posts, search, 404 for both languages

After completing this plan, you'll need to:
1. Translate all remaining Portuguese posts to English
2. Add translated slugs to each post's frontmatter

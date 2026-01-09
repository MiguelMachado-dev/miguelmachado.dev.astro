---
title: How to Generate Sitemap in Next.JS
description: How to generate static and dynamic sitemap in Next.JS with next-sitemap
pubDate: 2021-03-24T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: js
color: "#a29330"
image: ../../../assets/img/sitemap.png
tags: ['tutorial', 'nextjs', 'sitemap']
slug: "generate-sitemap-nextjs"
translationId: "como-gerar-sitemap-no-nextjs"
draft: false
---

## Introduction

Here was the scenario: I needed to generate a sitemap in Next.JS, but I had some links that were completely dynamic. Whenever a new blog post was created, it should update the sitemap.

I started searching for solutions without success - I could only generate a static sitemap and would have to manually add the dynamic paths, which was quite hacky.

### next-sitemap

First, let's install the library. If you only want to use it to generate static pages, install it as a devDependency with `-D`

```bash
yarn add next-sitemap
```

### Creating a Static Sitemap

Now let's create the script. Go to your `package.json` and create the script `"postbuild": "next-sitemap"`. This way, after every build, it will create the sitemap.

Create a `next-sitemap.js` file in your project root.
In it, we'll configure a few things:

```js
module.exports = {
  siteUrl: 'https://yoursite.url',
  generateRobotsTxt: true, // optional
  priority: null,
  changefreq: null,
  exclude: ['/server-sitemap.xml', '/post/*'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://yoursite.url/server-sitemap.xml'],
  },
}
```

The library will also generate your robots.txt. If you don't want this, just set it to `false`. The *priority* and *changefreq* fields are XML fields - in my case, I don't want these two fields.

The `exclude` and `robotsTxtOptions` fields won't be necessary if you only want to generate the static sitemap.
If you have a blog or dynamically created pages, keep reading to see how to populate the sitemap with them!

### Creating a Dynamic Sitemap

Now we'll create a file at `pages/server-sitemap.xml/index.tsx`.

In this file, we'll do the following:

```ts
import { getServerSideSitemap } from 'next-sitemap'
import { GetServerSideProps } from 'next'
import { getAllPosts } from 'services' // Import the API that creates dynamic pages. Method to source urls from CMS

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // I'll get the first 100 posts from my blog
  const allPosts = await getAllPosts({ per_page: 100 })

  // I'll create a fields array, where I get the slug from my response
  // And with the slug I'll dynamically fill each post I have
  const fields = allPosts.data.map(({ slug }) => ({
    loc: `https://yoursite.url/post/${slug}`,
    lastmod: new Date().toISOString(),
    // changefreq
    // priority
  }))

  return getServerSideSitemap(ctx, fields)
}

// Default export to prevent next.js errors
// eslint-disable-next-line @typescript-eslint/no-empty-function
export default () => {}
```

And that's it.
Remember the `next-sitemap.js` file we created earlier?

The fields:
```js
  exclude: ['/server-sitemap.xml', '/post/*'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://yoursite.url/server-sitemap.xml'],
  },
```
`exclude`: I'm excluding from my static sitemap any pages it generates at build time related to posts. This avoids duplicates between my `public/sitemap.xml` generated in `postbuild` and my dynamically generated `server-sitemap.xml`.

Additionally, I add my `server-sitemap.xml` to my `robots.txt`.

When we access `localhost:3000/server-sitemap.xml`, we'll see our dynamic XML.

That's it. We generated our static and dynamic XML in less than 10 minutes!

If this post helped you, share it!

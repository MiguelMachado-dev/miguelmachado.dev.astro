// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content";
// 2. Import loader(s)
import { glob } from "astro/loaders";

// 3. Define your collection(s)
const blog = defineCollection({
  // Load Markdown files in the src/content/blog directory
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  // Define the frontmatter schema using Zod
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string().default("Anonymous"),
    layout: z.string().optional(),
    mainClass: z.string().optional(), // 'main-class' from original blog
    color: z.string().optional(), // hex color for the post category
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { blog };

// src/content.config.ts
import { defineCollection, z } from "astro:content";
import type { SchemaContext } from "astro:content";
import { glob } from "astro/loaders";

const blogSchema = ({ image }: SchemaContext) =>
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

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

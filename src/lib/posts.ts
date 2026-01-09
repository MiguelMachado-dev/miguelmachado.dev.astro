// src/lib/posts.ts
import { getCollection } from "astro:content";
import type { Lang } from "../i18n";

export async function getPublishedPosts(lang: Lang) {
  const collectionName = lang === "en" ? "blogEn" : "blogPt";
  const posts = await getCollection(collectionName, ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostSlug(post: { data: { slug?: string }; id: string }): string {
  // Return custom slug if available, otherwise use id without .md extension
  return post.data.slug || post.id.replace(/\.md$/, "");
}

export function getPostUrl(post: { data: { slug?: string }; id: string }, lang: Lang): string {
  const slug = getPostSlug(post);
  return lang === "en" ? `/en/${slug}` : `/${slug}`;
}

export async function getTranslationSlug(
  currentId: string,
  targetLang: Lang,
  currentTranslationId?: string
): Promise<string | null> {
  const collectionName = targetLang === "en" ? "blogEn" : "blogPt";
  const posts = await getCollection(collectionName);

  // Normalize id by removing .md extension if present
  const normalizedId = currentId.replace(/\.md$/, "");
  const normalizedTranslationId = currentTranslationId?.replace(/\.md$/, "");

  // Find matching translation:
  // For PT -> EN: Look for EN post where EN.translationId matches PT.id
  // For EN -> PT: Look for PT post where PT.id matches EN.translationId
  const translatedPost = posts.find((post) => {
    const postId = post.id.replace(/\.md$/, "");
    const postTranslationId = (post.data as { translationId?: string }).translationId;

    // Match if:
    // 1. Target post's translationId matches our current id (PT -> EN lookup)
    // 2. Target post's id matches our translationId (EN -> PT lookup)
    // 3. Target post's id matches our id (fallback for posts without translationId)
    return postTranslationId === normalizedId ||
           postId === normalizedTranslationId ||
           postId === normalizedId;
  });

  if (translatedPost) {
    // Return the post's id (which is the slug used in URLs)
    return translatedPost.id.replace(/\.md$/, "");
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

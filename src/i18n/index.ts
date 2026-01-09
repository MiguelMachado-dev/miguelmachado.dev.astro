import type { Translations } from "./types";
import { pt } from "./pt";
import { en } from "./en";

export type Lang = "pt" | "en";

export const languages: Record<Lang, string> = {
  pt: "Português",
  en: "English",
};

export const defaultLang: Lang = "pt";

const translations: Record<Lang, Translations> = { pt, en };

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
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
    // Handle empty path (home) to avoid trailing slash
    return cleanPath ? `/en/${cleanPath}` : "/en";
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

export type { Translations };
export { pt, en };

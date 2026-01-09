// @ts-check
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://miguelmachado.dev",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  image: {
    domains: ["github.com"],
    // Enable responsive images globally for all markdown images
    layout: "constrained",
    // Enable responsive styles
    responsiveStyles: true,
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  i18n: {
    locales: ["pt", "en"],
    defaultLocale: "pt",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    pagefind(),
    sitemap({
      filter: (page) => !page.includes("/404"),
      i18n: {
        defaultLocale: "pt",
        locales: {
          pt: "pt-BR",
          en: "en-US",
        },
      },
    }),
  ],
});

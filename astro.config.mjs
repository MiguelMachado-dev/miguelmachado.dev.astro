// @ts-check
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://miguelmachado.dev",
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
});

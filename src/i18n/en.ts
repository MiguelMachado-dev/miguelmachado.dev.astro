import type { Translations } from "./types";

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

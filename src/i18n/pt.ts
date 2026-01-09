import type { Translations } from "./types";

export const pt: Translations = {
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

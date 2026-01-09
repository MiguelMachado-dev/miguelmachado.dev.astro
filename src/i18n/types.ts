export interface Translations {
  meta: {
    locale: string;
    htmlLang: string;
    language: string;
  };
  nav: {
    home: string;
    search: string;
  };
  sidebar: {
    bio: string;
  };
  blog: {
    backToHome: string;
    previousPost: string;
    nextPost: string;
    readingTime: string;
  };
  search: {
    title: string;
    description: string;
  };
  home: {
    title: string;
    description: string;
  };
  notFound: {
    title: string;
    message: string;
    backHome: string;
  };
}

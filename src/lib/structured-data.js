export const SITE_URL = "https://tina-boettger.com";

export const BLOG_ARTICLE_PATH = "/blog/human-first-ai-machine-consciousness";
export const ERASURE_ARTICLE_PATH = "/blog/the-erasure-machine-ai-inherits";

export const BLOG_ARTICLE = {
  title: "Human-First AI and the Question of Machine Consciousness",
  subtitle: "Science, ethics, power, and the politics of seeming alive.",
  date: "May 14, 2026",
  isoDate: "2026-05-14",
  image: "/ai-consciousness-essay-visual.webp",
  excerpt:
    "A human-first look at AI consciousness: why today's systems should not be treated as conscious, why future uncertainty still matters, and how governance can protect people without collapsing into AI personhood.",
  path: BLOG_ARTICLE_PATH,
};

export const ERASURE_ARTICLE = {
  title: "The Erasure Machine: How the Web Forgets, and What AI Inherits",
  subtitle:
    "What gets lost before training begins, and how AI systems inherit the web's structured silences.",
  date: "May 15, 2026",
  isoDate: "2026-05-15",
  image: "/erasure-machine-ai-inherits.webp",
  excerpt:
    "A human-centered AI essay on the web's architecture of forgetting, System Zero, and why AI inherits not only what humanity wrote, but what our platforms allowed to remain visible.",
  path: ERASURE_ARTICLE_PATH,
};

export const BLOG_ARTICLES = [BLOG_ARTICLE, ERASURE_ARTICLE];

export function buildPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}#person`,
    name: "Tina Boettger",
    url: SITE_URL,
    jobTitle: "Human-Centered AI Leader, Speaker, and Computer Scientist",
    description:
      "Tina Boettger is a human-centered AI leader, computer scientist, speaker, and community builder focused on trustworthy AI, public sector AI, and responsible AI leadership.",
    knowsAbout: [
      "Human-centered AI",
      "AI leadership",
      "Trustworthy AI",
      "Ethical AI",
      "Public sector AI",
      "AI community building",
      "Diversity in AI",
    ],
    alumniOf: [
      {
        "@type": "Organization",
        name: "Fraunhofer",
      },
    ],
    worksFor: {
      "@type": "Organization",
      name: "Deutsche Telekom",
    },
    sameAs: ["https://www.linkedin.com/in/tina-boettger"],
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: "Tina Boettger | Human-Centered AI Leader",
    description:
      "Personal website of Tina Boettger, a human-centered AI leader, computer scientist, and speaker focused on trustworthy AI, AI culture, and public sector AI.",
    publisher: {
      "@id": `${SITE_URL}#person`,
    },
  };
}

function standardSchemas() {
  return [buildWebsiteSchema(), buildPersonSchema()];
}

function buildArticleSchema(article) {
  return [
    ...standardSchemas(),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.excerpt,
      datePublished: article.isoDate,
      dateModified: article.isoDate,
      image: `${SITE_URL}${article.image}`,
      url: `${SITE_URL}${article.path}`,
      author: { "@id": `${SITE_URL}#person` },
      publisher: { "@id": `${SITE_URL}#person` },
    },
  ];
}

export function getStructuredData(path) {
  switch (path) {
    case "/":
      return [
        ...standardSchemas(),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: SITE_URL,
          name: "Tina Boettger professional website",
          about: { "@id": `${SITE_URL}#person` },
        },
      ];
    case "/inner-compass":
      return [
        ...standardSchemas(),
        {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Inner Compass",
          url: `${SITE_URL}/inner-compass`,
          description:
            "Interactive reflection tool by Tina Boettger for exploring AI leadership style, work patterns, and environment fit.",
          applicationCategory: "BusinessApplication",
          creator: { "@id": `${SITE_URL}#person` },
        },
      ];
    case "/print-summary":
      return [
        ...standardSchemas(),
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: "Inner Compass Printable Summary",
          url: `${SITE_URL}/print-summary`,
          creator: { "@id": `${SITE_URL}#person` },
        },
      ];
    case "/for-agents":
      return [
        ...standardSchemas(),
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${SITE_URL}/for-agents`,
          name: "Agent-readable professional summary for Tina Boettger",
          about: { "@id": `${SITE_URL}#person` },
        },
      ];
    case BLOG_ARTICLE_PATH:
      return buildArticleSchema(BLOG_ARTICLE);
    case ERASURE_ARTICLE_PATH:
      return buildArticleSchema(ERASURE_ARTICLE);
    case "/blog":
    case "/impressum":
    case "/legal-notice":
    case "/datenschutz":
    case "/privacy":
      return standardSchemas();
    default:
      return undefined;
  }
}

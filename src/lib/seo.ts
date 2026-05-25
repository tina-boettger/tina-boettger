import { useEffect } from "react";
import { SITE_URL } from "./structured-data";

const DEFAULT_OG_IMAGE = `${SITE_URL}/New%20Picture.webp`;
export { SITE_URL, getStructuredData } from "./structured-data";

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export interface PageSeoConfig {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
  jsonLd?: JsonLd;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    element!.setAttribute(key, value);
  });
}

function upsertStructuredData(data?: JsonLd) {
  const selector = 'script[data-seo="route-structured-data"]';
  const existing = document.head.querySelector(selector);

  if (!data) {
    existing?.remove();
    return;
  }

  const script = existing ?? document.createElement("script");
  script.setAttribute("type", "application/ld+json");
  script.setAttribute("data-seo", "route-structured-data");
  script.textContent = JSON.stringify(data);

  if (!existing) {
    document.head.appendChild(script);
  }
}

export function applyPageSeo({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  jsonLd,
}: PageSeoConfig) {
  const canonical = `${SITE_URL}${path}`;

  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
  upsertStructuredData(jsonLd);
}

export function usePageSeo(config: PageSeoConfig) {
  useEffect(() => {
    applyPageSeo(config);
  }, [config]);
}

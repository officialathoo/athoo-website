import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: Record<string, any>;
}

function absoluteUrl(value: string): string {
  if (!value) return "https://www.athoo.pk/opengraph.jpg";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.athoo.pk${value.startsWith("/") ? value : `/${value}`}`;
}

export function SEO({
  title,
  description,
  keywords,
  image = "/opengraph.jpg",
  url,
  type = "website",
  schema,
}: SEOProps) {
  useEffect(() => {
    const pageTitle = title.includes("Athoo") ? title : `${title} | Athoo`;
    const canonicalUrl = absoluteUrl(url || (typeof window !== "undefined" ? window.location.pathname : "/"));
    const imageUrl = absoluteUrl(image);

    document.title = pageTitle;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    updateMeta("description", description);
    updateMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    if (keywords) updateMeta("keywords", keywords);
    updateLink("canonical", canonicalUrl);

    updateMeta("og:title", pageTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:type", type, true);
    updateMeta("og:image", imageUrl, true);
    updateMeta("og:image:secure_url", imageUrl, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:site_name", "Athoo", true);

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", pageTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", imageUrl);

    if (schema) {
      let script = document.querySelector("#seo-schema");
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-schema";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, image, url, type, schema]);

  return null;
}

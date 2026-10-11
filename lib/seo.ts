import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { categories } from "@/lib/catalog";
import { faqItems, faqPlainAnswer } from "@/lib/faq";

/** Absolute URL for a route path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

interface PageMeta {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}

/**
 * Per-page metadata with canonical URL, Open Graph and Twitter card.
 * Titles are set explicitly (full strings) so they match the original site.
 */
export function createMetadata({ title, description, path, keywords }: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ---------------------------------------------------------------------------
   Structured data (JSON-LD)
   ------------------------------------------------------------------------- */

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    areaServed: "ID",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: siteConfig.whatsapp,
      availableLanguage: ["id"],
    },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "id-ID",
  };
}

export function faqSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: faqPlainAnswer(item) },
    })),
  };
}

/** An ItemList of the eight service categories, for the catalog page. */
export function serviceCatalogSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Katalog Layanan Jogatix",
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      description: category.desc,
      url: absoluteUrl(`/layanan?kategori=${category.slug}`),
    })),
  };
}

/** BreadcrumbList for interior pages. */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

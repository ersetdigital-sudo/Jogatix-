"use client";

import { useEffect, useMemo, useState } from "react";
import { categories as staticCategories } from "@/lib/catalog";
import type { CategorySlug, Product, PublicSettings, ServiceCategory } from "@/types";

interface CatalogPayload {
  settings: PublicSettings;
  /** Active products per prepaid category; bill categories carry no products. */
  products: Partial<Record<CategorySlug, Product[]>>;
}

/**
 * Loads the live catalog (products + public settings) from `/api/catalog`.
 *
 * The static catalog renders immediately, so the pages keep working while the
 * request is in flight and if it fails. Once loaded, prepaid categories switch
 * to the products stored in Supabase — that is what makes admin edits (prices,
 * notes, active toggles, deletions) visible on the storefront.
 */
export function useLiveCatalog(): {
  categories: ServiceCategory[];
  settings: PublicSettings | null;
  loading: boolean;
} {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/catalog", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<CatalogPayload>) : null))
      .then((data) => {
        if (data) setPayload(data);
      })
      .catch(() => {
        /* Keep the static catalog when the request fails or is aborted. */
      });

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    if (!payload) return staticCategories;
    return staticCategories.map((category) =>
      category.type === "prabayar"
        ? // An empty array is meaningful here: every product in the category is
          // inactive, so the storefront should show none.
          { ...category, products: payload.products[category.slug] ?? [] }
        : category,
    );
  }, [payload]);

  return { categories, settings: payload?.settings ?? null, loading: !payload };
}

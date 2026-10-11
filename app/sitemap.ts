import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Public routes included in the sitemap (admin console is intentionally excluded). */
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/layanan", priority: 0.9, changeFrequency: "weekly" },
  { path: "/transaksi", priority: 0.6, changeFrequency: "monthly" },
  { path: "/cek-transaksi", priority: 0.7, changeFrequency: "monthly" },
  { path: "/bantuan", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tentang", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

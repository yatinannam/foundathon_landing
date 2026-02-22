import type { MetadataRoute } from "next";

const BASE_URL = process.env.FOUNDATHON_NEXT_PUBLIC_SITE_URL ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/register",
          "/register/*",
          "/team",
          "/team/*",
          "/dashboard",
          "/dashboard/*",
        ],
      },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`],
    host: BASE_URL,
  };
}

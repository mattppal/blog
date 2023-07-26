import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";
import remarkObsidianCallout from "remark-obsidian-callout";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";

import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/what-is-delta": "https://mattpalmer.io/posts/what-is-delta/",
  },
  site: SITE.website,
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap(),
    mdx(),
    image(),
    prefetch(),
  ],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      // Need to config. See: https://github.com/escwxyz/remark-obsidian-callout
      remarkObsidianCallout,
      [
        remarkToc,
        {
          tight: true,
          heading: "ToC",
        },
      ],
      [
        remarkCollapse,
        {
          test: "ToC",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  // build: {
  //     // Example: Generate `page.html` instead of `page/index.html` during build.
  //     format: 'file'
  // }
});

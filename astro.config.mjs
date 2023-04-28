import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
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
  ],
  markdown: {
    remarkPlugins: [
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

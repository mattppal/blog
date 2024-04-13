import { remarkReadingTime } from "./src/utils/remark-reading-time.mjs";
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import mdx from '@astrojs/mdx';
import { SITE } from "./src/config";
import rehypeExternalLinks from 'rehype-external-links'
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [tailwind({
    applyBaseStyles: false
  }), react(), mdx(), sitemap(), partytown({
    // Adds dataLayer.push as a forwarding-event.
    config: {
      forward: ["dataLayer.push"],
    },
  }),],
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkToc, [remarkToc, {
      tight: true,
      heading: "ToC"
    }], [remarkCollapse, {
      test: "ToC"
    }]],
    rehypePlugins: [[rehypeExternalLinks, {target: ["_blank"]}]],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    },
    extendDefaultPlugins: true
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"]
    }
  },
  scopedStyleStrategy: "where"
});
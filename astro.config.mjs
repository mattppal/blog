import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
// import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import partytown from "@astrojs/partytown";
// import astroRemark from '@astrojs/markdown-remark';

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    integrations: [tailwind({
        config: {
            applyBaseStyles: false
        }
    }), partytown({
        // Adds dataLayer.push as a forwarding-event.
        config: {
            forward: ["dataLayer.push"],
        }
    }), react(), sitemap(), mdx()],
    markdown: {
        remarkPlugins: [[remarkToc, {
            tight: true,
            heading: "Contents"
        }],
            // [remarkCollapse, {
            //     test: "Table of contents"
            // }]
        ],
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
    // build: {
    //     // Example: Generate `page.html` instead of `page/index.html` during build.
    //     format: 'file'
    // }

});


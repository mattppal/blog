import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import slugify from "@utils/slugify";
import { SITE } from "@config";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

export async function get() {
  const posts = await getCollection("blog");
  const sortedPosts = await getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data, body }) => ({
      link: `posts/${slugify(data)}`,
      title: sanitizeHtml(data.title),
      description: data.description,
      pubDate: new Date(data.pubDatetime),
      ogImage: data.ogImage,
      customData: `<meta property="og:image" content="${data.ogImage}" />`,
      content: sanitizeHtml(parser.render(body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "style",
          "center",
        ]),
        exclusiveFilter: function (h2) {
          return h2.tag == "h2" && h2.text == "ToC";
        },
      }),
    })),
  });
}

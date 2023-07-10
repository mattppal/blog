import { z } from "astro:content";

export const blogSchema = z
  .object({
    author: z.string(),
    pubDatetime: z.date(),
    title: z.string(),
    postSlug: z.string(),
    featured: z.boolean(),
    draft: z.boolean(),
    tags: z.array(z.string()).default(["others"]),
    ogImage: z.string(),
    description: z.string(),
    emoji: z.string(),
    readingTime: z.string().optional(),
  })
  .strict();

export type BlogFrontmatter = z.infer<typeof blogSchema>;

import { slug as slugger } from "github-slugger";
import type { BlogFrontmatter } from "@content/_schemas";

export const slugifyStr = (str: string) => slugger(str);

// export function dateToString(dt: Date): string {
//     // get the year, month, date sepeartely and append to the string.
//     let date_String: string =
//         dt.getUTCFullYear() +
//         "-" +
//         (dt.getUTCMonth() + 1).toString().padStart(2, "0") +
//         "-" +
//         dt.getUTCDate().toString().padStart(2, "0")
//     return date_String;
// }

const slugify = (post: BlogFrontmatter) =>
    post.postSlug ? slugger(post.postSlug) : slugger(post.title);

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));

export default slugify;

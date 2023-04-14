import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https:/mattpalmer.io",
  author: "Matt Palmer",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "MattPalmer",
  jobTitle: "Data Engineer",
  email: "hello@mattpalmer.io",
  team: "Data",
  company: "Underline Infrastructure",
  location: "Asheville, NC",
  ogImage: "og.jpg",
  googleAnalyticsId: "G-EC2ZQ7Y8TD",
  lightAndDarkMode: true,
  postPerPage: 8,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/mattppal",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/mattppal",
    linkTitle: `${SITE.author} on Instagram`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/matt-palmer",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:hello@mattpalmer.io",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/mattppal",
    linkTitle: `${SITE.author} on Twitter`,
    active: true,
  },
];

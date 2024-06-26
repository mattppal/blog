import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://mattpalmer.io",
  calendar: "https://calendar.app.google/4Aoa3R1HKFPF48rU6",
  linkedin: "https://linkedin.com/in/matt-palmer",
  twitter: "https://x.com/mattppal",
  author: "Matt Palmer",
  desc: "Data, developer productivity, & personal growth",
  title: "matt palmer",
  jobTitle: "developer relations engineer",
  email: "hello@mattpalmer.io",
  team: "DevRel",
  company: "Replit",
  location: "Campbell, CA",
  ogImage: "/mp-og.png",
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
    linkTitle: `${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Instagram",
    href: "https://instagram.com/mattppal",
    linkTitle: `${SITE.author} on Instagram`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: SITE.linkedin,
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/mattppal",
    linkTitle: `${SITE.author} on X`,
    active: true,
  },
  {
    name: "Mail",
    href: `mailto:${SITE.email}`,
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
  {
    name: "Calendly",
    href: SITE.calendar,
    linkTitle: `Chat with Matt!`,
    active: true,
  },
];

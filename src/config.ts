import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://mattpalmer.io",
  calendar: "https://calendar.app.google/mVAr85FzJQqzpVce9",
  linkedin: "https://linkedin.com/in/matt-palmer",
  author: "Matt Palmer",
  desc: "Matt's musings— all things data, writing, & fun.",
  title: "MattPalmer",
  jobTitle: "Developer Success Engineer",
  email: "hello@mattpalmer.io",
  team: "Data",
  company: "Mage",
  location: "San Jose, CA",
  ogImage: "og.jpg",
  googleAnalyticsId: "",
  lightAndDarkMode: false,
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
    linkTitle: `${SITE.author} on Twitter`,
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

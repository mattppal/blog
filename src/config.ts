import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
    website: "https://mattpalmer.io",
    author: "Matt Palmer",
    desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
    title: "MattPalmer",
    email: "hello@mattpalmer.io",
    company: "Underline Infrastructure",
    location: "Asheville, NC",
    ogImage: "astropaper-og.jpg",
    lightAndDarkMode: true,
    postPerPage: 5,
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
        linkTitle: ` ${SITE.title} on Github`,
        active: true,
    },
    {
        name: "Instagram",
        href: "https://instagram.com/mattppal",
        linkTitle: `${SITE.title} on Instagram`,
        active: true,
    },
    {
        name: "LinkedIn",
        href: "https://linkedin.com/in/matt-palmer",
        linkTitle: `${SITE.title} on LinkedIn`,
        active: true,
    },
    {
        name: "Mail",
        href: "mailto:hello@mattpalmer.io",
        linkTitle: `Send an email to ${SITE.title}`,
        active: true,
    },
];

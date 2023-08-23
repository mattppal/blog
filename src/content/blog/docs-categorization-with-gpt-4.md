---
author: Matt Palmer
description: Using the OpenAI API to categorize Mintlify documents using GPT-4
draft: false
featured: true
ogImage: "/posts/level-up-medallion-architecture/og.png"
postSlug: docs-categorization-with-gpt-4
pubDatetime: 2023-09-01 05:00:00
tags: [data, ai, gpt, tutorial]
title: Categorizing Documentation with GPT-4
emoji: 🥇
---

<style>
/* 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
.container {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-top: 56.25%;
}

/* Then style the iframe to fit in the container div with full height and width */
.responsive-iframe {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* img {
    width: 45%;
    height: auto;
    aspect-ratio: attr(width) / attr(height);
} */
</style>

![Header image](/posts/level-up-medallion-architecture/header.png)

## ToC

## DevRel & Docs

I'm about two months into my first DevRel role now and _boy_ have I learned a lot (and made many mistakes), but that's a post for another time.

A huge part of developer relations (and product, generally) is writing documentation. If you have great features, but no one knows about them, do they really exist? 🤔

![](/posts/docs-categorization-with-gpt-4/if-a-tree-falls.gif)

Similarly, if you have _good documentation_, but no one can find it, does it really exist? I bet y'all didn't wake up expecting this meta of a data post, but here we are. These are the exact questions I've been asking myself for the past few weeks.

The second question is particularly of interest since the [documentation](https://web.archive.org/web/20230521044430/https://docs.mage.ai/introduction/overview) I'm trying to improve is particularly dense and there _currently_ isn't a rigorous way to categorize it. As of this moment, there are currently ~200 pages of docs across ~80 folders... Oh boy.

Breaking it down logically, the process looks like:

- Build desired categories
- For each file
  - Skim the contents
  - Assign to a category
  - Refactor docs links (internal links)
  - Create a redirect (external links)
- Get a PR up and deal with MEGA merge conflicts

Sooo pretty much soup-to-nuts that looks:

1. Not fun
2. Very time consuming

So let's see what we can automate. I already have a few tricks up my sleeve for the internal/external links. Pretty sure I'll just have to live with the merge conflicts, but that's not the end of the world.

## My Solution

- Build a script that
  - Reads each doc (up to the limit, ~4000 tokens)
  - Sends the doc to GPT-4 along with context & categories
  - reads the category
  - Writes to a mintlify-structured json file
- But wait....
  - Folder strucutre
  - Redirects
  - Internal links

### Docs Categorization

### Redirects

The framework we use, Mintlify, allows us to specify relative redirects in our config file, `mint.json`

```json
"redirects": [
  {
    "source": "/original/path/to/docs",
    "destination": "/new/path/to/docs"
  }
]
```

Now, you might be thinking "Matt, you just changed hundreds of files in your repo, this is going to be a nightmare." That is exactly what I originally thought, and had me worried all weekend 😂

Luckily, I remembered `git` tracks precisely this sort of thing using. We can use:

```bash
git diff --name-status -C -M60 master matt/refactor-nav > scratch.txt
```

`git diff` will get us changed files, `--name-status` just alters how the diffs are printed, `-C` is short for `--cached`: comparing staged changes with the local repo, and `-M60` sets the threshold for moved files to `60%` (a file is considered "moved" if it has 60% of the original contents). We're piping that out to a file `scratch.txt`:

```
...
M	docs/design/data-pipeline-management.mdx
R100	docs/guides/data-validation.mdx	docs/development/data-validation.mdx
M	docs/development/environment-variables.mdx
R100	docs/production/observability/logging.mdx	docs/development/observability/logging.mdx
R096	docs/production/observability/monitoring.mdx	docs/development/observability/monitoring.mdx
...
```

Nice!

To generate our "sources"/"destinations" keys, we can use some VSCode cursor-foo.

First, we `CMD + F` for a new find and replace. Using the "regex" option, we'll add `R\d+` to match all the rows with R(digits) that indicate moving a file.

Then, (this one is a bit clever) `CMD + SHIFT + L` selects _all the matches_ and `ESC` exits the find/replace dialogue with cursors intact. Then we just copy-line & paste into a new file.

![](/posts/docs-categorization-with-gpt-4/find-replace.gif)

We can do the same thing to jump to the _spaces_ between each change. From there, it's a bit of mutli-cursor edits to obtain json with our source/destination structure. Then we:

- Multicursor select and drop `RXXX`
- Find + replace with `''` for `docs/` and `mdx` (we want relative links)
- Do the same little CMD + F and CMD + SHIFT + L trick with our _space_ characters (between changes)
- Multicursor type `source/destination` and add quotes, brackets, etc.

```json
...
  {
		"source": "guides/data-validation",
		"destination": "development/data-validation"
	},
	{
		"source": "production/observability/logging",
		"destination": "development/observability/logging"
	},
	{
		"source": "production/observability/monitoring",
		"destination": "development/observability/monitoring"
	}
...
```

Voila. We just created ~70 redirects in about 10 minutes. 😎

Honestly, this is something GPT-4 would likely excel at. The only issue is that my input size was greater than the maximum allowable length and I couldn't risk a hallucination or omission.

### Fixing internal links

Okay, we have the external links taken care of but running `mintlify broken-links` (an awesome new feature) tells us we have ~54 broken internal links. 😱

Fortunately, this is why VSCode extensions exist. I found [this one](https://marketplace.visualstudio.com/items?itemName=angelomollame.batch-replacer) that lets us do a bulk find/replace for the contents of any file.

Taking our redirects, we just pop open a new file and do some more cursor-foo to obtain:

```markdown
in "\*_/_.mdx"

replace "guides/data-validation"
with "development/data-validation"

replace "production/observability/logging"
with "development/observability/logging"

replace "production/observability/monitoring"
with "development/observability/monitoring"
...
```

Running the extension bulk replaces links across all `mdx` files in our repo. Broken links terminated.

![](/posts/docs-categorization-with-gpt-4/terminator.gif)

## Challenges

## Results

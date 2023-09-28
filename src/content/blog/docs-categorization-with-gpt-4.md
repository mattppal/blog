---
author: Matt Palmer
description: Breaking down a complex problem, plus some tricks and AI. 🤖
draft: false
featured: true
ogImage: "/posts/docs-categorization-with-gpt-4/og.jpeg"
postSlug: docs-categorization-with-gpt-4
pubDatetime: 2023-09-05 05:00:00
tags: [data, ai, gpt, tutorial]
title: Categorizing Documentation with GPT-4
emoji: 🦾
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
    width: 75%;
    height: auto;
    aspect-ratio: attr(width) / attr(height);
} */
</style>

![](/posts/docs-categorization-with-gpt-4/og.jpeg)

## ToC

## DevRel & Docs

I'm about two months into my first DevRel role now and _boy_ have I learned a lot (and made many mistakes), but that's a post for another time.

A huge part of developer relations and product, generally, is writing documentation. If you have great features, but no one knows about them, do they really exist? 🤔

![](/posts/docs-categorization-with-gpt-4/if-a-tree-falls.gif)

Similarly, if you have _good documentation_, but no one can find it, does it really exist? I bet y'all didn't wake up expecting a post this meta today, but here we are. These are the exact questions I've been asking myself for the past few weeks.

The second question is particularly of interest since the documentation I'm trying to improve is particularly dense and there _currently_ isn't a rigorous way to categorize it. As of this moment, there are currently ~200 pages of docs across ~80 folders... Oh boy.

I've been skimming <i><a target="_blank" href="https://www.amazon.com/Docs-Developers-Engineers-Technical-Writing/dp/1484272161?&_encoding=UTF8&tag=mattpalmer0a-20&linkCode=ur2&linkId=400ac3aab1e14aaf17328d1d3155ff0d&camp=1789&creative=9325">Docs for Developers</a></i> in my free time, which has been immensely helpful for determining what categories docs _should_ have. At a high level, it goes something like:

- 🚀 **Getting started:** entry points to the product. They should be prioritized as ways of getting users _onboard_ as fast as possible.
  - A goal is to keep quick starts to under 10 steps and a **maximum** of one dependency.
- 🙋‍♂️ **Concepts:** help users understand the concepts and ideas behind a product— they describe **how** the product functions to users, e.g. an architecture diagram.
- 🦿 **Procedural:** shows readers how to accomplish a specific goal by following a set of structured steps. A single step should describe a single action that a user takes. The most common are guides/tutorials.
- 📕 **Reference:** the pages users will always fall back to for _how_ to accomplish certain actions— API references are the ideal example.

Alrighty. So I have 200 pages of markdown and a few categories... What next? Breaking it down logically, the process looks like:

1. Take the four categories above and construct sub-categories that approximately align with our product.
2. For each file
   1. Skim the contents
   2. Assign to a category

...

Oh ok that's not so bad. Wait— this docs site _is already live?_

...

3. Refactor links
   1. Create a redirect (external traffic)
   2. Update relative links (internal links)
4. Get a PR up and deal with **MEGA** merge conflicts

Soooo, soup-to-nuts, that looks less-than-fun. But hey, I'm a crafty DevRel/Data Engineer guy, right? I think the biggest lesson I've learned in my career is that: **we can make it fun.**

And if it's fun, it's easy. So there you go, this will be easy!

![](/posts/docs-categorization-with-gpt-4/having-fun.gif)

My goal is to use this as a learning opportunity with the [OpenAI API](https://platform.openai.com/docs/introduction)— we'll feed each doc to GPT-3.5 and see what comes back. Worst case, I'll end up categorizing these manually and still learn a ton!

I already have a few tricks up my sleeve for the internal/external links, I'm pretty sure I'll just have to live with the merge conflicts, but that's not the end of the world.

## What is Mintlify?

<br/>

<img src="/posts/docs-categorization-with-gpt-4/mintlify-logo.svg" />

<br/>

So I'd be remiss if I didn't discuss our docs framework: [Mintlify](https://mintlify.com/).

Mintlify leverages markdown/MDX to deploy a hosted documentation site directly from a GitHub repo. For abstracting away the process of deploying a static site, it's pretty great.

It comes out of the box with some pretty neat features and some new AI functionality— I highly recommend checking it out to deploy docs fast. The team is also super responsive, both in Slack and on the development side. They're adding _awesome_ new features weekly.

Another up-and-coming project I have my eye on is [Starlight](https://starlight.astro.build/), which is built and maintained by the [Astro](https://astro.build/) team. That one requires a bit more configuration, but the development has been pretty rapid thus far.

## The Solution

My approach will be to:

- Build a script that
  - Reads each doc (up to the limit, [~8000 tokens](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them))
  - Sends the doc to GPT-4 along with context about how are docs are structured & my predefined categories.
  - Returns GPT-generated categories: primary, secondary, and tertiary (optional).
  - Writes to a Mintlify-structured `json` file
- THEN deal with
  - Redirects
  - Internal links

### Docs Categorization

#### Look Ma, I'm a Prompt Engineer!

I stole the template for this online somewhere, but here's my attempt at prompt engineering. I expect a salary of [no less than $900k](https://www.wsj.com/articles/artificial-intelligence-jobs-pay-netflix-walmart-230fc3cb) for this masterpiece.

```
You will be provided documentation on a data transformation tool, "Mage". The content supplied is a page in our documentation and a path to that page relative to the current location in a file system. The content is formatted in EITHER "Markdown" or "MDX" format. Please use standard Markdown/MDX syntax in interpreting this content and disregard any frontmatter (content between ---).

You should use the path as a hint as to the category of the page, but be aware that many paths will be incorrect. The content of the document should be used as the primary motivation for the category of the document.

Classify the into a primary category and a secondary category. Additionally, documents may have a tertiary category, but this is optional. Overview pages should never have a tertiary category. If you feel that a secondary or tertiary category should exist with certainty, create one.
Categories are defined in a JSON structure like the following:
{"Primary-1": {"Secondary-1": ["Tertiary-1", "Tertiary-2"], "Secondary-2": ["Tertiary-1", etc.}... etc}.

Please note that "data integrations" are distinctly different from "integrations."
"data integrations" refer to a service similar to Fivetran or Meltano— they move data between a source and target. "Integrations" refer to Mage-specific integrations, i.e. extensions or compatible tools.

Provide your output in `json` format with the keys: current_filepath, primary, secondary, \
and tertiary. For docs lacking a tertiary category, please return an empty string ''
```

If you have any experience with this sort of thing, you likely already see some flaws.

![Foreshadowing](/posts/docs-categorization-with-gpt-4/foreshadowing.gif)

And now for my categories— these generally align with concepts in <i><a target="_blank" href="https://www.amazon.com/Docs-Developers-Engineers-Technical-Writing/dp/1484272161?&_encoding=UTF8&tag=mattpalmer0a-20&linkCode=ur2&linkId=400ac3aab1e14aaf17328d1d3155ff0d&camp=1789&creative=9325">Docs for Developers</a></i>, but I do believe that a rigid adherence is inappropriate for us.

```json
{
  "Docs": {
    "Introduction": ["Setup", "Development"],
    "Configuration": [
      "Storage",
      "Kernels",
      "Variables",
      "Dependencies",
      "Versioning"
    ],
    "Concepts": ["Design", "Abstractions", "Orchestration"],
    "dbt": ["Configuration", "Models", "Commands"],
    "Integrations": [
      "Computation",
      "Orchestration",
      "Transformation",
      "Observability",
      "Reverse ETL"
    ],
    "About": ["Community"],
    ...
  },
  "Guides": { ...},
  "Deploy": { ... },
  "Contribute": { ... },
  "API Reference": { ... }
}
```

#### The Script

Now, the moment we've all been waiting for...

Our core function will get the completion message from a document:

```python
def get_completion_from_doc(doc, model="gpt-4-0613", temperature=0.25, max_tokens=8000):
    return openai.ChatCompletion.create(
        model=model,
        messages=doc,
        temperature=temperature,
        max_tokens=max_tokens,
    )
```

Then we just need to walk the docs and loop through them

```python
cat = []
for d in list(filter(exclude, glob.glob("../git-repos/mage-ai/docs/*/*.md*"))):
    with open(d, "r") as f:
        # remove frontmatter
        metadata, content = frontmatter.parse(f.read())

        messages = [
            # Our system message
            {"role": "system", "content": system_message},
            # Categories
            {"role": "system", "content": json.dumps(categories)},
            # The docs filepath, to be reused later
            {"role": "user", "content": d},
            # The actual docs content
            {"role": "user", "content": content[0 : floor(4000 * 3)]},
        ]

        response = get_completion_from_doc(messages, temperature=0)
        cat.append(json.loads(response.choices[0].message["content"]))
```

Here are a few example responses:

```json
{
  "current_filepath": "../git-repos/mage-ai/docs/design/core-design-principles.mdx",
  "primary": "Docs",
  "secondary": "Concepts",
  "tertiary": "Design"
}
```

and

```json
{
  "current_filepath": "../git-repos/mage-ai/docs/design/core-abstractions.mdx",
  "primary": "Docs",
  "secondary": "Concepts",
  "tertiary": "Design"
}
```

![It's alive!](/posts/docs-categorization-with-gpt-4/its-alive-young-frankenstein.gif)

#### Building JSON

Surprisingly, the hardest part about this was building the correct dictionary structure for the Mintlify navigation file... Maybe I should spend more time on HackerRank. 😅

I'm sure you'll all be able to see how inefficient this Python is, so feel free to put me on blast. We need a nested dictionary with keys `group` and values `pages`, where `pages` is a list of objects that might be _single_ items _or_ other `groups`:

```json
"navigation": [
  {
    "group": "Get Started",
    "pages": [
      "introduction/overview",
      "getting-started/setup",
      ...
    ]
  },
 {
      "group": "Concepts",
      "pages": [
        {
          "group": "Backfills",
          "pages": [...]
        },
        "design/blocks/dynamic-blocks"
 },
  ...
```

So we'll need some type of recursion...

![Kryptonite](/posts/docs-categorization-with-gpt-4/dean-cain-superman.gif)

<center><figcaption>Me, faced with a recursive Python task.</figcaption></center>

After a morning at [Soul Grind](https://www.soulgrindcoffee.com/), I came up with:

```python
def build_mint_json(dictionary):
    output = []
    for key, value in dictionary.items():
        # Get items without a tertiary category
        if isinstance(value, dict):
            t = sum([v for k, v in value.items() if len(k) == 0], [])
        else:
            t = []

        if key != "group" and len(key) > 0:
            new = {"group": key, "pages": t}
            # recurse to build mint.json
            if isinstance(value, dict):
                new["pages"] += build_mint_json(value)

            # append to pages
            elif isinstance(value, list):
                new["pages"] += value
            output.append(new)

    return output
```

To apply that to our responses:

```python
tree = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

for f in cat:
    p = f["primary"]
    s = f["secondary"]
    t = f["tertiary"]
    fp = f["current_filepath"]

    tree[p][s][t].append(fp)

mint = build_mint_json(tree)
```

Ta-da 🪄

```json
[
    {
        "group": "Docs",
        "pages": [
            {
                "group": "Concepts",
                "pages": [
                    "../git-repos/mage-ai/docs/design/core-abstractions.mdx",
                    {
                        "group": "Design",
                        "pages": [
                            ...
                        ]
                    },
                    {
                        "group": "Orchestration",
                        "pages": [
                          ...
                        ]
                    }
                ]
            },
            {
                "group": "Configuration",
                "pages": [
                    {
                        "group": "Variables",
                        "pages": [
                          ...
                        ]
                    }
                ]
            },
           ...
        ]
    }
]
```

You can find the full notebook below:

<script src="https://gist.github.com/mattppal/c8b765c08e54fe50207263af2b01e764.js"></script>

### Redirects

Now you get to see all the gory details of making big changes to an existing project. As an aside, it's pretty wild how tech works: without proper knowledge/architecture, changing a system can be _crazy_ difficult.

Hence, if I were to start new docs from scratch, my biggest priority would be _structure_. The content can be changed with little friction, but its structure and layout will require the biggest lift to alter.

`/rant`

The framework we use, Mintlify, allows us to specify relative redirects in our config file, `mint.json`.

```json
"redirects": [
  {
    "source": "/original/path/to/docs",
    "destination": "/new/path/to/docs"
  }
]
```

Now, you might be thinking "Matt, you just changed hundreds of files in your repo, this is going to be a nightmare." That is exactly what I originally thought, which had me worried all weekend. 😂

Luckily, I remembered `git` tracks precisely this sort of thing using. We can use:

```bash
git diff --name-status -C -M60 master matt/refactor-nav > scratch.txt
```

`git diff` will get us changed files between branches `master` and `matt/refactor-nav`, `--name-status` just alters how the diffs are printed, `-C` is short for `--cached`: comparing staged changes with the local repo, and `-M60` sets the threshold for moved files to `60%` (a file is considered "moved" if it has 60% of the original contents). We're piping that out to a file `scratch.txt`:

```
...
M docs/design/data-pipeline-management.mdx
R100 docs/guides/data-validation.mdx docs/development/data-validation.mdx
M docs/development/environment-variables.mdx
R100 docs/production/observability/logging.mdx docs/development/observability/logging.mdx
R096 docs/production/observability/monitoring.mdx docs/development/observability/monitoring.mdx
...
```

**Note:** Due to wrapping, some changed files appear on a separate line— the format goes `RXXX OLD NEW`

Nice! To generate our "sources"/"destinations" keys, we can use some VSCode cursor-foo.

First, we `CMD + F` for a new find and replace. Using the "regex" option, we'll add `R\d+` to match all the rows with R(digits) that indicate moving a file.

Then, (this one is a bit clever) `CMD + SHIFT + L` selects _all the matches_ and `ESC` exits the find/replace dialogue with cursors intact. Then we just copy-line & paste into a new file.

![Find replace gif](/posts/docs-categorization-with-gpt-4/find-replace.gif)

We can do the same thing to jump to the _spaces_ between each change. From there, it's a bit of mutli-cursor edits to obtain `json` with our source/destination structure. Then we:

- Multi-cursor select and drop `RXXX`
- Find + replace with `''` for `docs/` and `MDX` (we want relative links)
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

### Fixing internal links

Okay, we have the external links taken care of but running `mintlify broken-links` (an [awesome new feature](https://mintlify.com/docs/settings/broken-links)) tells us we have ~54 broken internal links. 😱

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

Running the extension bulk replaces links across all `MDX` files in our repo. Broken links terminated.

![Terminator gif](/posts/docs-categorization-with-gpt-4/terminator.gif)

## Lessons Learned

I presented this as a working solution, but in reality, it's not (I mean, it works _sometimes_ 😅), _but_ I learned a _ton_.

![Alt text](/posts/docs-categorization-with-gpt-4/lying-on-the-internet.png)

Here are some takeaways:

1. Context is _hard_: Take, for example, the idea of "data integration," which refers to tools like FiveTran, Mage, and Airbyte: moving data from one place to another. How is GPT supposed to differentiate that from _third-party_ integrations* for a \_data tool*, i.e. plugins for Mage?
2. Tokenization is a barrier: The GPT-4 API only accepts a max of 8192 tokens. Tokens, prompts, and completions are a pretty obtuse concept. I suspect much of the current knowledge is buried in private repos/code. This would probably be a good topic for a future post. Ideally, I'd need to estimate tokens + completion tokens and truncate input accordingly... but then we lose _context_ and the response becomes less trustworthy. The _only_ library I was able to find for truncating content based on tokens was [this one](https://github.com/simonw/ttok), which appears to have little development activity and is CLI-based. 😦
3. Hallucinations: a combination of 1 + 2, my model would consistently drop a doc in a completely irrelevant topic. It's tough to understand why, but I'd imagine it's because I'm using a very general model on an incredibly specific product. I'd likely have more success with a hyper-specific model, which brings me to my next point.
4. Fine-tuned models: Knowing relatively little at the start of this exercise, I think my biggest takeaway is to start from a [fine-tuned](https://platform.openai.com/docs/guides/fine-tuning) model or perhaps generate [embeddings](https://platform.openai.com/docs/guides/embeddings) from our docs. I'm not above admitting I have little idea what I'm talking about, but this is how I learn. 😂

I think numbers 1,2, and 3 point to 4 as being a potential iteration of this project.

It's so interesting— I was a bit sanguine on the whole ChatGPT thing until I realized potential _solutions_ to problems I experience every day!

Now I'm wondering about solutions to _other_ problems, which I'll keep to myself as potential product ideas— VCs feel free to reach out, I have plenty.

I suppose that's my philosophy on learning, which is pretty similar to my guiding principle for work: **make it fun and interesting and the hard parts become easy.**

As someone who's starting their career in [DevRel](https://www.linkedin.com/in/matt-palmer/) there's a pretty good lesson in that!

Until next time ✌️

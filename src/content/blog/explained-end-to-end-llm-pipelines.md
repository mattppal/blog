---
author: Matt Palmer
description: Breaking down a complex problem, plus some tricks and AI. 🤖
draft: false
featured: true
ogImage: ""
postSlug: docs-categorization-with-gpt-4
pubDatetime: 2024-01-24 05:00:00
tags: [data, ai, gpt, tutorial]
title: End-to-end LLM Pipelines with LangChain & LangSmith
emoji: 🦜🔗
---

**Note:** this post contains some large gifs that may be slow to load or absent in some email clients. Viewing on the web is recommended for the best experience. 😄

### What is LangChain?

So what is LangChain? Well, LangChain is the open-source framework you’ve likely already heard of.

LangChain lets you build apps powered by large language models by **abstracting away** complexities in tools like the OpenAI API (or just the hard, boring stuff about LLM app deployment). It’s a framework for developing **context-aware, reasoning** applications with LLMs.

With LangChain, you can forget about:

> 🙃 Chunking logic
> 
> 🫥 Reading directories of markdown files
> 
> 🫠 Unnesting JSON payloads
> 
> 🫣 Hacking together makeshift data pipelines (just use [LCEL](https://python.langchain.com/docs/expression_language/))!

Now, that’s pretty cool and will save you a bunch of time, but what’s _also_ cool (and many don’t know) is that LangChain offers a complete suite of tools for **discovery** , **deployment** , **** and **observability** for your application. 

That’s where **LangSmith** comes in. ⚒️

### What is LangSmith?

I’ve seen similar patterns in data workflows— practitioners build systems without consideration for scalability or maintainability. The result is messy data and a refactor a few months down the line. 

Tech moves too fast to make the same mistakes twice, so I’m here to do it right the first time. Seeking out a framework for deployment (LangSmith in this case) is a much better use of resources than a DIY approach for small- to mid-sized teams.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7016ce5f-c831-4769-b7c7-5bd20324d9a6_1600x1298.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7016ce5f-c831-4769-b7c7-5bd20324d9a6_1600x1298.png)

You can think of [LangSmith](https://python.langchain.com/docs/langsmith) as the unifying platform for the LangChain Universe. You can use it to discover new workflows, then use LangChain to author the specifics (or start from a [Template](https://python.langchain.com/docs/templates)), deploy them with [LangServe](https://python.langchain.com/docs/langserve), and flip back to LangSmith monitor, test, and iterate on your deployment. 

LangSmith provides a suite of observability tools for monitoring your LLM applications: from evaluating responses through annotations or feedback, to testing changes to your deployments and debugging wonky models.

I’d be remiss if I didn’t mention _just_ how addictive it is to play with prompts in [Hub](https://smith.langchain.com/hub). I think it’s a pretty fun little feature that the LangChain team should invest in.

## An end-to-end workflow

 **Note:** Code can be found [here](https://gist.github.com/mattppal/b347dc4eb16c121e080b83a5ccc5c77a).

The following is an oversimplified example, perhaps to the point of being trivial, but it’s important to note that I’ve _never_ built an LLM application. With LangSmith, LangChain, and LangServe, I figured it out in a few hours. 

I was browsing [Hub](https://smith.langchain.com/hub) to see what it could do and came across an interesting prompt— `muhsinbashir/youtube-transcript-to-article`. If a picture is worth a thousand words, a few gifs and a demo are probably worth… more? 🤔

This prompt is specifically designed to take a YouTube transcript and output a blog post. I do quite a bit of video content, so this seems helpful, especially if I can feed it raw transcript files. A quick test on LangSmith returned pretty interesting results.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0158b4b-f528-4f69-9a62-0b9cc4cbb120_744x480.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0158b4b-f528-4f69-9a62-0b9cc4cbb120_744x480.gif)

Now, I’m a data analyst/engineer at heart, so I usually develop tools like this in Jupyter. Since I’m familiar with LangChain, I can pull the model down from Hub and start building right away. 

Since this is a simple app, it’s pretty straightforward— just load the prompt and create a [chain](https://python.langchain.com/docs/expression_language/) that passes your prompt to our model (ChatGPT in this case).

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff655a6e-7620-4588-abb8-1135d63026f3_744x480.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff655a6e-7620-4588-abb8-1135d63026f3_744x480.gif)

Now this is where things get tricky. 

What if I wanted to share this app with a colleague— maybe the marketing team? Perhaps use Streamlit? Ask ChatGPT for a solution (the irony isn’t lost on us)? Google around for a pre-built app? Ante up and build my own framework?

With Templates & LangServe, we don’t need _any_ of that. Instead, it’s a simple `langchain app new [PATH]`, drop in the [LCEL](https://python.langchain.com/docs/expression_language/) from Jupyther, and a `python app/server.py`. Voila. 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8d0e1d6-e14a-47a3-8530-4836dc518ba4_718x480.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe8d0e1d6-e14a-47a3-8530-4836dc518ba4_718x480.gif)

Now what’s better than a few clicks? That’s right, one click (if you can’t tell, I’m a [one trip](https://condenaststore.com/featured/all-the-groceries-in-one-trip-marathon-farley-katz.html) guy). **** In the future, LangChain will offer _single-click_ deployment for these apps— you can sign up for the waitlist [here](https://airtable.com/app0hN6sd93QcKubv/shrAjst60xXa6quV2.).

Ok, now the final piece… Your code is deployed and it’s being used by millions (or maybe like, three 😂), how do you monitor it? If DevEx is about fast feedback loops and iterating quickly, we need the same for deployed models. 

LangSmith offers a suite of observability tools for monitoring your models, evaluating their responses, storing results, and even annotating/providing feedback.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feffabd5f-8d12-4268-9998-20002d24aedd_744x480.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feffabd5f-8d12-4268-9998-20002d24aedd_744x480.gif)

And there you have it. An end-to-end application in a few simple steps.

## Iterating on AI

Being great at what you do is all about _[how](https://d37ugbyn3rpeym.cloudfront.net/stripe-press/TAODSAE_zine_press.pdf)_[ you build](https://d37ugbyn3rpeym.cloudfront.net/stripe-press/TAODSAE_zine_press.pdf). AI adds an additional dimension: like data engineering, the _quality_ of inputs dictate your outputs. That means we need to manage not only our workflows, but the data they process. 

AI is built on data. Your AI workflows should follow the _same_ level of rigor as your software or data engineering workflows. That means fast and easy _exploration_ , declarative frameworks that abstract away complexity, simple deployment mechanisms, and a way to observe what you built. LangSmith offers all that _and more_ (I guarantee you’ll have fun exploring prompts in Hub).

As practitioners, we need to build systems to process _and observe_ data to be successful in a shifting environment. The LangChain universe introduces a suite of tools to optimize how you build LLM applications _and_ allows you to monitor your workflows to build intuition around the problems you’re trying to solve. 

### Some Caveats

Now, admittedly, [developer sentiment](https://hn.algolia.com/?q=langchain) on LangChain is mixed (at best). I’ve personally found the documentation to be confusing and dense. While there are _a ton of resources_ for getting started, they’re incredibly difficult to navigate and spin up. Once you’ve figured that out, however, the process is pretty seamless. 

Another common complaint is ecosystem lock-in. While LangChain _prevents_ model lock, it instead locks you into **it’s own** ecosystem. Because of the nature of LCEL, you’re either all-in on LangChain or not… There’s no way to _partially_ use the framework to _just_ load documents.

I’ve also heard (and experienced) concerns about the open-source codebase. LangChain is a highly opinionated framework and some of the opinions are… questionable. 

All of my comments/opinions in this demo hold, but LangChain _is not a_ one size fits all solution. I think the real benefit here is the huge open-source community and large base of support. 

If you’re experimenting with frameworks for developing your own LLM apps and abstracting away the hard stuff, I’d advocate giving LangChain a look _in addition_ to the other tools out there! 😄

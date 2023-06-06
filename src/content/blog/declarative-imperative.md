---
author: Matt Palmer
description: How two different approaches can be used in tandem to revolutionize data development.
draft: false
featured: true
ogImage: "header.png"
postSlug: declarative-imperative
pubDatetime: 2023-05-31 8:00:00
tags: [data, meta, opinion]
title: Declarative & Imperative Code for Data Engineering
emoji: ❗️
---

<style>
  img {
    width: auto;
    max-height: 500px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

![](/posts/declarative-imperative/header.png)

## ToC

## 🎞️ Intro

Programming paradigms are a way to classify languages based on common characteristics— some are concerned primarily with execution, while others deal with how code is organized (e.g. object-oriented). An understanding of paradigms can be useful for solution architecture— knowing _how_ code operates is a prerequisite to selecting the most efficient solution.

We can also classify _solutions_ according to the same paradigms. Today, we'll be concerned with two overarching classes of code paradigms and how they relate to data engineering: **imperative** and **declarative** code.

Note that we're not referencing a particular language, rather we're using software engineering terms to understand patterns of data engineering solutions. These terms can be used to describe code, products, or entire architecture.

## 🧐 Understanding declarative & imperative

**Imperative** code tells a machine _precisely_ how to change its state to produce a desired outcome. Think Python scripts, dbt macros, custom DAGs— these are often detailed code that procedurally performs a complex task. As such, they're written from scratch.

**Declarative** code merely describes a result— the calculation of that result is left to some underlying process. For example, to obtain a list of active users, I might run the SQL `SELECT * FROM accounts.active_users`. Note that _how_ we arrived at `accounts.active_users` is unspecified, I'm merely stating the values I'd like returned. Declarative code _abstracts away_ underlying computations. I neither know nor care how `active_users` came to be, only that I can obtain the underlying result.

### 📝 The imperative approach

Many data engineering systems are imperative— [Airflow DAGs begin as an empty canvas](making-the-most-of-airflow/#%EF%B8%8F-dag-structure), dbt projects are a clean slate. This introduces _possibility_ and _flexibility_ to the system.

Imperative code allows data engineers to write custom logic tailored to specific requirements: you might have an Airflow DAG that needs to interface with a very unique data source— so unique that _no_ prebuilt tool exists\_ for the task! **No problem**, as a data engineer with an imperative tool, you whip up some Python to do as you, please!

As I'm sure we're all aware, no two datasets are alike. Hence, data manipulation and processing are inherently bespoke. Imperative tooling, i.e. Python and SQL, allows us to build the most precise solutions possible for manipulating data.

Finally, once we have those cleaned datasets, we need to apply advanced analytics techniques and machine learning logic to derive insight. Imperative code lets us define the exact logic we need for our analysis, regardless of the underlying data.

Sounds great, right? There's a catch... 😬

![](/posts/declarative-imperative/futurama-bender.gif)

Well, actually, there are a few:

1. Imperative code takes _a long time to write_.
2. Purely imperative code _doesn't generalize_.
3. There's a steep learning curve to imperative solutions.

### 🗣️ The declarative approach

Declarative solutions are attractive because they're typically more concise and easier to work with. Declarative code abstracts away implementation details and allows users to focus on defining the desired results.

This can be a huge win when these tools work. Perhaps the most salient form of declarative programming in data engineering is ingestion tooling: we simply say "I want my Intercom data in Snowflake" and... voila! Fivetran makes it happen. _The reason_ ingestion benefitted so starkly from declaration? There are a predefined set of inputs and outputs: sources and targets. By _reusing common components_ and being intelligent about architecture, Fivetran was able to serve a declarative solution to an age-old problem.

The downside? What happens when Fivetran doesn't have the connector you need?

![](/posts/declarative-imperative/oh-no-monkey.gif)

While Airbyte [claims](https://airbyte.com/blog/data-orchestration-trends#declarative-pipelines-are-taking-over-imperative-pipelines) declarative pipelines are on the rise, purely declarative tools are an _incomplete solution at best_ without an accompanying API or imperative component. I've spoken about [my qualms with Airbyte](/posts/hot-takes#-hot-takes), so I will refrain from doing so here.

_BUT_

This is what makes a tool like Meltano so powerful. In addition to the _declarative_ aspect, you can also _easily build your own taps_. This Swiss army knife-like functionality combines the declarative and imperative to solve _most_ problems quickly, while still allowing you to handle edge cases elegantly (using best practices).

This is the pattern we'll focus on for the rest of the article, the hybrid declarative/imperative tool.

## 🚗 Declarative or imperative? An analogy

> TODO: Does this make sense within the context of this article?

If you've ever heard Enzo Ferrari speak about his cars, you might have confused his [effervescence](https://www.youtube.com/watch?v=Sk1-7llcR20) for that of a passionate lover, and with good reason— his drive and legacy for manufacturing live on to this day.

Each Ferrari is custom made, from start to finish— this begets quality, but also scarcity. [Around 10,000](https://www.continentalautosports.com/ferrari-information/how-many-cars-does-ferrari-make-a-year/) are produced per year, with prices ranging from $200,000-400,000 USD: they're _inaccessible_ to all but a fortunate few. Furthermore, while a Ferrari might be beautiful and _really_ good at one thing (going fast), they aren't exactly known for their utility, fuel efficiency, or carrying capacity.

Ferraris are like imperative tools: custom, expensive, and _really_ good at what they were designed for, but not much else!

Toyota, by contrast, has a very different business model. They [pioneered a system](https://global.toyota/en/company/vision-and-philosophy/production-system/) centered around reducing waste and utilizing an assembly line process in the production of their cars. Over the years, they've focused on procuring the most cost-effective components, reusing them in their vehicles, and delivering vehicles that, for the most part, are durable and suitable for many use cases.

Toyota sold [536,740 cars in 2022](https://www.prnewswire.com/news-releases/toyota-motor-north-america-reports-year-end-2022-us-sales-results-301713474.html), with several models under $30k (it's wild that this is a low price for a car these days, but talk to Jay Powell, not me). Despite their affordability, Toyota has become [renowned for its quality and durability](https://www.thestreet.com/automotive/most-least-reliable-cars-and-car-brands-according-to-consumer-reports#gid=ci02b0e590400025f0&pid=25-lexus-brand-lexus).

While you _can't_ buy a Toyota that goes zero-to-sixty in under 3 seconds, 95% of us could have our needs met by a car in their line-up. I think you can see where I'm going here... This is the declarative equivalent.

### The problem with tooling today

Declarative and imperative solutions are just that: solutions— ways of solving problems. If you're attempting to drive data at scale in your organization, you should consider a solution _suited_ to scale and longevity. By contrast, if you need a high-powered, bleeding-edge product for an _essential_ problem, there may be considerable costs and zero extensibility in that tool.

Today, **there is no middle ground in data engineering products.** Practitioners either begin with tools like Airflow and dbt, with hefty implementation costs, steep learning curves, and _OH_ so much wasted energy (have you ever built a dbt project from scratch?) or overly-declarative GUI tools— Matillion, Informatica, Wherescape (if I have to click something more than 3 times, I'm out).

This is all about to change, however. The next wave of great data engineering tools will be _both_ declarative _and_ imperative and existing tools will adapt... or die. The _ideal_ data engineering tool combines the declarative and imperative— it handles the common remarkably well, but also allows for robust solutions at the edge.

## 🔄 Synergy

### Analytics engineers know what's up

SQL is a great example of a language where imperative and declarative patterns can be used to construct high-level transformations. Many analytics engineers are familiar with the following pattern:

1. Store the result of common transformations in tables.
2. Use common tables as inputs to queries.
3. Leverage CTEs as the "building blocks" of calculations.

So why hasn't SQL _tooling_ adopted this framework? dbt lacks a robust framework for DRY code. Coalesce is pioneering this approach, but their product is closed source and targeted primarily at the Snowflake-enterprise market. Even in analytics, the idea of a "query library" is not a solved problem. SQL is written, stashed, and lost more than _any_ company will admit. Worse, there's no community marketplace to go find common SQL tidbits.

What we NEED is a transformation tool that allows users to share _patterns_ and _nodes_. And not just SQL! Orchestration & data engineering, too! One that democratizes data transformation in the most meaningful way possible: by making common transformations available in a marketplace-like setting.

A prime example? GitHub Actions.

GitHub Actions _revolutionized\_\_ CI/CD. I say this, because I can remember a time when I knew absolutely nothing about CI/CD. While some may claim that's still true, I have been able to build some \_pretty awesome_ stuff with Actions. 😂

The innovation? Open-source the jobs step. Anyone can build a runtime job and create an action in the market place. This means that, for almost every step of my actions, I'm grabbing pre-built code off-the-shelf and plugging it in. Do I need to know how to get a list of all the changed files in my repo on merge? [Nope](https://github.com/marketplace/actions/changed-files). Do I need to spend hours figuring out how to deploy to kubernetes? [Nope](https://github.com/marketplace/actions/deploy-to-kubernetes-cluster).

The **only** things I need to know are:

1. What I want my tool to accomplish.
2. What actions are available.
3. (Maybe) how to build a custom solution if I'm doing something obscure.

Thanks to Google (and LLMs 🤖), #2 is pretty easy. So really, _all_ I need to understand is the solution and edge cases... That's insanely powerful.

Could you imagine if the same thing were true for data orchestration? Transformation? Analysis? The technical barrier to entry would be effectively reduced to zero.

## Additional considerations

### Shared resources

Perhaps this is idealist, but could you IMAGINE if everyone shared their dbt models and DAGs? I'm willing to bet a solution _has been found_ for most problems!

### 🐘 The elephant in the room (AI)

- As A.I. improves, more "building blocks" of code will be automated.
- This shifts skill from being able to construct low-level solutions to accurately describing an objective _and the most efficient way to complete that objective._
- A.I. tooling should focus on solving imperative problems and allowing users to use declarative language to architect larger solutions.
- Non-determinism

## 🎬 Conclusion

- Recap the advantages of both declarative and imperative approaches in data engineering.
- Highlight the symbiotic relationship between the two, enabling collaboration and knowledge sharing within data teams.
- Encourage data engineers to embrace the power of both paradigms and foster a culture of feedback and innovation.
- Express the potential for advancements in the modern data stack through iterative improvements in both declarative and imperative methodologies.

## Scratch

### Thoughts

- What's the current state of paradigms in data-eng tooling?

  - Most code patterns are _currently_ imperative. Data engineering is a new industry, but many problems are _solved problems_.
  - We're behind in shifting to _declarative_ interfaces.
    - Why are we building solutions from scratch in 2023?
    - We need flexible tooling that can be both _declarative_ and _imperative_.

- Highlight the need for both approaches in a data team:
  - Different users have varying skill sets and preferences for expressing their intent.
    - Imperative code offers flexibility and empowers users to solve specific problems.
    - Declarative code enables rapid development, scalability, and ease of maintenance.
  - Many problems are solved problems (declarative).
  - Hard problems require custom solutions (imperative).
- Emphasize the importance of feedback between the two approaches:
  - Solutions developed imperatively can be transformed into declarative interfaces.
    - Helps democratize complex solutions, making them accessible to a wider range of users.
    - Declarative interfaces serve as building blocks for reusable components and higher-level abstractions.

### Resources

- <https://www.educative.io/blog/declarative-vs-imperative-programming>
- <https://dev.to/ruizb/declarative-vs-imperative-4a7l>
- Query Languages for Data, Designing Data Intensive Applications p. 42

### Examples

1. Data pipelines: Tools like AstroSDK can be used to create the building blocks of common transformations, making code more DRY. Coalesce.io is a good example, as are Airflow libs.
2. Common data-eng problem: taking a purely imperative approach from a building-block tool: e.g. configuring dbt Core from scratch, building DAGs from scratch, etc. Instead, a declarative approach can save resources.

---
author: Matt Palmer
description: How programming paradigms can revolutionize data engineering.
draft: false
featured: false
ogImage: "../../assets/posts/declarative-imperative/header.png"
postSlug: declarative-imperative
pubDatetime: 2023-07-05 8:39:00
tags: [data, meta, opinion, collaboration]
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

![Header image](../../assets/posts/declarative-imperative/header.png)

## ToC

## 🎞️ Intro

Programming paradigms classify languages based on common characteristics— some deal with execution, while others focus on how code is organized (e.g. object-oriented). An understanding of paradigms is useful for solution architecture— knowing _how_ code works is a prerequisite to selecting an efficient solution.

We can classify _solutions_ according to the same paradigms. Today, we'll be concerned with two classes of code paradigms and how they relate to data engineering: **imperative** and **declarative** code.

💡 Note that we're not referencing a particular language, rather we're using software engineering terms to understand patterns of data engineering solutions. These terms can be used to describe code, products, or entire architecture.

## 🧐 Understanding declarative & imperative

**Imperative** code tells a machine _precisely_ how to produce a desired outcome. Think Python scripts, dbt macros, custom DAGs— detailed code that procedurally performs a complex task. They're often written from scratch and bespoke.

**Declarative** code merely describes a result— the calculation is left to some underlying process. To obtain a list of active users, I might run the SQL `SELECT * FROM accounts.active_users`. How we arrived at `accounts.active_users` is unspecified, I'm merely stating the values I'd like returned. Declarative code abstracts away underlying computations. I neither know nor care how `active_users` came to be, only that I can obtain the calculation.

### 📝 The imperative approach

Many data engineering systems are imperative— [Airflow DAGs begin as an empty canvas](making-the-most-of-airflow/#%EF%B8%8F-dag-structure), dbt projects are a clean slate. This introduces _possibility_ and _flexibility_ to the system.

Imperative code allows data engineers to write custom logic tailored to specific requirements: you might have an Airflow DAG that needs to interface with a unique data source... so unique that _no_ prebuilt tool exists for the task! **No problem**, as a data engineer with an imperative tool, you whip up some Python!

As I'm sure we're all aware, no two datasets are alike. Hence, there is no one-size-fits-all solution to data processing. Imperative tooling, i.e. Python and SQL, allows us to build the most precise pipelines possible.

Once we have cleaned datasets, we need to apply analytics and ML logic to derive insight. Imperative code lets us define the exact logic we need for our analysis, regardless of the underlying data.

Sounds great, right? There's a catch...

![Gif of Bender from Futurama... He's frustrated about "the catch."](../../assets/posts/declarative-imperative/futurama-bender.gif)

Well, there are a few:

- Imperative code takes _a long time to write_.
- Purely imperative code _doesn't generalize_.
- There's a steep learning curve to imperative solutions.

These facts are often overlooked in open-source, imperative tools. There is a cost to implement _any_ tool, regardless of its price. Building a data stack from scratch can wind up being more costly than purchasing one off-the-shelf. Labor is _hella_ expensive these days.

By definition, imperative solutions don't generalize, i.e. they're difficult to reuse. This brings us further from DRY (don't repeat yourself) principles and means that you might be spending days/weeks writing very similar bits of code.

Lastly, the steep learning curve means that imperative tools impose a technological barrier to contribution. Need to make a small change to that dbt model? If you need to know bash, Git, SQL, and Python, it's likely you (a) are on the data team or (b) need to ping someone on the data team. This creates a bottleneck to development.

### 🗣️ The declarative approach

On the other hand, declarative solutions are attractive because they're typically more concise and have a gradual learning curve. Declarative code abstracts away implementation details and allows users to focus on defining the desired results: you only need to understand what you need, _not_ how to get it.

This can be a huge win. Perhaps the most salient declarative solution in data engineering is ingestion. Sitting high atop our data thrones, we bequeath: "I want my Intercom data in Snowflake" and... voila! Fivetran makes it happen.

Ingestion is a perfect problem space for declarative solutions. There are a predefined set of inputs and outputs: sources and targets. By _reusing common components_ and being intelligent about architecture, Fivetran was able to serve a declarative solution to an age-old problem.

The downside? What happens when Fivetran doesn't have the connector you need?

![Oh no monkey meme](../../assets/posts/declarative-imperative/oh-no-monkey.gif)

<center><figcaption>A data engineer realizes they need a custom code for data ingestion.</figcaption></center>

Furthermore, because declarative solutions abstract away implementation details, they can be harder to debug and maintain— it's not always apparent _why_ something breaks. Without access to the underlying code, it can be impossible to triage the issue. For Fivetran, while you _do_ have vendor support, you'd better be willing to fork over the 💰🤑.

In my experience, even vendor support isn't the _most_ helpful for obscure pipelines... Though I'm not a [die-hard Fivetran fan](https://benn.substack.com/p/how-fivetran-fails), it is a solution that _works well enough_.

## 🚗 Declarative or imperative? An analogy

If you've ever heard Enzo Ferrari speak about his cars, you might have confused his [effervescence](https://www.youtube.com/watch?v=Sk1-7llcR20) for that of a passionate lover, and with good reason— his drive and legacy for manufacturing live on today.

Each Ferrari is custom made, from start to finish— this begets quality, but also scarcity. [Around 10,000](https://www.continentalautosports.com/ferrari-information/how-many-cars-does-ferrari-make-a-year/) are produced per year, with prices ranging from $200,000-400,000 USD: they're _inaccessible_ to all but a fortunate few. Furthermore, while a Ferrari might be beautiful and _really_ good at one thing (going fast), they aren't exactly known for their utility, fuel efficiency, or carrying capacity.

Ferraris are like imperative tools: custom, expensive, and great at what they were designed for, but not much else!

By contrast, Toyota has a very different business model. They [pioneered a system](https://global.toyota/en/company/vision-and-philosophy/production-system/) for reducing waste, improving efficiency, and mitigating errors swiftly. Over the years, they've focused on procuring the most cost-effective components and delivering vehicles that are durable and suitable for many use cases.

Toyota sold [536,740 cars in 2022](https://www.prnewswire.com/news-releases/toyota-motor-north-america-reports-year-end-2022-us-sales-results-301713474.html) with several models under $30k (it's wild that this is a low price for a car these days, but talk to Jay Powell, not me). Despite this affordability, Toyota has become [renowned for its quality and durability](https://www.thestreet.com/automotive/most-least-reliable-cars-and-car-brands-according-to-consumer-reports#gid=ci02b0e590400025f0&pid=25-lexus-brand-lexus).

While you _can't_ buy a Toyota that goes zero to sixty in under 3 seconds, their cars would be suitable for 95% of us. I think you can see where I'm going here... This is the declarative equivalent.

### The problem with tooling today

We can think of solutions like Ferraris or Toyotas. Do I need an expensive, custom solution to solve my bleeding-edge problem? Or am I after the durable, extensible solution that doesn't break the bank? There is no right answer, but it's important to understand which path you're headed down.

**Today, there is no middle ground in data engineering products.**

Tools like Airflow and dbt come with hefty implementation costs, steep learning curves, and _OH_ so much wasted energy (have you ever built a dbt project from scratch?)

By contrast, overly-declarative GUI tools, i.e. Matillion, Informatica, Wherescape, are tough to debug, mandate hacky workarounds, and have UIs reminiscent of the [Vista rendition of Microsoft Minesweeper](https://en.wikipedia.org/wiki/Microsoft_Minesweeper#Windows_Vista_and_Windows_7). The development experience is eerily similar, too.

![A screenshot of Microsoft Minesweeper for Windows Vista](../../assets/posts/declarative-imperative/minesweeper.png)

<center><figcaption>Screenshot: pipeline development on legacy GUI tooling (2023).</figcaption></center>

If I have to click something more than 3 times to accomplish a task, I'm out.

However, I believe this is about to change. The next wave of great data engineering tools will be _both_ declarative and imperative. Existing tools will adapt... or die. The _ideal_ tool combines both paradigms— it handles the common remarkably well, but also allows for robust solutions at the edge.

## 🔄 Synergy

Leveraging declarative and imperative components, tools like [Meltano](https://meltano.com/), [Mage](https://www.mage.ai/), and even [Airflow](https://airflow.apache.org/) (with some third-party integrations) can be incredibly powerful.

Take Meltano as an example: in addition to its [declarative "marketplace,"](https://hub.meltano.com/extractors/) you can also build sources and targets. Functionally fungible, Meltano taps combine paradigms powerfully.

This is the pattern we'll focus on for the rest of the article: the hybrid declarative/imperative tool.

### Analytics engineers are paradigm ninjas

SQL is a great example of a language where imperative and declarative patterns are **already** used to construct high-level transformations. Many analytics engineers are familiar with the following pattern:

1. Store common transformations in tables.
2. Use common tables as inputs to queries.
3. Leverage CTEs as the "building blocks" of calculations.
4. Chain CTEs, tables, and aggregates to construct a query.

One area where AE's fall short, in my experience, is recycling ♻️ at the _query_ level. "Query libraries" remain an unsolved problem. SQL is written, stashed, and lost more than _any_ company will admit. Worse, there's no marketplace to go find common SQL tidbits.

Surprisingly, the imperative/declarative framework and query libraries are absent from most SQL tooling. I find this odd since many seem [enamored](https://www.getdbt.com/product/semantic-layer/) with the semantic layer, which one could argue is tangential to developing transformation at scale.

To be fair, [Coalesce](https://www.coalesce.io) is pioneering a hybrid approach (they call it Data Architecture as a Service, or [DAaaS](https://www.eckerson.com/articles/data-architecture-as-a-service-liberation-for-data-users) for short), but their product is targeted at the Snowflake enterprise market.

### Shared Resources

What we need is a transformation tool that allows users to share _patterns_. Not just for data transformation, orchestration & data engineering, too! One that democratizes data transformation in the most meaningful way possible: by making common code available in a marketplace-like setting.

A prime example? **GitHub Actions.**

GitHub Actions _revolutionized_ CI/CD. I say this because I can remember a time when I knew absolutely nothing about CI/CD. While some claim that's still true, I have been able to build some _pretty awesome_ (self-proclaimed) stuff with Actions. 😂

The innovation? GitHub open-sourced the CI/CD "job." Anyone can create one in the [marketplace](https://github.com/marketplace?type=actions). Now, to create a pipeline, I'm defining my problem, grabbing pre-built code, and plugging it in. Do I need to know how to get a list of changed files on merge? [Nope](https://github.com/marketplace/actions/changed-files). Do I need to spend hours deploying to Kubernetes? [Nope](https://github.com/marketplace/actions/deploy-to-kubernetes-cluster).

All I need to know is:

1. What I want to accomplish.
2. What Actions are available.
3. (Possibly) how to build a custom component if I'm doing something obscure.

Thanks to Google, #2 is pretty easy. So really, _all_ I need to understand is the solution and edge cases... That's insanely powerful.

Could you imagine if the same thing were true for data orchestration? Transformation? Analysis? The technical barrier to entry would be effectively zero.

How many times have you written the same code _someone else wrote last month_? What if we could capture 10% of those solutions and open-source them? 30%? 75%? That would revolutionize data transformation.

![Simpsons utopia gif.](../../assets/posts/declarative-imperative/utopia.gif)

## 🧐 Examples

Unfortunately, my idealistic ramblings aren't building more efficient pipelines, so here are some ways you can combine the declarative and imperative to make efficient use of programming patterns.

See that! I'll never let you leave empty-handed.

### Declarative plugins for imperative tools

Airflow is a great example of a purely imperative tool that has some publicly available declarative components. Take, for example, [DAG factory](https://github.com/ajbosco/dag-factory), which allows users to generate DAGs from YAML. A similar package, [Gusty](https://github.com/pipeline-tools/gusty), goes a step further, allowing the user to explicitly reference [declarative dependencies](https://github.com/pipeline-tools/gusty#easy-dependencies). The [AstroSDK](https://github.com/astronomer/astro-sdk) also provides a suite of tools for ETL jobs that _drastically_ simplify and democratize the development process. Other frameworks, like [Metaflow](https://metaflow.org/) or [ZenML](https://zenml.io/home), exist for ML-specific workloads. Providers like Databricks even have custom [TaskGroups](https://github.com/astronomer/astro-provider-databricks).

I have [mixed feelings about Airflow](https://mattpalmer.io../../assets/posts/making-the-most-of-airflow/), but I do feel this is a valid solution for many data teams, _especially_ those with existing deployments.

For dbt, leveraging macros is _essential_ for introducing declarative solutions. Unfortunately, I still find that this does not solve the problem of duplicated SQL. There is a _huge_ opportunity for a hybrid SQL transformation tool, but it's a big problem to solve. Please correct me if I'm wrong, but declarative frameworks in dbt must _currently_ be custom-built.

📝 A note: [Datacoves](https://datacoves.com/) is trying to bring best practices to open-source tools. If you have a proclivity to solutions like dbt, Airflow, etc. I'd take a look at their offering.

⚠️ A caution: homegrown declarative frameworks can be notoriously difficult to maintain. While they can bring all the benefits we highlighted, they might also introduce bottlenecks if, say, the framework is built and maintained by one person. What happens if they decide to leave the company? Without proper documentation and ease of use, this can introduce huge liability, overhead, and tech debt.

### Hybrid tools

While they're in short supply, new data transformation tools are being built from the ground up to support declarative/imperative patterns natively. Here are a few examples:

<figure>
  <center><img src="../../assets/posts/declarative-imperative/mage.png"/></center>
</figure>

[Mage](https://www.mage.ai/): the core functionality of Mage caters to the idea of pattern reuse. Each "step" in a pipeline exists as a "block." End-to-end pipelines are constructed by chaining blocks to produce the desired output. Blocks can load, transform, and export data— they're not just limited to SQL. Mage supports dbt models, streaming frameworks, and a host of other features.

It's not difficult to see how intelligent architecture could effectively democratize engineering and eliminate bottlenecks in analytics. Furthermore, the GUI is lightyears ahead of most other tools. It's this combination of imperative blocks with a declarative implementation (and GUI) that's extremely powerful.

<figure>
  <center><img src="../../assets/posts/declarative-imperative/coalesce-c.png"/></center>
</figure>

[Coalesce](https://coalesce.io/): as I mentioned earlier, Coalesce is very intriguing. Combining column-level lineage with Data Architecture as a Service (DAaaS), Coalesce allows architects to define SQL patterns (like an SCD Type-2 table) that can be subsequently implemented by _anyone_, even less-technical users, via a GUI. The tool is currently positioned as an enterprise solution and only works on Snowflake, but I think they'll be a player to watch. I highly recommend giving them a look if you're on Snowflake and looking for a SQL transformation solution.

🚨 **Disclaimer**: I'm currently employed by Mage and I've done work with Coalesce, but I'd like to emphasize this _is not_ a sponsored post. I truly believe in these tools— they embody the paradigms we've discussed up to this point!

## 🎬 Conclusion

Declarative and imperative patterns both have their place in data engineering. Unfortunately, most tools in the Modern Data Stack are declarative _or_ imperative, resulting in fragmented implementations and the need for far too many tools.

A hybrid approach leverages the best qualities of both solutions and nicely complements collaborative implementations. Architects can "build" imperative solutions, which can then be implemented with declarative language. This promotes knowledge sharing while eliminating bottlenecks.

We're at a crossroads in data tooling. The MDS giants of the future will leverage _both_ declarative and imperative patterns, with code and GUIs, to create tooling that not only democratizes data transformation but \_open-sources\_\_ common code via an Actions-like marketplace. Some innovative teams are already building the start of these solutions.

Until then, I advocate leveraging declarative frameworks atop imperative tools (e.g. AstroSDK) or seeking out solutions that have flexibility built-in, like Meltano or Mage.

Data/analytics engineering is currently limited by a lack of solution-sharing. We need a tool that enables us to share solutions and a place to do so. Until then, we'll be confined to only what _our teams_ can accomplish rather than building on the work of engineers before us.

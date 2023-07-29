---
author: Matt Palmer
description: What's a medallion architecture? What are its advantages? Where does it fall short? How can you use it to become a data superstar? 🤩
draft: false
featured: true
ogImage: "/posts/level-up-medallion-architecture/og.png"
postSlug: level-up-medallion-architecture
pubDatetime: 2023-08-01 05:00:00
tags: [data, tutorial, medallion, opinion, dataengineeringwiki]
title: Level-up with a Medallion Architecture
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

img {
    width: 45%;
    height: auto;
    aspect-ratio: attr(width) / attr(height);
}
</style>

✏️ This post is adapted from a contribution I made to [dataengineering.wiki](https://dataengineering.wiki/Concepts/Medallion+Architecture) 💜. I highly recommend you check out their site & community!

<style>
  img {
    width: auto;
    max-height: 400px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

![Header image](/posts/level-up-medallion-architecture/header.png)

## ToC

## 🏃‍♂️ Going for Gold

In the theme of my [last article](/posts/what-is-delta), we're continuing with Databricks-inspired buzzwords. I like this one, because it lets me make liberal use of medal and track emojis. 🤷‍♂️

A medallion architecture is a data design pattern used to logically organize data in a lakehouse, to incrementally improve the quality of data as it flows through data quality "layers".

This architecture consists of three distinct layers – bronze (raw), silver (validated), and gold (enriched) – each representing progressively higher levels of quality. Medallion architectures are sometimes referred to as "multi-hop" architectures.

![Medallion Architecture](/posts/level-up-medallion-architecture/architecture.png)

Medallion architectures came about as lakehouse and lakehouse storage formats (e.g. Delta, Iceberg, Hudi) became more widely adopted. That is when Spark and PySpark started to overtake older frameworks for distributed processing.

If you have a background in data warehousing— this probably sounds familiar! dbt currently [recommends](https://docs.getdbt.com/guides/best-practices/how-we-structure/1-guide-overview) a

<p style="text-align: center;">
staging ➡️ intermediate ➡️ marts
</p>

process for cleaning data. The convention isn't so important, I've also seen:

<p style="text-align: center;">
raw ➡️ stg ➡️ curated,<br>
clean ➡️ views,
</p>

plus a bunch of other terms like `protected` and `reporting`, but the idea is the same: create simple data "layers" that represent stages in the transformation process and delineate data cleanliness.

## 🚉 Medallion Stages

### 🥉 Bronze

The bronze stage serves as the initial point for data ingestion and storage. Data is saved without processing or transformation. This might be saving logs from an application to a distributed file system or streaming events from Kafka.

### 🥈 Silver

The silver layer is where tables are cleaned, filtered, or transformed into a more usable format. Note that the transformations here should be light modifications, not aggregations or enrichments. From our first example, those logs might be parsed slightly to extract useful information— like unnesting structs or eliminating abbreviations. Our events might be standardized to coalesce naming conventions or split a single stream into multiple tables.

### 🥇 Gold

Finally, in the gold stage, data is refined to meet specific business and analytics requirements. This might mean aggregating data to a certain grain, like daily/hourly, or enriching data with information from external sources. After the gold stage, data should be ready for consumption by downstream teams, like analytics, data science, or ML ops.

## 🧐 Why Layers?

The layer concept is _not_ new in data warehousing. It's funny in a sense, though we've seen an explosion of new data tech, many concepts have remained the same. I remember a video that an (excellent) analytics manager showed me in 2018. If you're expecting irrelevant, out-of-date concepts, brace yourself:

<div class="container">
<p style="text-align: center;">
<iframe class="responsive-iframe" src="https://www.youtube.com/embed/D5hpjlYHEGw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</p>
</div>

It's a bit on the longer side, but if you shuffle through, you'll find Tom O'Neill of Periscope Data (🪦 [RIP](https://techcrunch.com/2019/05/14/sisense-acquires-periscope-data-to-build-integrated-data-science-and-analytics-solution/)) is going over _fundamental_ data warehousing ideas, many of which are still _extremely_ relevant.

![Youtube snippet](/posts/level-up-medallion-architecture/periscope.png)

Now, don't get me wrong— I'm not saying medallion architecture = data warehousing, or anything of the sort, really.

I'm simply emphasizing that medallion architecture is just a common pattern in data storage that's been around for a while. Maybe even [before dbt recommended it](https://discourse.getdbt.com/t/how-we-used-to-structure-our-dbt-projects/355)... It has different uses in a data lake, but for the analysts out there, you can think of this as your data engineer's version of your "protective views" 😉

This one just has a fancy name. See, there's a method behind the madness.

![Forest running](/posts/level-up-medallion-architecture/run-forest-run.gif)

## 🤓 Why Medallion?

Medallion is similar to our data warehouse analogy, with some key differences. So, what does Medallion do well?

### 🔄 Upstream changes

With a layered architecture, we can eliminate _most_ of the headaches from upstream schema changes. What usually happens when an upstream source changes?

<img src='/posts/level-up-medallion-architecture/sponge-fire.png'>

Clever engineers and analysts have taken note!

With multiple layers of storage, we have a single breakpoint to remedy changes. Column name changed from `createdAt` to `created_at`? No big deal!

We'll just rename `createdAt` ➡️ `created_at` in our silver layer. A simple and incredibly effective solution, this is one of those concepts that's a no-brainer.

### 🚤 Lakehouse benefits

The real benefit of the medallion design comes from its pairing with a lakehouse storage format, though that's not a prerequisite. These formats record changes in a "transaction log" and thus have the ability to "time travel" for some retention period.

By staging raw data and processing it in three separate layers, then leveraging the ACID guarantees and time travel functionality of lakehouse storage, it's possible to achieve a system where data is versioned and incrementally stored— a boon for disaster recovery, audits, and overall understanding of a data pipeline.

Just think about that— for whatever your Delta/Iceberg/Hudi retention policy is, you can _replay_ your entire data lake/warehouse and rebuild all downstream sources. 🤯

## 🙈 What Medallion Isn't

We've talked about what Medallion is and who it's for, but here are some downsides and problems Medallion _doesn't_ solve.

- **Does not replace dimensional modeling techniques**: schemas and tables within each layer must still be modeled. Medallion architecture provides a framework for data cleaning and storage. You can't throw away your copy of _The Data Warehouse Toolkit_ and adopt a Medallion Architecture.
- **Uses large amounts of storage**: though, as many have proclaimed, "storage is cheap," a medallion architecture effectively triples the amount of storage in a data lake. For that reason, it might not be practical for data teams with intensive storage demands. Hey, it's 2023, interest rates [are nearing 6%](https://web.archive.org/web/20230728034854/https://www.newyorkfed.org/markets/reference-rates/effr). We can't all be dropping stacks on cloud services anymore. 🤑
- **Often requires additional downstream processing**: If data engineers are maintaining the medallion architecture, there needs to be a place for analysts/analytics engineers to build business-focused transformations that power BI. Some teams might prefer those processes remain separate, rather than having analysts develop in the gold layer. As such, a medallion architecture is not a drop-in replacement for existing data transformation solutions. (You likely still need a warehouse)
- **Implies a data lakehouse architecture**: The medallion architecture is built on the premise of a data lakehouse. If a lakehouse is impractical for your team, this architecture might not make sense. Medallion architectures _can_ be used effectively in hybrid data lake/warehouse implementations.

## 📽️ Recap

A medallion architecture is a data engineer's version of warehouse storage layers. It pairs quite nicely with lakehouse formats— like a fine wine. It can help to keep your data tidy and organized. It even comes with some great disaster recovery benefits. No, it's not going to replace your data warehouse and no, you can't forget everything you know about dimensional modelling. You _can_ however have greater confidence in your data engineering pipelines and data storage _and_ use more Forest Gump gifs in your documentation/presentations.

![I felt like it](/posts/level-up-medallion-architecture/keep-running.gif)

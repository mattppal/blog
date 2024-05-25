---
author: Matt Palmer
description: Is the data warehouse dead? Or is the only thing dead the horse being beaten?
draft: false
featured: false
ogImage: ""
postSlug: data-explained-olap-oltp
pubDatetime: 2023-11-06 00:00:00
tags: [data, opinion]
title: "Data Explained: OLAP vs. OLTP"
emoji: 🤓
---
# 🏭 What’s a Warehouse?

The universe of data jargon is pretty large— today, we have data warehouses, lakes, and lakehouses. While I simply want to hike to [Delta Lake](https://www.alltrails.com/trail/us/wyoming/delta-lake-via-lupine-meadows-access), it’s now a storage technology, too.

Data warehouses are the OG of data jargon— coined by the IBM Systems Journal in 1988, a data warehouse is described as “a system used for the analysis and reporting of structured and semi-structured data.” 

We’ll go even simpler than that— it’s just a relational database. Good, at least that part was easy.

# 📦 Storage Wars

The biggest choice in data might just be database selection. If you’re starting a data team, whether to use a cloud-native data warehouse (BigQuery, Snowflake) or a cloud-hosted traditional database (Postgres, MySQL) will occupy a large portion of your time.

These are more commonly referred to as OLAP (Online Analytical Processing) and OLTP (Online Transactional Processing) databases, respectively. We’ll talk about why you might choose one or the other and the future of data warehousing.

# 🐘 Why OLTP?

OLTP systems are engineered to handle transactional data originating from multiple users. This usually takes the form of a row-oriented database. Many traditional database systems are OLTP: Postgres, MySQL, etc. 

If you currently work at a company and you hear engineers talk about a “prod” database (or you work on the prod database 😅), it’s likely an OLTP store. Why? Because OLTP is _great_ for inserting and retrieving transactional data (one row at a time). 

To insert a transaction, you need to write an _entire row._ This is perfect, since OLTP systems operate by row. Data is written and retrieved _one row at a time_. Historically, databases were used to power production systems, so they were designed to effectively write and retrieve one thing at a time, really well. Cool, right?

# ❄️ Why OLAP?

As data became big, this started to present a problem. What happens when you need to query 1 million rows? 10 million rows? Since we just talked about how row oriented databases work, let’s assume you want to sum revenue by month over a table with 10 million rows. Since OLTP sources read data one row at a time, you’ll have to process _every_ column of _every_ row in the table. Not good. 😬

Furthermore, traditional OLTP databases require configuration. You’ll have to understand horizontal vs. vertical scaling, provisioning, and a whole bunch of DevOps stuff. That’s not a bad thing per se, but it’s not data. It’s DevOps. So now, as a data engineer, you’ll have to go through a DevOps team, which can be a huge bottleneck, _or_ learn DevOps, which isn’t part of your competitive advantage (Hint: it’s data).

From this need, we saw the rise of “serverless” OLAP systems. These systems, think BigQuery, Snowflake, and Redshift (ew) allow for elastic scale in both storage and transactional volume. That means they can scale up to process a demanding query, then return to baseline once executed. Running low on space? You can add more storage with a single click. They’re highly optimized for **analytic workloads**.

What do we mean by “analytic workloads?” Well, tasks that are common in analytics: aggregating data, joining data, etc. These correspond to `GROUP BY`, `JOIN`, and `WINDOW` in SQL. 

By definition, analytic workloads are _not evenly distributed_. You might have a complex query that takes 10 minutes to run, then 5 hours of downtime, then another complex query and an ETL pipeline— serverless makes sense to scale up/down according to uneven loads throughout the day (and hopefully no load at night).

Now let’s look back at our revenue query. Before, we were doing something like this:

[![Row-oriented](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae6c5bc0-fa3a-45b3-8ee6-ec65d20d155b_630x258.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae6c5bc0-fa3a-45b3-8ee6-ec65d20d155b_630x258.gif)Source: [Clickhouse](https://clickhouse.com/docs/en/concepts/why-clickhouse-is-so-fast)

No bueno. But now, we’re reading one column at a time— so that ten million row aggregation? You only need to scan two columns, date and revenue. In a table with 10 columns, that’s 20% of the original data! Now it looks something like:

[![Column-oriented](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91eabf52-aa30-41f3-9cb1-da5ed8072751_630x258.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91eabf52-aa30-41f3-9cb1-da5ed8072751_630x258.gif)Source: [Clickhouse](https://clickhouse.com/docs/en/concepts/why-clickhouse-is-so-fast)

So now we’re crazy efficient… _and_ our systems can automatically scale. That’s the power of serverless OLAP systems. 🤯 

OLAP systems are most commonly used by analytics and data science teams for their speed, stability, and low maintenance cost. To summarize:

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd87552f-44ef-44e9-9ddd-6fae503126d3_1733x955.png)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffd87552f-44ef-44e9-9ddd-6fae503126d3_1733x955.png)

# 🔮 The Future of Data

So, there are a lot of folks out there saying “data warehouses are dead,” but most of them have products that are built entirely on data lakes and competitors with data warehousing solutions.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff5243d8-3c9b-402c-8414-ae1ee4153045_400x203.gif)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fff5243d8-3c9b-402c-8414-ae1ee4153045_400x203.gif)“Data warehouses are dead. Oh and we sell data lakehouses as a service.”

Now, don’t get me wrong, data lakes are pretty cool, but _most_ data teams still need a data warehouse. More than the architecture, they provide _massive_ amounts of computing power with a SQL interface that _anyone_ can understand. That means analysts and analytics engineers can write SQL workflows that parallelize and process relatively large amounts of data, with virtually zero upkeep.

Once ubiquitous, tech like Spark and Hadoop is now reserved for the largest data teams— Facebook, Netflix, etc. So, unless you’re working with petabyte-scale data, data warehouses are still very much useful.

But data is a fast moving space and the future is bright. Tools like [DuckDB](https://mattpalmer.io/posts/whats-the-hype-duckdb/) and metadata management like [Delta](https://mattpalmer.io/posts/what-is-delta/), Hudi, and Iceberg are paving the way for systems that can read Parquet directly into a relational system _or_ create virtualized databases that can leverage in-memory, relational operations.

[![A duck sits peacefully on a stream in a picturesque cartoon meadow.](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcde3dbd8-3bdd-46eb-8ca0-397af8c83d25_1456x832.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcde3dbd8-3bdd-46eb-8ca0-397af8c83d25_1456x832.jpeg)If we’re going to do data puns, they might as well be ducking good.

Personally, I’m excited for the day we can have “virtual” (in quotes because, well, everything is virtual now) data warehouses that sit atop Parquet files and act nearly identically to current warehousing solutions. I welcome our new Duck overlords. 🦆 I think we’re far from that point, but until then, a boy can dream. 💭
---
author: Matt Palmer
description: A Delta intro— what it is, how it works, and what's new in Delta 3.0.
draft: true
featured: true
ogImage: "/posts/what-is-delta/og.gif"
postSlug: what-is-delta
pubDatetime: 2023-07-10
tags: [data, tutorial, delta, opinion]
title: What on Earth is Delta Lake?
emoji: 🌎
---

<style>
  img {
    width: auto;
    max-height: 400px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

![Header image](/posts/what-is-delta/header-2.png)

<center><figcaption>Have you seen a post about Delta Lake <i>without</i> a serene lake image? This one is courtesy of Midjourney. 😂😎</figcaption></center>

## ToC

## 🎞️ Intro

"Delta Lake" sounds more like a [fun weekend hike](https://www.alltrails.com/trail/us/wyoming/delta-lake-via-lupine-meadows-access) than a part of the modern data stack. I've made [my case before](https://www.linkedin.com/posts/matt-palmer_delta-lake-via-lupine-meadows-access-activity-7067143615147380737-2JaF) and I fully expect a data retreat to the Tetons in 2024 (yes, Databricks, I have room for a sponsorship).

Of course, Delta Lake is primarily an open-source storage framework. It's designed to enable a [lakehouse architecture](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf) with compute engines like Spark, PrestoDB, Flink, Trino, and Hive. It has APIs for Scala, Java, Rust, Ruby, & Python. Storage frameworks like Delta have played a major role in lakehouse architectures, but I've found the technology behind them unapproachable. What is it? Git for data? (no) How does it work? Why should I use this instead of pure Parquet?

As always, we’ll break this down to basics and give you a comprehensive picture of what Delta Lake is and how you can get started.

So...

## 🚤 What is Delta Lake?

While Delta is an open-source framework, it’s important to note that it also underpins Databricks’ platform. That means Databricks uses Delta Lake for storing tables and other data. It should be no surprise they’re responsible for most work on the library and its APIs.

Notably, as we’ll discuss in a follow-up post, Iceberg is a very similar format and powers _Snowflake’s_ data storage... If you know about the ongoing feud between Databricks and Snowflake you can probably guess where this is headed. In typical fashion, we now have folks proclaiming "[Iceberg won this](https://bitsondatadev.substack.com/p/iceberg-won-the-table-format-war)" or "Delta won that." In reality, they're storage formats. _Extremely_ similar storage formats... but what does that mean?

If you peruse the Databricks/Delta docs, you’ll probably find something like this:

![This is a lakehouse, not delta](/posts/what-is-delta/delta-example.png)

<center><figcaption>This is a lakehouse, not Delta Lake. 🤨</figcaption></center>

I don't find this particularly helpful for understanding Delta Lake. For some reason, the majority of their docs describe a lakehouse framework, not the underlying technology. A _lakehouse_ is a fancy buzzword, [also created by Databricks](https://www.databricks.com/glossary/data-lakehouse), used to describe a solution combining data lakes and data warehouses, i.e. leveraging cloud storage with semi-structured data formats _and_ traditional OLAP solutions.

![This is also a lakehouse](/posts/what-is-delta/lakehouse-arch.png)

<center><figcaption>This is also a lakehouse.</figcaption></center>

The very simple truth is that Delta files are just Parquet files with a metadata layer on top. That’s it. Not to understate the ingenuity and usefulness of Delta, but it’s a pretty simple concept.

![Actually Delta Lake](/posts/what-is-delta/delta-metadata.png)

<center><figcaption>Ok, now THIS is Delta.</figcaption></center>

Now, if you have a bit of background with these technologies, you might remark “Hey, so is Iceberg” or “Huh, that sounds like Hudi” and you’d be right. Those formats are pretty much the same thing. They even use very similar marketing materials.

![Not Hudi](/posts/what-is-delta/hudi-example.png)

<center><figcaption>Not Hudi, also a lakehouse. 🤦‍♂️</figcaption></center>

The _key_ benefits of these formats are almost entirely obtained from those metadata layers— ACID guarantees, scalability, time travel (‼️), unified batch/streaming, DML ops, and audit histories, to name a few.

Now, this sounds like a whole lot, but remember this all comes from the metadata layer, so it can't be too complicated (or can it?)

I'll give a brief overview of key features, then dive into maybe the most important characteristic, the transaction log.

## 🔑 Key Features of Delta

### ACID Guarantees

Ok, this term gets thrown around a lot without much explanation. Databricks [has a nice writeup](https://docs.databricks.com/lakehouse/acid.html#what-are-acid-guarantees-on-databricks) on these, but for posterity, ACID stands for:

- **Atomicity**: all transactions succeed or fail completely (no partial writes, for example). This is handled primarily by the transaction log.
- **Consistency**: How data is _observed_ during simultaneous operations. Delta uses something called "optimistic concurrency control" to handle consistency— we'll discuss this in a future post. For now, we'll only note that it sounds nicer than _pessimistic_ concurrency control.
- **Isolation**: simultaneous operations are handled without conflict. Again, this depends largely on optimistic concurrency control.
- **Durability**: committed changes are _permanent_. Delta simply relies on cloud object storage for this guarantee: "Because transactions either succeed or fail completely and the transaction log lives alongside data files in cloud object storage, tables on Databricks inherit the durability guarantees of the cloud object storage on which they’re stored."

### Scalable Metadata

### Time Travel

### Unified Streaming

### DML

### Audit Histories

## 📜 The Transaction Log

Here’s the part where I save you from reading a [15,000-word technical document](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)! See, this is why 7 readers can't be wrong— we're just delivering value, nonstop. 🚀

So if Delta files are parquet + the transaction log, we know the transaction log must be pretty special… otherwise, we’d just have parquet files. While I do love parquet files, I’m not sure they would warrant as much hype.

![Drake Parquet Meme](/posts/what-is-delta/drake-parquet.png)

<center><figcaption>👋 <a href='https://parquet.apache.org/'>Apache</a>, I'm open to sponsorships.</figcaption></center>

The transaction log works by breaking down transactions into atomic commits, the atomicity in ACID. So, whenever you perform an operation that modifies a table, Delta Lake breaks it down into one of the following discrete steps:

- Add a file
- Remove a file
- Update metadata
- Set transaction
- Change protocol
- Commit info

In that sense, it’s sort of like Git, but not really. There isn’t the ability to branch, rollback, merge, or do actual Git stuff. You just get the versioning. If you’re looking for a true “git for data lakes” consider Delta + [lakeFS](https://lakefs.io/), which promises just that.

Some of you might be saying “That’s great, but how is Delta storing all of that transaction data? That could get pretty cumbersome!”

That’s a valid concern! Delta creates a `_delta_log` subdirectory within every Delta Lake table. As changes are made, each commit is recorded in a JSON file, starting with 0 and incrementing up.

Delta will automatically generate checkpoint files for good read performance on every 10th commit, e.g. `0000010.json`.

Checkpoint files save the entire state of the table at a point in time, in native Parquet. While this does incur some additional storage, storage is cheap! For many, this is well worth it.

Let's take a look (in real-time)!

## ⏰ Demo time

I recommend opening this in fullscreen to see the text and what's happening! [Here's](https://gist.github.com/mattppal/033b1081f82d028ac92f36121299531e) the full code from the demo, if you'd like to try it at home. 😀

<div style="position: relative; padding-bottom: 41.86046511627907%; height: 0;"><iframe src="https://www.loom.com/embed/f2809a2e459f45ceabd0c5dfbffe3d37?sid=9e41b24e-c929-46f9-a0e8-9544c1446564" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

So yeah! The transaction log is always watching... These discrete records allow you to [time-travel](https://delta.io/blog/2023-02-01-delta-lake-time-travel/) between versions of your data, drastically simplifying disaster recovery.

![I'm watching you...](/posts/what-is-delta/wazowski.gif)

<center><figcaption>You can think of your Delta Table as Mike Wozowski and the Transaction Log like The Librarian from Monsters, Inc.</figcaption></center>

## 🥋 UniForm

Up to this point, we've only discussed the fundamentals of Delta, but the team has been _really_ innovating lately— at the Databricks Data+AI Summit a few weeks ago, Delta 3.0 [was announced](https://www.databricks.com/blog/announcing-delta-lake-30-new-universal-format-and-liquid-clustering).

There are three headline features of the release, but we'll focus on numero uno: Delta Universal Format (UniForm). With UniForm, ANY tool that can read Iceberg or Hudi… can also read Delta Lake.

> With UniForm, customers can choose Delta with confidence, knowing that by choosing Delta, they’ll have broad support from any tool that supports lakehouse formats.

The functionality is pretty impressive. _Since_ all three formats are Parquet-based and solely differentiated by their metadata, UniForm provides the framework for translating metadata between formats. Have an Iceberg table? It's now effectively a Delta table (with some [limitations](https://docs.databricks.com/delta/uniform.html#limitations)).

![Uniform in Delta 3.0](/posts/what-is-delta/uniform.png)

Perhaps more impressive is that UniForm _improves read performance_ for Iceberg. So not only does UniForm consolidate formats and unify infrastructure— it can result in performance enhancements for non-native formats, too!

![Uniform read performance](/posts/what-is-delta/uniform-read.png)

This is some 4D chess-type stuff from Databricks. It's a way for them to say "Hey, we're unifying the data space," while continuing to build market share and keep their formats in production. It's a clever one, for sure. We saw the same theme at the Data+AI Summit, where a major focus was on providing services that were universally accessible (marketplace, apps, etc).

This parallels Snowflake's announcement of managed [Iceberg Catalog support](https://www.snowflake.com/blog/iceberg-tables-catalog-support-available-now/). My hunch is that Databricks saw the writing on the wall and wanted to avoid a situation where using Iceberg = using Snowflake.

WAIT! We don't talk about things without explaining them first here, so what's a catalog? Let's hear it straight from Snowflake:

> A key benefit of open table formats, such as Apache Iceberg, is the ability to use multiple compute engines over a single copy of the data. What enables multiple, concurrent writers to run ACID transactions is a catalog. A catalog tracks tables and abstracts physical file paths in queries, making it easier to interact with tables. A catalog serves as an option to ensure all readers have the same view, and to make it cleaner to manage the underlying files.

That's a great description! If you thought, "Huh, I wonder if Databricks has a competing service," you'd be [💯 percent correct.](https://www.databricks.com/product/unity-catalog). Unity Catalog is a _much_ more complex topic, so we'll save that discussion for another post, but you can [read more here](https://docs.databricks.com/data-governance/unity-catalog/index.html).

While I'm largely [against the Databricks/Snowflake beef](/posts/data-ai-23-rated/#-beef-with-snowflake), it's awesome to see competition producing something _good_ for the community— interoperability is undoubtedly a good thing. Improving performance _across_ formats benefits everyone. I applaud them on their decision and work— I think it's insanely cool.

## Conclusion

That's pretty much it! Delta's a great example of powerful technology: simple at its core, but insanely functional in practice.

With Delta 3.0, the team continues to innovate and takes a major step towards the unification of lakehouse storage frameworks.

Yes, the term lakehouse is annoying and _every_ presentation makes a joke about it, but it's here to stay so I might as well use it. At the very least, we, as a data community, need to come up with better puns! 😂

In a future post, we might dig into some more advanced features of Delta like Liquid clustering (and `ZORDER` by relation) and Optimistic Concurrency Control. As I just mentioned, Unity Catalog is another complex subject that needs thorough dissection.

If you have a topic you'd like to see here, [drop me a note](/about/#contact)!

---
author: Matt Palmer
description: An intro to Delta Lake— what it is, how it works, and where it sits in the MDS.
draft: false
featured: true
ogImage: "/posts/what-is-delta/og.gif"
postSlug: what-is-delta
pubDatetime: 2023-07-06 8:39:00
tags: [data, meta, opinion, collaboration]
title: What on Earth is Delta Lake?
emoji: 🌎
---

<style>
  img {
    width: auto;
    max-height: 500px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

![](/posts/what-is-delta/header-2.png)

Welcome back for another discussion on tech in the Modern Data Stack. To those in the U.S., I hope your Independence Day was great. For the rest of you, my Independence Day was great, so you can take solace in that. Anywho, six readers can't be wrong— we've got it all. Let's dig in.

## ToC

## 🎞️ Intro

If you’re like me, Delta Lake probably evokes dreams of a visit to the [Tetons](https://www.alltrails.com/trail/us/wyoming/delta-lake-via-lupine-meadows-access). I've actually made [my case before](https://www.linkedin.com/posts/matt-palmer_delta-lake-via-lupine-meadows-access-activity-7067143615147380737-2JaF?utm_source=share&utm_medium=member_desktop), and I fully expect a data retreat to Delta Lake in 2024 (yes, Databricks, I have room for a sponsorship).

In my opinion, the entire Databricks lakehouse/data lake pun game is overplayed. Just about every talk/video/website now contains some corny joke about how everyone wants to paddle on a data lake, go to a lakehouse, drain a data swamp, etc. Hopefully, we can do better in our comedic efforts as a community.

Of course, Delta Lake is also an open-source storage framework. It is designed to enable a [lakehouse architecture](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf) with compute engines like Spark, PrestoDB, Flink, Trino, Hive. It has APIs for Scala, Java, Rust, Ruby, & Python.

As always, we’ll break this down to basics and give you a comprehensive picture of what Delta Lake is and how you can get started.

So...

## 🚤 What is Delta Lake?

While Delta is an open-source framework, it’s important to note that it also underpins Databricks’ platform. That means Databricks uses Delta Lake for storing tables and other data. It should be no surprise that they’re also responsible for quite a bit of the work on the library and its APIs.

Notably, as we’ll discuss later in a follow-up post, Iceberg is a very similar format and powers Snowflake’s data storage… If you know about the ongoing feud between Databricks and Snowflake you can probably guess where this is headed. In typical fashion, we now have folks proclaiming "[Iceberg won this](https://bitsondatadev.substack.com/p/iceberg-won-the-table-format-war)" or "Delta won that." In reality, they're storage formats. _Extremely_ similar storage formats... but what does that mean?

If you peruse the Databricks/Delta docs, you’ll probably find something like this:

![Alt text](/posts/what-is-delta/delta-example.png)

This isn’t particularly helpful for understanding what’s going on. For some reason, the majority of their docs describe a lakehouse framework, not the technology itself.

The very simple truth is that Delta files are just Parquet files with a metadata layer on top. That’s it. Not to understate the ingenuity and usefulness of Delta, but it’s a pretty simple concept.

![Alt text](/posts/what-is-delta/delta-metadata.png)

Now, if you have a bit of background with these technologies, you might remark “Hey, so is Iceberg” or “Huh, that sounds like Hudi” and you’d be right. Those formats are pretty much the same thing. They even use very similar marketing materials.

![Alt text](/posts/what-is-delta/hudi-example.png)

## The Transaction Log

Here’s the part where I save you from reading a [15,000-word technical document](https://github.com/delta-io/delta/blob/master/PROTOCOL.md)!

So if Delta files are parquet + the transaction log, we know the transaction log must be pretty special… otherwise, we’d just have parquet files. While I do love parquet files, I’m not sure they would warrant as much hype.

The transaction log works by breaking down transactions into atomic commits, the atomicity in ACID. So, whenever you perform an operation that modifies a table, Delta Lake breaks it down into discrete steps, composed of one or more of the following:

- Add a file
- Remove a file
- Update metadata
- Set transaction
- Change protocol
- Commit info

In that sense, it’s sort of like git, but not really. There isn’t the ability to branch, rollback, merge, or do actual git stuff. You just get the versioning. If you’re looking for a true “git for data lakes” consider Delta + [lakeFS](https://lakefs.io/), which promises just that.

Some of you might be saying “That’s great, but how is Delta storing all of that transaction data? That could get pretty cumbersome!”

That’s a valid concern! Delta creates a `_delta_log` subdirectory within every Delta Lake table. As changes are made, each commit is recorded in a JSON file, starting with 0 and incrementing up.

Delta will automatically generate checkpoint files for good read performance on every 10th commit, e.g. `0000010.json`.

Checkpoint files save the entire state of the table at a point in time, in native Parquet.

Let's take a look at this in real time!

## Stop, demo time 😎

I recommend opening this in fullscreen to see the text and what's happening! [Here's](https://gist.github.com/mattppal/033b1081f82d028ac92f36121299531e) the full code from the demo, if you'd like to try it at home. 😀

<div style="position: relative; padding-bottom: 41.86046511627907%; height: 0;"><iframe src="https://www.loom.com/embed/f2809a2e459f45ceabd0c5dfbffe3d37?sid=9e41b24e-c929-46f9-a0e8-9544c1446564" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe></div>

## 🥋 UniForm

Even better, with Delta 3.0, ANY tool that can read Iceberg or Hudi… can also read Delta Lake— this is some 4D chess-type stuff from Databricks.

> With UniForm, customers can choose Delta with confidence, knowing that by choosing Delta, they’ll have broad support from any tool that supports lakehouse formats.

This is likely a way for Databricks to say "Hey, we're unifying the data space," while continuing to grasp for market share (albeit a clever one). Nonetheless, interoperability is undoubtedly a _good_ thing. I applaud them on their decision and work— I think it's insanely cool.

## Optimistic Concurrecny Control

Liquid CLustering & Delta Kernel

1. What is Delta Lake?
   1. Benefits
   2. Features
2. What’s a Lakehouse?
3. What are some alternatives?
4. When to use/not use?
5. The big news; Delta 3.0
6. Getting started (locally)
   1. Installing spark
   2. Running in a jupyter notebook.

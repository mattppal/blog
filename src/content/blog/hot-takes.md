---
author: Matt Palmer
description: My takes on the state of the modern data stack
draft: false
featured: true
ogImage: ""
postSlug: hot-takes
pubDatetime: 2023-04-07 00:00:00
tags: [data, opinion]
title: Hot Takes on the Modern Data Stack
emoji: 🌶️
---

## Intro

Hot on the heels of [Data Council Austin](/posts/data-council-austin), I've been thinking about the data landscape— both from what I've seen firsthand and gleaned from discussions, forums, and blog posts. I'm grateful for my exposure to a spectrum of data teams, from going 0 ➡️ 1 to driving product at scale. Simultaneously, it's been refreshing to see community growth, led by [dbt](https://www.getdbt.com/community/join-the-community/), [Locally Optimistic](https://locallyoptimistic.com/), [Operational Analytics](https://www.operationalanalytics.club/) and others, that has shed light on what it means to be a data practitioner.

Through these media, I've found common pain-points and trends that I felt warranted a blog post. The data landscape has changed drastically in the past 5 years, so here's what I feel are some (potentially painful) truths:

## 🔥 Hot takes

❗️ **dbt lacks some basic functionality expected of a best-in-class tool**

I wish I was wrong here, but from my experience with dbt Core, there's much to be desired. While dbt was _revolutionary_ in the early days of the MDS, little has changed since then. The lack of column-level lineage, basic documentation tooling, and manual nature of the product scream potential for a disruptive incumbent. To implement dbt from scratch, one of the following is necessary:

- Know someone who can guide you through common pitfalls.
- Do an ungodly amount of research to find the libraries necessary to automate the painful parts.
- Grind through the implementation, make a ton of mistakes, and re-write your entire codebase.

To me, dbt will always live on as a _framework_. By no means am I dismissing the value of the tool, but the architecture of dbt is dated. Like Airflow, this is a major disadvantage— they have some major tech-debt and it'll be tough to implement foundational changes. I suspect the dbt team realizes this, hence their shift in stance towards "enabling an ecosystem" for features like [column level lineage](https://github.com/dbt-labs/dbt-core/discussions/4458). Furthermore, dbt will always lack what [Google's Dataform](https://cloud.google.com/dataform) now provides: end-to-end integration with a data stack at no additional cost.

It's a mystery why Google hasn't invested more in the Dataform + BigQuery experience, given the insane opportunity they have. As I'll discuss later, many are jumping ship from Redshift. The potential for Google to roll out a "data environment in a box" is super enticing, but who know's what's going on in product over there? 🧐

The dbt situation is odd. Vendors and libraries are springing up whose main purpose is to cover dbt's shortcomings with advanced lineage, observability, and metadata capabilities (with some success), but that doesn't really solve the problem. It's not efficient or feasible for a practitioner to go "shopping" for every single component of a transformation framework— we need a tool that does it all (and well). While dbt will live on thanks to community adoption and support, there's a lot of potential for improvement.

❗️ **Deploying a "production" data warehouse is unnecessarily hard and gated by tribal knowledge.**

I've had the fortune of working with several data warehousing technologies. While developments in the past half decade have centered around abstracting DevOps (i.e. separation of storage/compute, introduction of serverless architecture, autoscaling, etc.), little has been done to simplify the process of building a functional analytics solution.

Take, for example, creating a test/production environment. This is a relatively trivial problem that's actually become easier in products like Snowflake with [zero-copy clones](https://community.snowflake.com/s/question/0D50Z00009C3VlMSAV/zero-copy-cloning), but for tools like Redshift or BigQuery, it's necessary to architect some unnecessarily complex process— either restoring a snapshot nightly or programmatically generating SQL. The worst part: most of the clever solutions to this problem are buried in forums/Slack/etc. Once again, knowing someone who's solved this problem _for your specific warehouse_ can be a huge time saver.

Separately, managing permissions is also a headache. This is something that could be (arguably) more baked-in to a transformation tool like dbt (I have qualms with their [permission guidelines](https://docs.getdbt.com/blog/configuring-grants) as well, but don't get me started). While GitLab manages an [open-source tool](https://about.gitlab.com/handbook/business-technology/data-team/platform/permifrost/) for Snowflake permissions, I have yet to find an equivalent for Redshift and have resorted to writing Terraform, which only accomplishes about half of what I was hoping for.

I believe this functionality should be standard in a data warehouse in 2023. Perhaps there's opportunity for a product that can roll-out and maintain dev/stage/prod environments across vendors or make permissions management a breeze.

❗️ **Redshift is no longer a true competitor in the warehouse space.**

Similar to the Google Dataform situation, this is a bit of an enigma. Having practically **invented** cloud storage and dominating the space on a number of fronts, Amazon has completely let Redshift go.

Lately, almost every improvement in the product has come as a response to competitors like Snowflake and BigQuery innovating on storage, compute, and serverless. This is despite the wild competitive advantage Redshift has, given it's closeness to S3 and the _potential_ for tighter integration all of Amazon's services. Still, we lack functionality like _uploading a CSV directly to a table_ 😒 (not only is this possible in BigQuery, but Google Sheets can sync directly to the db).

Amazon is finally rolling out features like [AUTO-COPY](https://aws.amazon.com/about-aws/whats-new/2022/11/amazon-redshift-supports-auto-copy-amazon-s3/), but at a snail's pace— it's been in preview for the past 6 months! I see tremendous opportunity for players like Amazon and Google (that have cloud services) to innovate on the data side, but it doesn't seem to be a priority.

Why isn't it possible to natively couple a production database to an OLAP store and provide out-of-the-box CDC? This is more of a "data warehouse in a box" type stuff, but for 99% of companies it will save weeks/months of time (and reduce Fivetran bills).

As data teams continue to proliferate, maybe we'll see movement... or a disruptive competitor. In the meantime, I feel Snowflake and BigQuery are miles ahead of Redshift, which is quickly trending towards an obsolete product.

❗️ **Airflow is obsolete.**

Speaking of obsolete products, I would _highly_ advise against an Airflow implementation. Why? There are a number of tools ([Dagster](https://dagster.io/), [Prefect](https://www.prefect.io), [Mage](https://mage.ai/), to name a few) that are being built from the ground-up to address Airflow's failures. These solutions are more nimble than Airflow and can iterate fast. One of the biggest downfalls of Airflow has been it's success— now, the open source community has to focus on _maintaining_ the product to be sure it doesn't break existing deployments rather than innovating. The [717 open issues on github](https://github.com/apache/airflow) (as of this writing) are a testament to this.

If you're looking for an orchestrator (and executor, which Airflow is not) that features a testing framework, better observability, support for dataframes as assets/objects, and tighter integration with data transformation tools, like dbt, I'd _highly_ suggest one of the above products/libraries.

❗️ **Airbyte is not production-grade software.**

I'm not sure if this is a hot take or just a fact. With nearly [_4,000_ open issues on Github](https://github.com/airbytehq/airbyte) as of this writing, it's safe to say their dev team is underwater. I feel Airbyte's marketing to be disingenuous, as it might seem a Fivetran-killer when, in fact, it breaks in most use cases (I can confirm this from personal experience).

If I was a member of the Airbyte team, I'd be _very_ concerned with Fivetran's recent ["free-tier"](https://www.fivetran.com/blog/fivetran-free-plan) announcement. The number of MAR they're offering will cover most teams until they have the money to pay for a service like Fivetran, at which point Airbyte will be out of consideration.

For modern data teams, I think the ingestion problem is pretty close to being solved, with Fivetran for well-know sources and [Meltano](https://meltano.com/) as a framework for building Singer Spec connections to lesser-known ones. There will always be edge-cases, but this is about as close to a consensus as we'll get for a particular part of the MDS.

## Final words

It's important to recognize that it's easy to be a critic. After all, what have I built that compares to these amazing tools? Hopefully, I'll have a different answer to that one day, but for now, I should caveat that every product I just mentioned has helped to drive a revolution in data science and analytics by making it easier to do my job.

What I'm hoping to convey with my tacky "hot takes" is that we're in the midst of a _very_ exciting time in data and software development. Never before has the friction to building something been so low. With tools like [Modal](https://modal.com/) and [Supabase](https://supabase.com/), smaller teams can build amazing products. I suspect AI will only accelerate this trend. My personal view is that we'll see a sea of mini-development teams and lean companies pop up that can leverage these frameworks to out-compete incumbents. I guess only time will tell. 🤷‍♂️

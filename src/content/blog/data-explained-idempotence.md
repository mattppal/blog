---
author: Matt Palmer
description: One of those terms that's much more complex than it needs to be
draft: false
featured: false
ogImage: ""
postSlug: data-explained-idempotence
pubDatetime: 2023-12-20 00:00:00
tags: [data, opinion]
title: "Data Explained: Idempotence"
emoji: 🤓
---
Idempotence is one of those terms that frequently gets tossed around, but can be tricky to understand:

> In mathematics and software engineering, idempotence is a property of operations that specifies _no matter how many times_ you execute them, you achieve the same result. 

In data, that applies to the operations we perform— extract, transform, & load. _Idempotent_ data pipelines return consistent results, regardless of how many times they’re run or if they fail mid-run. 

Let’s say using an Airflow DAG, you pull data from a daily updating API and write it to S3. Each day, new data is present in the API. You take that new data and drop it in S3 with the existing data.

Sounds simple, right? Building an idempotent pipeline means asking:

* What happens if I run my pipeline twice in the same day? (before new data is present) 

* What happens if there’s a failure in the middle of my run (perhaps an API outage) and I have to re-run the DAG?

Idempotence is a simple concept, but can quickly become confusing _especially_ if dealing with complex merge operations, like `UPSERT` or other data engineering patterns, like snapshot tables. 

Things get a bit more complicated when considering incremental pipelines. Now, this isn’t exactly _hard_ , it’s just more confusing. Thankfully, [dbt](https://docs.getdbt.com/docs/build/incremental-models) and [similar](https://sqlmesh.readthedocs.io/en/stable/concepts/models/model_kinds/#incremental_by_time_range) [tools](https://docs.dataform.co/guides/datasets/incremental) have pre-built patterns that make incremental models a breeze. 

So, here are some tips to make sure your pipelines are idempotent & adhere to best practices:

*  **Unique Identifiers:** I just used the example of `UPSERT`, but that depends on data having a unique identifier or primary key. Without the ability to distinguish unique records, you’re going to have a tough time discerning idempotent operations. 

* **Stateless Processing:** This is just a fancy way of saying the results of an operation are independent from the _previous state_ of the system. The examples I provide above are overcome with stateless pipelines, e.g. a pipeline run should yield the same results _even if already executed_. 

* **Intelligent Incrementality:** Data warehouse models are often incremental by _time_ or _key_. Incrementalitly can then be as simple as `INSERT INTO WHERE new_timestamp > max(existing_timestamp)`. By sticking to simple patterns built on proven frameworks, you can easily ensure your DWH pipelines are idempotent.

*  **Delete-write Processing:** The delete-write pattern specifies that pipelines should first delete existing data before writing new data. It’s important to _only_ delete data that a pipeline will recreate, but this ensures duplicate data will not be created. 

* **Simplified Design:** Complexity is sometimes necessary, but it also introduces points of potential failure. Seeking to simplify data & analytics workflows _as much as possible_ means a lower error rate and an easier debugging experience. 

* **Error handling:** In data engineering, it’s not a question of _if_ errors will arise, but _when_ they will. Intelligently handling errors will help to maintain idempotent operations. In particular, **Safe Retries** are especially important. Building in logic to ensure pipeline re-runs don’t duplicate data is one component of **Stateless Processing**. Your pipeline should produce consistent results, regardless of whether it’s retrying a failed job or running as scheduled.

The _easiest_ way to ensure these properties hold is to seek out solutions (data integration, transformation, and orchestration tools) that come out-of-the-box with incrementality, automated retry logic, and patterns like `UPSERT`. Trust me when I say these are _solved problems_ and your team will save lots of time and energy by reusing frameworks that have already been built and tested. 

If you do choose to build your own system (or it’s necessary for your top-secret pipelines), stick to data modeling best practices, then build in smart processing and intelligent incremental pipelines to ensure robust, idempotent operations.
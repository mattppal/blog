---
author: Matt Palmer
description: ''
draft: false
featured: false
ogImage: ''
postSlug: airflow-framework
pubDatetime: 2021-05-22 00:00:00
tags: []
title: Dynamically generated Airflow TaskGroups for data teams.
---

* TOC
{:toc}
### What is Airflow?

Apache Airflow is an open-source, community-driven platform for programmatic scheduling and execution of workflows. It integrates with many popular data sources and offers an accessible way to build and deploy pipelines.

Airflow is great for analytics and engineering teams since it has a fairly gentle learning curve and can be implemented purely using Python. It's fairly straightforward and provides a great UI. Being open source, new features are constantly being added. Community support means that common solutions can frequently be found online.

### Dynamic TaskGroups

Airflow provides a great opportunity for analytics teams— with a bit of setup, we can leverage the platform to provide dynamic workflow generation with minimal maintenance. 

While little Airflow knowledge is needed after setup, anyone with a basic Python knowledge can troubleshoot a DAG or implement new features. In the example discussed here, analysts and others can still add/subtract operators to/from a workflow, reorder execution, and assign priority groups with only a basic knowledge of Git.

The basic premise is as follows:

1. Create a GitHub repository with an ETL/pipeline structure.
2. Use GitHub Actions to sync this repository to S3 or another file store.
3. Leverage the boto Python library in Airflow to pull in the repo.
4. Write a DAG to recurse through the tree and generate a pipeline.

While we originally synced directly to GitHub, Airflow refresh frequencies quickly led us to hit the GitHub API limit. Our workaround was syncing the repo to S3, which uses actively developed packages and is more robust.

With this method, analysts can push edits to the repository and sync them automatically with the DAG. We're currently working on a similar implementation at Storyblocks. Our old tool, Jenkins, made it terribly difficult to troubleshoot ETL failures and was quite opaque to analysts— knowledge of the tool was necessary to make updates. Additionally, each time a push to our existing data repo was made, we had to swap Docker tags, a manual process that was easy to overlook. An Airflow implementation makes the ETL structure more accessible to the analytics team, removes manual steps, and improves maintainability.

Furthermore, with some string parsing, we can create conventions for excluding, prioritizing, and grouping file execution. For example, prepending an 'X_' to exclude a file in the repo or using '1_', '2_', etc. to create groups of files that need to be ordered.

### Implementation

Take the following example of a [*warehouse friendly schema*](https://www.youtube.com/watch?v=D5hpjlYHEGw&t=386s) from Periscope Data co-founder Tom O'Neill. In Tom's example, four stages are used for effective data management.

1. Protective: this stage enables file renaming and filtering. For example, suppose engineering has to rename a column in the source data. A protective view enables analytics to make one transformation from the source without having to rewrite multiple scripts.
2. Staging: we can perform simple transforms and tests off of the protective layer to ensure data quality and make slight adjustments.
3. Reporting: Wide tables generated from staging views. These are intended for transformations by analysts or to be used for aggregations, charts, etc.
4. Data Marts: team-focused data marts are a *source of truth* for teams. For example, there might be an *Finance Data Mart* that provides aggregations off reporting and staged data specific to the accounting team. We're fine with building business logic into this mart, since the only consumers are the finance team and changes to their logic have no downstream consequences.

Tom goes in to much more detail, but using this framework in our example:

<figure>
  <img src="airflow-etl/IMG_01.jpg" alt="Example implementation of Tom's warehouse."/>
  <figcaption><i><center>Example behavior of the first three steps of a DAG built from Tom's framework.</center></i></figcaption>
</figure>

Using hierarchical folders in our repo allows us to group steps together neatly in our DAG. Expanding the step provides more detail and demonstrates example usage of "priority groups."

<figure>
  <img src="airflow-etl/IMG_02.jpg" alt="TaskGroup expansion within the warehouse."/>
  <figcaption><i><center>Expanding an overarching step shows sub-steps and priority groups therein.</center></i></figcaption>
</figure>

Here, priority groups are created by prepending a number to a script. Our code is written such that this will trigger another TaskGroup to be created and the labelled files to be dropped inside. With this method, multiple files can be named '1_' and executed in parallel. The implementation might create more nesting than is necessary, but it works for our purposes. Expanding these groups reveals the labeled scripts.

<figure>
  <img src="airflow-etl/IMG_03.jpg" alt="Example priority group behavior"/>
  <figcaption><i><center>Using naming conventions, we can prioritize script execution using only Git.</center></i></figcaption>
</figure>

### Features

The GitHub/Airflow integration enables the following:

- Easy visual inspection of the ETL to confirm files are executing as intended.
- Gantt charts and execution times for each step, allowing anyone to visually inspect and identify troublesome scripts.
- One-step ETL updates through pushes to a GitHub repo.
- A framework for implementing new execution features via Python and naming conventions.
- Robust scheduling features standard with Airflow.
- Email notifications for execution fails/retries.

Additionally, we're interested in adding the following:

- A way to easily delineate those scripts that will halt execution on failure and those that have no effect.

### Wrap-up

Our implementation uses the open-source tool Apache Airflow to create a low-maintenance DAG from any GitHub repo. In this example, we leverage a Warehouse framework from Tom O'Neill to programmatically execute scripts in a fictional data warehouse. The solution is easy to maintain for data teams and requires only a knowledge of Git to edit, allowing improved data accessibility and easier updates to warehouse code. Furthermore, the tool lets users edit prioritization and structure using a familiar folder interface. Hopefully, others will find this framework useful. For specific examples and code, please contact me directly.
---
author: Matt Palmer
description: Reflecting on the premier data conference in Austin, TX.
draft: false
featured: false
ogImage: ""
postSlug: data-council-austin
pubDatetime: 2023-04-01 00:00:00
tags: [data, opinion]
title: Data Council Austin - Notes & Takeaways
emoji: 🤓
---

<center>
<figure>
  <img src="../../assets/postsdata-council-austin/dca-logo-1.jpg" alt="Confirmed, not much bullsh*t."/>
</figure>
</center>

## ToC

## Intro and Thanks 🙏

I spent the last few days in Austin, Texas, attending the [2023 Data Council Conference](https://www.datacouncil.ai/austin). I'll be here through the weekend (and I'm stoked to explore), but I wanted to drop my notes while they're fresh.

To start, this year's Data Council was outstanding— the quality of the speakers and the “smallness” of the event created a forum for learning about emerging technologies _and_ an opportunity to discuss data trends with some of the brightest innovators in the space. I was incredibly lucky to meet passionate, dedicated folks who helped me better understand the industry _and_ provided tangible takeaways for how we approach data problems at Underline.

I'd be remiss if I didn't give thanks to the _awesome_ practitioners at [Bytewax](https://bytewax.io/), [Brooklyn Data](https://brooklyndata.co/), [Hex](https://hex.tech/), [Group 1001](https://www.group1001.com/), [Datafold](https://www.datafold.com/), [Modal](https://modal.com/), [dbt](https://www.getdbt.com/) and others who helped me learn and grow. I left the conference filled with optimism: about data outcomes at Underline _and_ the industry as a whole.

I was lucky to come across a few _excellent_ resources for building data teams. It was refreshing to realize that others are dealing with the same challenges. Engineers have been navigating barriers in analytics/politics/business for _quite a while_. The following are some I was reminded of at DCA:

- The [GitLab](https://about.gitlab.com/handbook/business-technology/data-team/) and [Meltano](https://handbook.meltano.com/data-team/) handbooks, developed by [Taylor Murphy](https://www.linkedin.com/in/tayloramurphy), are excellent resources for managing data teams. Taylor spoke to the needs of transparency in both leadership _and_ code.
- [Amplify Partners](https://datateams.amplifypartners.com/) has a pretty exhaustive list of resources for starting a data team. I'd highly recommend giving these a look.

## Industry Trends

As with any conference, I think the greatest value comes from meeting passionate people and having authentic conversations. Luckily, DCA provided that _in addition_ to some really great speakers/presenters. Here are the industry trends I observed from both private discussions and public presentations.

### High-Level

📜 **The [Activity Schema](https://www.activityschema.com/) is a promising framework** I’m a huge proponent of event-driven analytics. The Activity Schema is a concept introduced by [Narrator](https://www.narratordata.com/) that drastically simplifies answering questions using SQL. It's heavily reminiscent of an "event stream." I've employed similar analytical patterns on event data in the past and I think it would be worth a POC/demo for most to see if it fits their needs. I'm _unsure_ it would completely replace other data modelling approaches, but the idea of timestamp joins + event data is surprisingly simple and powerful.

🌊 **There has been a major simplification of streaming and real-time data solutions.** Tools like [bytewax](https://bytewax.io/) and [materialize](https://materialize.com/) are redefining streaming analytics. Streaming data will soon be available to _every_ team, not just those with large enterprise level resources (if they aren't already). At [Underline](https://www.underline.com/), we have a few applications that will require a solution like bytewax, so I'm excited to give it a shot.

🔭 **There's a major focus on lineage/governance/observability.** I’m not sure any tool is particularly developed, so I’d wait for some maturity in the space before diving into a solution. Still, [datahub](https://datahubproject.io/) and [datafold](https://www.datafold.com/) are interesting and promising. Personally, I'm very excited to try out a solution using datafold data-diff. This was a HUGE pain point when I was an analyst. Starting early with an observability tool could be a game-changer and save countless hours. Plus, dbt's catalog and lineage.... are not great. Datahub _could_ be a solution, but building out a slightly more advanced lineage system is lower-priority for us, since dbt docs are "good enough" for now.

❄️ **A shift towards BigQuery/Snowflake.** Almost _no one_ uses Redshift (or really wants to). Snowflake/BigQuery appear to be the standard for DWH solutions. Though more expensive, Redshift users might think about Snowflake in the medium-/long-term to avoid being hamstrung by an under-served product. Though I've only used BigQuery and Redshift, I might seek-out a Snowflake demo. BigQuery is my current favorite. 😛

🤖 **Proliferation of AI tooling.** Who doesn't talk about AI these days? Yes, it's very impressive. Yes, it will change the world. I think adoption of things like [GitHub Copilot](https://github.com/features/copilot) should be done sooner rather than later. There's also a _very real_ opportunity for fast-movers to disrupt pretty much _every_ industry. My question: when will I be able to reliably integrate this into my workflows to improve their process?

🙏 **Simplification of development process.** We’re on the cusp of something really great here, too. Development cycles for infrastructure/data-eng are really slow. [Modal](https://www.modal.com) and the like _will change that_. I think many common DevOps/infra headaches will be abstracted-away in the very short term. This is more of a challenge for enterprises who require more secure (VPC) solutions.

💨 **Adoption of _faster_ frameworks**

- **[Rust](https://www.rust-lang.org/)** appears to be gaining traction in the data community. These still appear _very_ experimental. I did not speak to anyone using Rust in production. Nonetheless, I think playing around with something like [Polars](https://www.pola.rs/) in Rust would be worthwhile.
- **[Arrow](https://arrow.apache.org/)** defines a language-independent columnar memory format for flat and hierarchical data. Tools like pandas and others will be adopting Arrow in the near future.
- **[Duckdb](has tremendous pro)** is SQL interface for common file storage types— think Redshift Spectrum, but more flexible. The concept is promising... could it be a OLAP killer? 🦆

### Modern Data Stack

**dbt** is still a staple in data transformation from the warehouse layer down. Though there _is_ potential for disruption in the space, the ubiquity of the tool and the fact that it “just works” is good enough for now. Unfortunately, **dbt-core** development is still a huge pain. I spoke with several practitioners on how to better approach this problem. The following will be my approach to improving our current system:

- **Codify permissions** we need to manage permissions as code. There are tools available to do so in Snowflake, but from my research a Redshift solution will require some custom Terraform.
- **Create a development profile**: _only_ one database user should be making views/tables in production. A development database should be used to sample prod data and provide a playground for development. I've found [shockingly little](https://docs.getdbt.com/blog/configuring-grants) documentation on this.
- **Develop a containerized approach to local development**. It’s _really_ hard to get setup in our dbt environment today. We need to turn our dbt repo into a fully-packaged environment that can be run in docker or another python framework. Even though we're on dbt-core, we'll need to make the tool as _accessible_ as possible for our analysts.

**Fivetran** has “solved” the problem of data ingestion. It’s a ubiquitous tool that’s the industry standard. This isn’t a point of contention. Their fees are reasonable considering the time/resource savings. In 2023, _no one_ should be writing custom connectors for sources that already exist. From our experience, **I would strongly recommend avoiding Airbyte**. We found the tool to be wholly insufficient and, quite frankly, not production-grade software. For those sources unsupported by Fivetran, **Meltano** can be used for custom connections— providing a framework that can build connections on the [Singer Spec](https://hub.meltano.com/singer/spec) to create order from perhaps disorderly APIs. Best of all, it can be run in Airflow, Dagster, etc.

Speaking of which, **Dagster** has taken the slow-moving nature of Airflow development and innovated to provide a _similar_ tool that was re-worked from the ground up to be more suited towards modern data teams. It’s deployable via helm _and_ has native support for dbt. The nature of writing DAGs/ELT jobs is more developer friendly. Compared to Airflow, I would estimate a:

- Decrease in time to develop DAGs (1.25-1.5x).
- Reduction in maintenance of DAGs (1.25-1.5x).
- Increase in user-friendliness of the platform (ability for others to develop) (2-3x).

From a time savings standpoint, I think Dagster is a no-brainer. Given the _extremely_ low friction to test it out, I think everyone should at least give it a try. Plus, it seems that migration is not too bad— a colleague migrated 70+ DAGs in 4 hours. I've been pretty frustrated by development blockers in Airflow TaskFlow as of late. The Dagster team said I'll _love_ Dagster if I like TaskFlow. I'm excited to give it a shot.

**Hex** is becoming the standard for ad-hoc analysis. I've written about how we used [Hex at AllTrails](https://hex.tech/blog/hex-at-alltrails/) for exploratory analysis, internal apps, and more. Combining SQL and Python, the tool makes it _easy and fun_ for analysts to do their work. This is definitely the cherry on top— you need a pretty mature data stack before you can begin implementing collaborative, hosted notebook tools, but I have a _very strong conviction_ that this product will continue to revolutionize exploratory data analysis.

## Wrap-up 🎁

The theme of the conference was _excitement_. While there was a declared theme of governance, observability, and metadata, I detected a buzz about something bigger.

In tech, I think we all can feel that we're on the cusp of something revolutionary. AI, simplified development, and abstracted resources are ultimately shortening the developer feedback loop. This has the effect of:

1. Making existing developers more efficient.
2. Reducing the number of people required to create a product.

The consequences are that:

1. Existing companies have the opportunity to take their teams to new hights.
2. _New_ businesses, unencumbered by the tech debt that was previously necessitated by in-house tooling, will be able to move _fast_.

I would be **very** concerned if I worked in an industry dependent on search or another problem space that AI solves well. I think we're about to see a revolution in software development, driven by small teams and [solopreneurs](https://www.uschamber.com/co/start/startup/what-is-solopreneur).

Only time will tell.

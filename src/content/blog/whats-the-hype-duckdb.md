---
author: Matt Palmer
description: An overview of DuckDB and a neat trick to get you started. 🦆
draft: false
featured: true
ogImage: "/posts/whats-the-hype-duckdb/ducks-mid.png"
postSlug: whats-the-hype-duckdb
pubDatetime: 2023-05-24 8:00:00
tags: [data, tutorial, duckdb, opinion]
title: What's the hype behind DuckDB?
emoji: 🐥
---

<style>
  img {
    width: auto;
    max-height: 500px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

![A duck sits peacefully on a stream in a picturesque cartoon meadow.](/posts/whats-the-hype-duckdb/ducks-mid.png)

## ToC

## 🦆🦆🪿 Duck, duck, goose

Today is an exciting time in data. New tools have the opportunity to revolutionize not only how data engineers work, but how companies _architect data platforms_.

I mostly agree with Tristan Handy's [characterization of the MDS](https://www.getdbt.com/blog/future-of-the-modern-data-stack/) through 2020: there was a period of explosive growth in the mid- to late-2010's, followed by a stall (and COVID). I firmly believe that we're amidst a second renaissance in data tooling.

DuckDB is a great example of a new tool that has _tremendous promise_— in its intended use as an OLAP DBMS, but also for _all sorts_ of tangential cases. I'll discuss those a bit today, but first, some background: a few weeks ago I saw Daniel Beech's post: [DuckDB vs. Polars](https://www.confessionsofadataguy.com/duckdb-vs-polars-for-data-engineering/), which led me to experiment with DuckDB the same way he did. Since then, I've been fiddling with the tool and chatting with others— I've even given a few [lightning talks](https://docs.google.com/presentation/d/1NZd8C650TLSEldwvKF2etIWD90QSJJ9VtVFSY_2amBU/edit?usp=sharing) on what I've found.

Of course, I'd be remiss if I didn't share my thoughts [completely](/posts/data-is-a-meme/)— so that's what I'll do!

## 🌎 So, what on earth is DuckDB?

Let's dig in! According to the folks at [DuckDB](https://duckdb.org/):

> DuckDB is an in-process SQL OLAP database management system

🤔 That doesn't clear much up. Let's break it down.

> DuckDB is an <u>in-process</u> ..

Ok, so it runs in memory, _not_ on disk, i.e. RAM vs. SSD. [Here's a good write-up](https://aws.amazon.com/nosql/in-memory/) by Amazon on in-memory DBs.

> .. <u>SQL OLAP</u> ..

Technically redundant, but **O**n**l**ine **A**na**l**ytical **P**rocessing is more-or-less a column-oriented database. Traditional databases (Postgres, MySQL) are _row-oriented_, which optimizes for fast reads/writes. Column-oriented DBs are optimized for analytics. We'll discuss this a bit more later.

> .. database management system ..

So _not only a database_ but a system for creating and managing databases. Ah! Much better! But, how does it work?

## ⚙️ How it works

DuckDB utilizes a _vectorized_ query engine. That's a fancy way of saying operations are columnar. If you're a data science ninja 🥷, you might be familiar with the [complexities](https://stackoverflow.com/questions/52673285/performance-of-pandas-apply-vs-np-vectorize-to-create-new-column-from-existing-c) of vectorized dataframe ops (they're a nightmare!).

Being a vectorized engine just means that large batches of values (vectors) are processed in a single operation. Vectorized execution leads to better performance in analytical calculations, which are often performed over _all_ values in a particular column, e.g. an aggregation like `SUM`, `MAX` or window, such as `ROW_NUMBER`.

![A graphic describing the difference between row- & column-oriented databases.](/posts/whats-the-hype-duckdb/row-vs-col.png)

While _technically_ not new, there's a pretty big movement in the open source community right now: [PyArrow](https://arrow.apache.org/docs/python/index.html), [Polars](https://github.com/pola-rs/polars), [Pandas 2.0](https://pandas.pydata.org/docs/dev/whatsnew/v2.0.0.html), _and_ [DuckDB](https://duckdb.org/) all tools built on in-memory, vectorized operations. Usually, when many things point in the same direction, it's wise to take note! 📝

While the features of DuckDB are not new— we've had OLAP DBMS for years: the real innovation behind DuckDB is its **simplicity** and **distribution** (free & [open-source](https://github.com/duckdb/duckdb)).

## 🫵 Why you should care

Most databases are _complicated_. Today, we have managed solutions ([Amazon RDS](https://aws.amazon.com/rds/postgresql/), BigQuery, etc), they can be expensive, _especially_ managed OLAP solutions (as I'm sure many Snowflake customers are aware).

Not only is configuration a headache but truly _understanding_ how pricing works can be a nightmare. This is a problem for data teams, but also those seeking to _learn_ and _play_— it creates barriers to new and potential data engineers.

Here's an example: say I want to install Postgres to learn about databases, as I'm sure many have done in their data journeys. Navigating to [Chapter 17](https://www.postgresql.org/docs/) (!) of the Postgres docs, we find _Installation from Source Code_, which sounds both intimidating and not particularly fun. It's telling that section 17.1 is titled "Short Version," which already makes me nervous about what lies ahead. This will be a daunting quest. ⚔️

![Screenshot of the Postgres docs, Chapter 17— "Installation From Source Code."](/posts/whats-the-hype-duckdb/psql-source.png)

Similarly, if we want to understand how modern databases _work_, we might seek out whitepapers or technical documents, for example:

- [_An Inside Look at Google BigQuery_](https://github.com/tpn/pdfs/raw/master/BigQuery%20Technical%20Whitepaper%20-%20Google.pdf)
- [_The Snowflake Elastic Data Warehouse_](https://event.cwi.nl/lsde/papers/p215-dageville-snowflake.pdf)

And just like that, we're neck deep in academic papers reading about "cloud-powered massively parallel query services." 😬

By contrast, from the [DuckDB docs](https://duckdb.org/docs/installation/):

```bash
pip install duckdb
```

Hm... That's a bit more approachable. Not only that but there's _native support for reading from semi-structured sources_ like parquet, CSV, etc.

```sql
SELECT * FROM read_parquet('input.parquet');
CREATE new_tbl AS SELECT * FROM read_parquet('input.parquet');
```

Wow! So basically, we can go from zero ➡️ in-memory, vectorized databases with:

- A python installation
- Three lines of code
- Some sample data

This is _huge_ 🤯.

## 🌄 Possibilities

This is the part where I deliver some off-the-wall theories about how this will be awesome, game-changing, etc.

![My opinions on data tooling might make me a conspiracy theorist.](/posts/whats-the-hype-duckdb/ancient-aliens.png)

### Replacement for managed OLAP systems

Redshift, BigQuery, and Snowflake are all excellent tools. They've revolutionized data processing and storage, _but_ they're expensive and require expertise to maintain. I think these solutions will _always_ have a place on some teams, but others might opt for DuckDB— especially those who are resource constrained. As the tool develops, I could see it emerging as a true competitor to managed OLAP services.

Many claim the death of the centralized data warehouse. While data technology might be trending in that direction, this is far from reality for the majority of data teams. _However_, DuckDB could be one step closer to that end.

### Database representation of a staging layer

This is a bit more abstract, but DuckDB could serve as an upstream _transformation_ layer, for those that aren't ready to give up their warehouse.

Hear me out— imagine you have a data-lake situation. While SQL has its pitfalls, it is an excellent language for transforming data. With DuckDB, you could pull in semi-structured data and perform light SQL transformations _without leaving the lake_. Using a tool like dbt (or [SQLMesh](https://sqlmesh.com/)), you then have a versioned, transformation-as-code system!

With a connector tool, you could write that transformed data to your final destination, whether that's _another_ DuckDB-DB or something like Postgres, Redshift, etc. This brings the benefit of databases and structured data _up a layer_, from analysts to data engineers. I could imagine DuckDB fitting into the final stages of [a medallion architecture](https://www.databricks.com/glossary/medallion-architecture).

Maybe that's a stretch, but I think it has potential. 🤔

![Dwayne "The Rock" Johnson KNOWS you have potential.](/posts/whats-the-hype-duckdb/the-rock.gif)

### An _awesome_ opportunity for tutorials and learning

OK, so the earlier solutions are a bit out-there, but this one is tangible and immediate. Most OLAP systems are hard to configure and difficult to learn. Most of the time, it takes _hours_ of fiddling just to be able to write some SQL. Furthermore, it's ambiguous how much free cloud credits are worth, and I'm frequently worried that I'll be charged at some point for fiddling around in BigQuery. 😅

With DuckDB, we have a **free**, **open source** way to set up training and sandbox environments. I think a SQL tutorial site built on fabricated data in DuckDB would be _awesome_.

As a [former analyst](https://hex.tech/blog/hex-at-alltrails/), _the best_ way to learn SQL is by answering questions and playing around with a database. Though things are much further along than they once were (I remember leafing through [_Learning SQL_](https://www.oreilly.com/library/view/learning-sql-3rd/9781492057604/) back in the day), an interactive console built on DuckDB could be _invaluable_ for analytics training and a staple in data engineering portfolio projects.

Ben Rogojan has [an awesome post](https://www.theseattledataguy.com/7-data-engineering-projects-to-put-on-your-resume/#page-content) highlighting a few of these, but he forgot about DuckDB! Why spend hours _configuring_ a source that you won't be able to maintain when you could simply drop DuckDB in a container?

![Billy Mays here: you must read on!](/posts/whats-the-hype-duckdb/theres-more.png)

... but now for what I _really_ want to talk about— simplifying a common data engineering task with DuckDB.

## 1️⃣ One-line partitioned parquet

This is a pretty neat trick and something [Daniel Beech](https://www.confessionsofadataguy.com/duckdb-vs-polars-for-data-engineering/) first brought to light. Here, we'll take his demo one step further.

**That's right folks, you made it this far— you're getting the good stuff.** All three of you. 😂

A common data-eng problem is taking some input (usually a CSV or JSON), [partitioning it](https://www.cockroachlabs.com/blog/what-is-data-partitioning-and-how-to-do-it-right/), and storing it in an appropriate format in cloud storage ([parquet](https://www.databricks.com/glossary/what-is-parquet) in s3).

This might lead you to write grizzly Airflow DAGs with hideous chunking logic:

```python
def upload_df_to_parquet(df, prefix, chunk_size=250000, **parquet_wargs):
    """Writes pandas DataFrame to parquet format with PyArrow.

    Args:
        df: DataFrame
        prefix: s3 directory where parquet files are written to
        chunk_size: number of rows stored in one chunk of parquet file. Defaults to 1000000.
    """
    logger.info(f"Uploading df")
    s3_hook = S3Hook(aws_conn_id=AWS_CONN)
    for i in range(0, len(df), chunk_size):
        slc = df.iloc[i : i + chunk_size]
        chunk = int(i / chunk_size)
        fname = os.path.join(prefix, f"part_{chunk:04d}.parquet")
        logger.info(f"Uploading {fname}")
        with BytesIO() as buffer:
            slc.to_parquet(buffer, **parquet_wargs)

            s3_hook.load_bytes(
                bytes_data=buffer.getvalue(),
                bucket_name=S3_BUCKET,
                key=fname,
                replace=True,
            )
```

That's... less than ideal, hard to edit, and easy to break. There has to be a better way— and there is!

For our example, we'll use the [FDIC's failed bank list dataset](https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/), since it's small, somewhat manageable, and timely.

First, let's connect DuckDB and define our urls:

```python
import duckdb
import pandas as pd
import os
from dotenv import load_dotenv

conn = duckdb.connect()

# source
url = 'https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/banklist.csv'

# target
s3 = 's3://ahhh-buck-it/spectrum/us_banks/'
```

I had trouble reading this URL directly using DuckDB, I suspect due to the Windows encoding (wtf FDIC 😑), so we'll use pandas. Hopefully, DuckDB will support reading these CSVs directly one day.

```python
# do pandas stuff
bank_df = pd.read_csv(url, encoding='windows-1251')

bank_df.columns = [c.strip() for c in bank_df.columns]
```

I also cleaned up the columns a bit— there were some trailing spaces hanging around. The FDIC data team could benefit from a data-eng bootcamp!

```python
bank_df.head()
```

<center>
<table class="dataframe">
  <thead>
    <tr style="text-align: center;">
      <th>Bank Name</th>
      <th>City</th>
      <th>State</th>
      <th>Cert</th>
      <th>Acquiring Institution</th>
      <th>Closing Date</th>
      <th>Fund</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>First Republic Bank</td>
      <td>San Francisco</td>
      <td>CA</td>
      <td>59017</td>
      <td>JPMorgan Chase Bank, N.A.</td>
      <td>1-May-23</td>
      <td>10543</td>
    </tr>
    <tr>
      <td>Signature Bank</td>
      <td>New York</td>
      <td>NY</td>
      <td>57053</td>
      <td>Flagstar Bank, N.A.</td>
      <td>12-Mar-23</td>
      <td>10540</td>
    </tr>
    <tr>
      <td>Silicon Valley Bank</td>
      <td>Santa Clara</td>
      <td>CA</td>
      <td>24735</td>
      <td>First–Citizens Bank &amp; Trust Company</td>
      <td>10-Mar-23</td>
      <td>10539</td>
    </tr>
    <tr>
      <td>Almena State Bank</td>
      <td>Almena</td>
      <td>KS</td>
      <td>15426</td>
      <td>Equity Bank</td>
      <td>23-Oct-20</td>
      <td>10538</td>
    </tr>
    <tr>
      <td>First City Bank of Florida</td>
      <td>Fort Walton Beach</td>
      <td>FL</td>
      <td>16748</td>
      <td>United Fidelity Bank, fsb</td>
      <td>16-Oct-20</td>
      <td>10537</td>
    </tr>
  </tbody>
</table>
</center>

Nice! A cleaned dataset. Now we have to configure a few variables:

```python
# authorize

load_dotenv('🤫/.aws/credentials')

# for communicating with s3
conn.sql('LOAD httpfs;')

# config

conn.sql(
    f"""
        SET s3_region='us-east-2';
    """
)
conn.sql(
    f"""
        SET s3_access_key_id='{os.environ['aws_access_key_id']}';
        SET s3_secret_access_key='{os.environ['aws_secret_access_key']}';
    """
)
```

FINALLY, THE MOMENT WE'VE ALL BEEN WAITING FOR. **We're ready for some magic.** 🦄

```python
conn.sql(f"COPY bank_df TO '{s3}' (FORMAT PARQUET, PARTITION_BY (State), ALLOW_OVERWRITE 1);")
```

and, that's it. We're done!

![Screenshot of S3 bucket containing partitioned folder structure.](/posts/whats-the-hype-duckdb/parts.png)

Perhaps I'm just easily impressed, but I think this is _really_ neat. You could take it one step further and write a class/function that makes this a bit more robust and production-ready.

Again, I think the true value here is _simplicity_. Will this work at scale? Maybe not, but it's _incredibly_ easy to read and understand. Solving problems in the simplest way possible, in life and data engineering, is an art worth pursuing.

## 🎁 Wrap

One of my goals for this blog is to generate excitement for promising data engineering tech. DuckDB is a _super_ accessible tool that has already generated a panoply of possibilities. If it's not apparent, I'm exuberant about what's to come, both from the open-source community _and_ DuckDB labs.

If you have other use cases for DuckDB that I missed (or if you think I'm missing the mark), please reach out! I'd love to hear your thoughts. My <a href="/about/">About</a> page has several ways to get in touch. 🙏

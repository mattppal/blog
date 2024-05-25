---
author: Matt Palmer
description: "The best ways I've found to write clean, partitioned datasets in just a few lines— with Pandas, PyArrow, Polars, and DuckDB."
draft: false
featured: true
ogImage: ""
postSlug: partitioned-parquet-part-1
pubDatetime: 2024-02-19
tags: [opinion]
title: Writing Partitioned Parquet (Part 1)
emoji: 1️⃣
---

One of the most complicated things about data engineering is that there are _very few_ problems with a industry-accepted solution: there’s no “right” way to build out an infrastructure or solve a problem.

Even when there is a concensus, it’s really hard to find out about it (this is a big reason why you should talk to people and go to conferences).

In part, that’s a good thing, because there are few universal solutions. It wouldn't make sense for a 50 person start-up to adopt Uber’s data engineering architecture.

However, there _are_ a number of common data engineering tasks that almost everyone has to do— reading data, transforming it, and writing it. Performance demands can be different, but for the most part we all just want to _simplify_ and _optimize._

In this article, I’ll focus on a very specific part of data engineering— writing partitioned datasets in the [parquet](https://parquet.apache.org) format. It’s something that’s come up time and time again for me and something you might find value in, regardless of your chosen solution. 

## ✍️ The Prompt

Our task will be to read a list of failed banks from the FDIC and write it to a dataset partitioned by state. It’s a pretty small set of data, so this should be a good example. 

Our loading script:

```python
import pandas as pd
import os

url = 'https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/banklist.csv'

bank_df = pd.read_csv(url, encoding="windows-1251")

bank_df.columns = [c.strip() for c in bank_df.columns]

bank_df.head()
```

And we want to create an output like:
    
```
bank_data/
├── State=AL
│   └── data_0.parquet
├── State=AR
│   └── data_0.parquet
├── State=AZ
│   └── data_0.parquet
...
├── State=WI
│   └── data_0.parquet
├── State=WV
│   └── data_0.parquet
└── State=WY
    └── data_0.parquet
```

We’ll walk though four options (wow, so many options)—DuckDB, Pandas, Polars, and PyArrow—covering differences, similarities, and benchmarks.

## 🦆 DuckDB

DuckDB makes this easy— using SQL, we just write a `COPY` statement to export the data to a folder:
    
```python    
import duckdb

conn = duckdb.connect()

conn.sql("COPY bank_df TO 'bank_data' (FORMAT PARQUET, PARTITION_BY (State), OVERWRITE_OR_IGNORE 1)")
```

If properly configured, you can do this just as easily with a destination in your cloud provider of choice. I cover this in my in-depth article on DuckDB [here](https://newsletter.casewhen.xyz/i/139967696/one-line-partitioned-parquet).

To read the data:
    
```python
conn.sql("SELECT * FROM read_parquet('bank_data/**/*.parquet')")
```

Behind the scenes, DuckDB is streaming parquet files _while_ using parallel processing with optimizations like automatic filtering + projection pushdown. 

That means you can query larger-than memory datasets and get performance gains over single-threaded alternatives. You can read more about those concepts in a DuckDB blog [here](https://duckdb.org/2021/06/25/querying-parquet.html) from 2021.

## 🐼 Pandas

Under the hood, Pandas is using [fastparquet or PyArrow](https://github.com/pandas-dev/pandas/blob/f538741432edf55c6b9fb5d0d496d2dd1d7c2457/pandas/io/parquet.py#L51). With PyArrow, we see similar performance characteristics to DuckDB:
    
```python  
bank_df.to_parquet(
    "pandas_bank_data",
    partition_cols=["State"],
)
```

As of Pandas 2.2.0, there isn’t a way to scan a directory of parquet files using pattern matching, so you’ll need DuckDB/Polars or a for-loop to do this easily.

## 🐻‍❄️ Polars

Again, we note that, under the hood, Polars is using PyArrow to build our partititioned output. Still, this is a pretty neat one-liner:
    
```python    
import polars as pl

pl_bank_df = pl.from_pandas(bank_df)

pl_bank_df.write_parquet(
    "polars_bank_data",
    use_pyarrow=True,
    pyarrow_options={"partition_cols": ["State"]},
)
```

Again, this is interoperable with S3, GCP, etc. Reading our dataset:
    
```python
pl.scan_parquet("polars_bank_data/**/*.parquet").collect()
```

Simple and easy! Good news for Polars early adopters. 😄

## 🏹 PyArrow

Ok, so we’ve noted that Pandas _and_ Polars both use a PyArrow backend for this operation. 

While we pickup finer-grained control with PyArrow, this is at the cost of simplicity. The PyArrow docs can be [complex](https://arrow.apache.org/docs/python/parquet.html#reading-and-writing-the-apache-parquet-format) and we have to first read the data into a PyArrow Table:

```python
import pyarrow as pa

bank_table = pa.Table.from_pandas(bank_df)
```

We can then write our output as expected:
    
```python
import pyarrow.parquet as pq

pq.write_to_dataset(bank_table, root_path='pyarrow_bank_data',
                    partition_cols=['State'])
```
And read: 
```
table = pq.read_table('pyarrow_bank_data')

## 🥇Performance

If we isolate & execute our commands in a jupyter notebook with the `%%timeit` magic function, we can get execution times and standard deviations for each `write`.

You can find the complete notebook [here](https://gist.github.com/mattppal/5f58a9f85af0efb0566568550fa7e9ec).

## 🤔 Takeaways

It shouldn’t come as a huge surprise that Polars, Pandas, and PyArrow are nearly identical— they’re all using the same backend. With overlapping standard deviations, we should consider these results identical. More surprising is the performance of DuckDB.

Of course, we have to consider that almost _every_ library requires conversion before writing. 

* If you _already_ have a Pandas dataframe, you’ll need to consider the time to import another library, convert, and write the dataframe. 

* Because Pandas shares the same backend as PyArrow and Polars, you should never convert a Pandas dataframe to PyArrow/Polars _just_ to write it. That’s just adding complexity and additional overhead. 

Additionally, this is a _really_ tiny dataset. We shouldn’t assume the same results for production-size workloads. But, we can draw some preliminary conclusions:

* With Pandas, if `df.parquet()` does the trick, stick with it.

* If you’re using Polars, stick with Polars.

* If you need more granular control, toggling to PyArrow might be useful.

In a follow-up post, we’ll explore if converting your dataframe to DuckDB allows you to write partitioned files faster. 

In that example, we’ll use some real-world sized data (think GBs). We’ll also consider implications for writing to cloud storage— for example, is it just as simple to write a PyArrow table as a dataframe?
---
author: Matt Palmer
description: "The best ways I've found to write clean, partitioned datasets in just a few lines— with Pandas, PyArrow, Polars, and DuckDB."
draft: false
featured: true
ogImage: ""
postSlug: partitioned-parquet-part-2
pubDatetime: 2024-02-26
tags: [opinion]
title: Writing Partitioned Parquet (Part 2)
emoji: 2️⃣
---

In [Part 1](https://open.substack.com/pub/casewhen/p/writing-partitioned-parquet?r=rnul&utm_campaign=post&utm_medium=web&showWelcomeOnShare=true), we dove into the differences between DuckDB, Pandas, Polars, and PyArrow for writing datasets to a directory of partitioned parquet files. We also benchmarked each library, noting some surprising (and unsurprising) results.

Of course, that was with a tiny dataset. There were only 568 rows with 44 partitions… Probably not something you’ll see in a day as a data engineer.

_So_ , we’re back to fix that! Today, I’ll be working with the [NYC Taxi Dataset](https://mavenanalytics.io/data-playground?order=-fields.numberOfRecords) with 2019 data. This dataset has ~6 million rows with around 390 partitons (dates). This will be a bit more computationally intensive, so I’ve taken some extra precautions to be sure we’re getting accurate results.

## ✍️ The Benchmark

If you’d like to see the code we used, you can check out a Gist [here](https://gist.github.com/mattppal/1e1eef95bf7cb29d1342566e5d2969dd). This was covered extensively in [Part 1](https://open.substack.com/pub/casewhen/p/writing-partitioned-parquet?r=rnul&utm_campaign=post&utm_medium=web&showWelcomeOnShare=true) of this post, so feel free to bop on over there if you’d like to get into specifics. 

Here are the differences in this benchmark:

*  **Dataset:** ~6m rows, 390 partitions vs. ~500 rows, 44 partitions
*  **Memory:** Between benchmarks, I cleared the notebook memory by deleting the large variables or closing the DuckDB connection. You can see this in the Gist.
*  **Machine:** While probably not perfect for benchmarking, I made sure to close other programs on my MacBook. I have an M1 Pro with 16GB of memory. 
  * It’s actually quite impressive how fast these operations were able to execute. I can only imagine what that would look like on a newer machine.
  *  _No wonder_ companies like MotherDuck are leaning into a hybrid execution model. If I can crunch 6m rows of data on my laptop in 10 seconds, how often will I _really_ need Spark?
  *  
To restate the benchmark from[ Part 1](https://open.substack.com/pub/casewhen/p/writing-partitioned-parquet?r=rnul&utm_campaign=post&utm_medium=web&showWelcomeOnShare=true), we’ll be reading in our dataset and converting it to a tree of partitioned parquet files— a common storage pattern for data engineers. If you’re unfamiliar with Parquet, I highly recommend checking it out as an alternative to CSVs or JSON. 

We expect the output to look like:
    
```
  taxi_data/
  ├── lpep_pickup_date=2019-01-01
  │   ├── data_0.parquet
  │   ├── data_1.parquet
  │   ├── data_2.parquet
  │   ├── data_3.parquet
  │   ├── data_4.parquet
  │   ├── data_5.parquet
  │   ├── data_6.parquet
  │   └── data_7.parquet
  ...
  └── lpep_pickup_date=2019-12-31
      ├── data_0.parquet
      ├── data_1.parquet
      ├── data_2.parquet
      ├── data_3.parquet
      ├── data_4.parquet
      ├── data_5.parquet
      ├── data_6.parquet
      └── data_7.parquet
```

## 🥇Performance

If we isolate & execute our commands in a jupyter notebook with the `%%timeit` magic function, we can get execution times and standard deviations for each `write`. `timeit` executes 7 operations and logs the time and standard deviation, so we can be sure we’re not getting anomalous data.

## 🤔 Takeaways

As discussed in [Part 1](https://open.substack.com/pub/casewhen/p/writing-partitioned-parquet?r=rnul&utm_campaign=post&utm_medium=web&showWelcomeOnShare=true), Polars and Pandas _both_ use PyArrow on the backend for this operation, so it’s no surprise they’re all practically the same.

The more interesting result is DuckDB. Coming in at roughly 6.5x faster, DuckDB truly excelled at the writes. Better yet, there’s no intermediate “load” step for DuckDB— it’s not necessary to define a new variable, since you can read directly from the dataframe:

```python    
conn.sql(
    """
    COPY taxi_df TO 'duckdb_taxi_data' (FORMAT PARQUET, PARTITION_BY (lpep_pickup_date), OVERWRITE_OR_IGNORE 1);
    """
)
```

This brings us to a _new_ set of conclusions:

* If you’re _not_ using DuckDB:

 * If you’re happy with your performance, everything works, or you don’t want to add a new library…. Do nothing. No need to introduce extra complexity.

 * If you’re trying to speed up a pipeline and don’t mind adding in an extra library, consider DuckDB for your `WRITE` operations. It will outperform PyArrow-based alternatives.

* Because Pandas shares the same backend as PyArrow and Polars, you should never convert a Pandas dataframe to PyArrow/Polars _just_ to write it. That’s just adding complexity and additional overhead. 

If you’re dead-set on PyArrow-based libraries:

* With Pandas, if `df.parquet()` does the trick, stick with it.

* If you’re using Polars, stick with Polars.

* If you need more granular control, toggling to PyArrow might be useful.

So that’s it for Part 2.
---
author: Matt Palmer
description: Tracking changes in real time with Databricks & Spark.
draft: false
featured: false
ogImage: ""
postSlug: scd-type-2
pubDatetime: 2021-04-27 00:00:00
tags: [data, spark, delta]
title: Building a SCD Type-2 table with Databricks Delta Lake & Spark Streaming
emoji: 😵‍💫
---

### Background

A common problem with visitor tracking is the inability to follow users across multiple devices. Even on the same device, should a visitor choose to clear their cookies, we will be unable to link them to their previous session. Unfortunately, that means processes that treat visitor cookies as unique visitors are imperfect.

For example, A/B test bucketing will be affected, even if acutely, by those visitors switching devices, clearing cookies, or using adblockers. Some users will see multiple experiences and conversions will be attributed to the wrong variant. We simply treat this as noise in experiment and control, demanding a larger sample size.

While this is an unavoidable issue, there is one place where we can link visitor cookies— when they have an account on the site and log-in via multiple sessions. In these instances, it should be possible to generate a "change log" of visitor cookies for a given user. In practice, the result would be an [SCD Type-2 Table](https://en.wikipedia.org/wiki/Slowly_changing_dimension#Type_2:_add_new_row), with visitor cookie as the primary ID and a changing column of userids. That way, we can simply join in on visitor cookie id to get a relevant user for a given timeframe.

<figure>
  <img src="/src/assets/posts/visitor-lookup/IMG_01.jpg" alt="Example behavior of SCD Type-2"/>
  <figcaption><i><center>An example SCD Type-2 entry for a visitor switching userids</center></i></figcaption>
</figure>

While this doesn't solve any issues for those visitors who never create an account (or don't log-in), it does allow us to be more precise with attribution and backfilling userids in any spot where they're otherwise unavailable.

### Solution

An SCD Type-2 table is not terribly complex from a SQL standpoint, we can group by visitor cookie and window over all rows, finding differing userids, then setting appropriate start and end dates. That was our first solution.

While it worked for a while, the underlying data actually contained all of the events on our site. As one can imagine, this is quite a costly operation. Job times quickly surpassed a hour, as the entire table was dropped and rebuilt nightly. The process was inefficient and would quickly become untenable as the visitors on our site increased.

In theory, there should be an append-only way to update the table. Storyblocks uses [Databricks Delta Lake](https://databricks.com/product/delta-lake-on-databricks), which supports a number of reliability features and enhancements, but also allows us to use Spark streaming. The ideal end product would be a streaming job, which reads from our incoming events, looks at visitor cookies & userids, and outputs that information as a change log to an SCD Type-2 table in Delta Lake. From there, we can pass that table on to our data warehouse (Amazon Redshift) or use it in Delta for further processing. Sounds simple, right?

For our solution the follow attributes were necessary:

- SCD Type-2 format (duh).
- Row 1 for a cookie must have a `valid_start_date` equal to the first date for that visitor(!) This introduces significant complexity.
- The `valid_end_date` for the `current` row will be the timestamp of the last run of the script.
- We'll keep a record of _all_ visitors, even those without a userid (it'll be set to `NULL`).
- A given `valid_end_date` must be 1 microsecond less than the next `valid_start_date` to prevent two values from being equal.
- The table should be partitioned somehow.

### Implementation

It quickly became evident that a real-time stream was impractical:

1. Most of our production jobs are semi-streaming and run on 10-15 minute intervals making a true stream overkill.
2. New data depends on existing values: updating our records depends on if we get a new userid/cookie pair or not.
3. Processing _all_ event data for _all_ visitors could be costly. While technically we only need visitors with a userid, the scope of the project required all visitor cookies to be processed (discussed later).

Because of #1, we knew that the solution wouldn't need to be a true stream. As a result of #2, it became evident that it couldn't really be a stream at all. Implementing a solution that, for each row, checks existing data & performs either an `UPDATE` or `MERGE` is not possible using PySpark (I couldn't crack it, at least). There is, however, a process that allows us to attain pseudo-streaming behavior while ticking our requirements: a combination of Spark [`forEachBatch`](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html#foreachbatch) and Databricks [`MERGE INTO`](https://docs.databricks.com/spark/latest/spark-sql/language-manual/delta-merge-into.html).

This is a known implementation, but Delta documentation only provides [very simple examples](https://docs.delta.io/0.8.0/delta-update.html#upsert-from-streaming-queries-using-foreachbatch). The basic premise is as follows:

1. Create a stream of the data we'd like to transform. Previously, we were using _all_ events. For this implementation, pageviews will suffice.
2. Batch the stream up using some option like `maxFilesPerTrigger`. The stream will also do this automatically.
3. _For each batch_ execute some transformation or SQL that will `MERGE INTO` a data source.

The really cool thing about `MERGE INTO`, often referred to as `UPSERT`, is that it allows you to both update and insert in one transaction. As I mentioned, this is crucial for our implementation, since we need to:

1. Take each batch of data and generate a SCD Type-2 dataframe to insert into our table.
2. Check if current cookie/user pairs exist in our table.
3. Perform relevant updates and/or inserts.

#2 introduces significant complexity. For a given pair, _if_ the same pair is current, we need only update the `valid_end_date`. However, if there's a new pair, we need to update the end data _and_ insert the new row(s). This is further complicated by the fact that `UPSERT` can't perform multiple operations on one row. We'll need to split the data into rows that need to be updated and rows to be inserted.

Additional complexity is added by including all visitors to the site. For users only, the streaming job is relatively small. Adding visitors increases the number of rows by roughly two orders of magnitude. After many failed attempts and much deliberation, the best method appeared to be first generating an SCD Type-2 table for visitors with a userid only, then using another data source to meet our additional requirements. Both will be discussed here.

### Creating a SCD Type-2 table for users

The much easier part of this process was creating a change-log table for users only (still at the cookie level), with no adjustments to the first date for the visitor. This idea is very easy to express in SQL— a simple window would suffice, but is more challenging in spark streaming.

#### forEachBatch

Since our events infrastructure at Storyblocks is not-quite-realtime (pageviews update every 15 minutes, I believe), we could save costs with a job that runs a few times daily. `forEachBatch` is a nice alternative to pure streaming, since we can perform aggregations on batches that would otherwise prove difficult in a stream. In order to use the sink, we define a function to be executed on each "batch." It's then as simple as passing that function to the `writeStream` in our job. You can use `maxFilesPerTrigger` to specify how many files pass through on each batch or `trigger(once=True)` to limit a run to one batch.

Typically, I'll rebuild the table using an appropriate `maxFilesPerTrigger`. Once the job is set, I'll switch to triggering once— that way we can run the notebook on a schedule and the cell will terminate once the streaming has completed. I haven't found a way to terminate a cell in a streaming job once all current data has been processed, unfortunately.

```
user_mapping = (spark
                  .readStream
#                   .option('maxFilesPerTrigger', 1000)
                  .format('delta')
                  .table([page view table])
                  .writeStream
                  .option([checkpoint location])
                  .trigger(once=True)
                  .foreachBatch(user_mapping_upsert)
                  .outputMode('update')
                  .start()
                )
```

Defining the function itself is very straightforward. The only real call-out is that, if using SQL, be sure to preserve the `sparkSession` of the temporary table you create:

```
def user_mapping_upsert(microBatchOutputDF, batchId):

    microBatchOutputDF.createOrReplaceTempView("updates")

    microBatchOutputDF._jdf.sparkSession().sql(...
```

Now we just need the `MERGE INTO` for each batch.

#### Databricks Upsert

Databricks has some [pretty good documentation](https://docs.databricks.com/spark/latest/spark-sql/language-manual/delta-merge-into.html) here and seems to be adding features fairly regularly. [This example](https://docs.databricks.com/delta/delta-update.html#upsert-from-streaming-queries-using-foreachbatch) provided the inspiration for this entire project. An immensely helpful feature would be the ability to perform multiple actions for each row. For example, when matched `INSERT` row _and_ `UPDATE SET` another row. Presently, we're limited to inserting _only_ `WHEN NOT MATCHED` and updating or deleting `WHEN MATCHED`. This added some complexity to our solution.

Since each upsert is being performed on a "batch" of pageviews, our goal was to replicate functionality of a changelog within each batch, e.g. one batch of pageview output should look exactly like the end-product, then assimilate those batches on a per-cookie basis into our table. There will be some joins to a table called `first_dates`, that will be discussed later. Note: most of this is pseudo-code intended to get my point across without relaying too much information about our tables. 🙂

In the first CTE, we can generate some basic info on a cookie/user basis, like the previous userid, the next userid, if it's a first visit for a given cookie, if the userid is new or seen, etc. This stream is limited only to cookies with a userid, so we don't have to worry about `NULL` values. `landed ` is our timestamp column.

```
MERGE INTO dev.user_mapping AS v
    USING (
         -- selecting records from pageviews and marking uid changes
      WITH get_visitor_characteristics AS (
          -- pull characteristics from pageviews stream

          SELECT
            u.visitorCookieId
            , u.userId
            , u.landed

            -- windows
            , LAG(u.userid) OVER (PARTITION BY u.visitorCookieId ORDER BY u.landed ASC) as prevUid
            , LEAD(u.userid) OVER (PARTITION BY u.visitorCookieId ORDER BY u.landed ASC) as nextUid

            -- spark hates aliases, sorry
            , CASE WHEN LAG(u.userid) OVER (PARTITION BY u.visitorCookieId ORDER BY u.landed ASC) IS NULL
                THEN TRUE ELSE FALSE END as isFirstVisit

            , CASE WHEN LAG(u.userid) OVER (PARTITION BY u.visitorCookieId ORDER BY u.landed ASC) <> u.userId
                  AND LEAD(u.userid) OVER (PARTITION BY u.visitorCookieId ORDER BY u.landed ASC) IS NOT NULL
                    THEN TRUE ELSE FALSE END as isNewUid

          FROM updates AS u
          WHERE 1 = 1
      )
```

Less-than-ideal aliasing in Hive SQL makes for some long column syntax. The next CTE takes those attributes and flattens them, assigning a start and end date based on userid changes. Limiting to `isNewUid` or `isFirstVisit` ensures there aren't back-to-back rows with the same userid.

```
, collapse_visitors AS (

          -- We have to flatten updates to make sure there aren't two records for a given vcid in a batch.
          -- Here, we getting distinct records with a uid change and assign a validStartDate and validEndDate

          SELECT
            gvc.visitorCookieId
            , gvc.userId
            , gvc.landed as validStartDate

            -- windows
            , LEAD(gvc.landed) OVER (PARTITION BY gvc.visitorcookieid ORDER BY gvc.landed ASC) as validEndDate

            , CASE WHEN LEAD(gvc.landed)
                OVER (PARTITION BY gvc.visitorcookieid ORDER BY gvc.landed ASC) IS NULL
                  THEN TRUE ELSE FALSE END as isCurrent

            , RANK() OVER (PARTITION BY visitorCookieId ORDER BY gvc.landed ASC) as updateRank
          FROM get_visitor_characteristics gvc
          WHERE 1 = 1
              AND gvc.isNewUid OR gvc.isFirstVisit
          ORDER BY visitorcookieid, landed DESC
      )

```

Now, we need to finesse databricks features a bit. Since upsert is limited by the number of operations performed on each row, we'll split the data into two camps:

1. Update existing rows. Note: this should only happen for existing cookies.
2. Insert new rows. This operation will be performed for old and new cookies.

This will require a join to the very table we're inserting, which is possible through `forEachBatch`! To accomplish the desired behavior, we'll define a `mergeKey` that determines what will be inserted. Basically, we're selectively duplicating data. For data to be inserted (no matter what) we set the `mergeKey` to be `NULL`. For data to be matched (or inserted if no existing cookie is found), the `mergeKey` can be the cookie.

```
), segment_update_and_insert AS (

          -- updates existing uids
          SELECT
            -- mergeKey lets us chose what is matched and thus inserted
            cv.visitorCookieId as mergeKey

            , cv.visitorCookieId
            , cv.userId
            , cv.validStartDate
            , CASE WHEN cv.validEndDate IS NULL THEN NULL
                     ELSE (cv.validEndDate - INTERVAL '1 microsecond') END as validEndDate

            -- windows
            , MAX(cv.updateRank) OVER (PARTITION BY cv.visitorCookieId) as maxUpdateRank

            , MIN(CASE WHEN cv.userId <> vm.user_id OR vm.user_id IS NULL THEN updateRank ELSE NULL END)
                OVER (PARTITION BY cv.visitorCookieId) as minUnequalUidUpdateRank

            , CASE WHEN vm.visitor_cookie_id IS NULL THEN TRUE ELSE FALSE END as isNewVcid

            , CASE WHEN vm.user_id IS NULL AND cv.userId IS NOT NULL THEN TRUE ELSE FALSE END as isFirstTimeUid

          FROM collapse_visitors AS cv
          -- LEFT JOIN vm to grab the minUnequalUpdateRank and isNewVcid
          LEFT JOIN dev.user_mapping AS vm
              ON vm.is_current
              AND cv.visitorCookieId = vm.visitor_cookie_id
          WHERE 1 = 1

          UNION ALL

          -- inserts changes (uid) for existing vcids
          SELECT
            NULL as mergeKey
            , cv.visitorCookieId
            , cv.userId
            , cv.validStartDate
            , CASE WHEN cv.validEndDate IS NULL THEN NULL
                    ELSE (cv.validEndDate - INTERVAL '1 microsecond') END as validEndDate

            -- windows
            , MAX(cv.updateRank) OVER (PARTITION BY cv.visitorCookieId) as maxUpdateRank

            , MIN(CASE WHEN cv.userId <> vm.user_id THEN updateRank ELSE NULL END)
                OVER (PARTITION BY cv.visitorCookieId) as minUnequalUidUpdateRank

            , CASE WHEN vm.visitor_cookie_id IS NULL THEN TRUE ELSE FALSE END as isNewVcid

            , False as isFirstTimeUid

          FROM collapse_visitors AS cv
          -- inner joining vm— we only want to update existing rows with a userid, all others will be inserted in the other SELECT
          INNER JOIN dev.user_mapping AS vm
              ON vm.is_current
              AND cv.visitorCookieId = vm.visitor_cookie_id
          WHERE 1 = 1
          -- we want all change data UNLESS the first row uid is equal to what we already have.
              AND NOT (cv.userId = vm.user_id AND cv.updateRank = 1)
          ORDER BY mergeKey, validStartDate ASC
      )
```

Especially important is the filter on the second union— `AND NOT (cv.userId = vm.user_id AND cv.updateRank = 1)`. This ensures that if a visitor _returns_ to the site with the same userid in a batch then switches to a new userid, we won't record the duplicate id, but we will capture the change. The left join and inner join help to select pertinent data from each source, but there is still more filtering to be done. Note the use of `updateRank` to get a `maxUpdateRank` and a `minUnequalUidUpdateRank`. To avoid overlap, we set the `validEndDate` as one microsecond less the previous start date. Now we can select from that data with an admittedly complex filter to get only the rows we desire.

```
, final_select AS (
      SELECT
        sui.mergeKey
        , sui.visitorCookieId
        , sui.userId

        -- IF the new user was previously a visitor, we want to change the first validStartDate to be the first visitor date.
        , sui.validStartDate
        , sui.validEndDate
        , sui.isCurrent

      FROM segment_update_and_insert AS sui
      WHERE 1 = 1
       AND (mergeKey IS NULL
       -- NOTE: these filters are for the first select in segment_update_and_insert
             OR (mergeKey IS NOT NULL
               AND (sui.isNewVcid
                 OR sui.updateRank = sui.minUnequalUidUpdateRank
                   )
                )
            )
    )
```

The filter `WHERE` clause is basically saying, "Insert all of the rows we said, but for the matched rows only select those that are new visitors or those where we see the first userid change based on existing data." Now, we take this big 'ol query and insert on `mergeKey` (and our partition `vcid_first_two`).

```
) AS up
    ON (v.vcid_first_two = up.vcid_first_two AND v.visitor_cookie_id = up.mergeKey)
```

The last bit of complexity comes from the update statement:

```
-- these rows are included in the first select of segment_update_and_insert
    WHEN MATCHED
      AND v.user_id <> up.userId
      AND v.is_current
    THEN UPDATE SET v.valid_end_date = (up.validStartDate - INTERVAL '1 microsecond'), v.is_current = False

    -- this statement applies to all new vcid's and any vcid where we set mergeKey IS NULL
    WHEN NOT MATCHED THEN
      INSERT (visitor_cookie_id
              , user_id
              , valid_start_date
              , valid_end_date
              , is_current
              , vcid_first_two
              )
      VALUES (up.visitorCookieId
              , up.userId
              , up.validStartDate
              , up.validEndDate
              , up.isCurrent
              , up.vcid_first_two
              )
        """)
```

When we match a userid in the existing table that is current and we have a differing userid incoming, we'll need to set the end date to match the rest of our table. This is why matched rows are filtered to `sui.updateRank = sui.minUnequalUidUpdateRank`. When not matched, we can insert the new values. Applying this SQL to each batch of a pageviews stream results in a changelog for every visitor with a userid.

### Using a _Visitor First Dates_ table to meet project requirements

Due to infrastructure demands, we need a few more things from the output generated by mapping users.

1. We need the very first `valid_start_date` to be the first timestamp we saw the _visitor_, not the user. That means we'll need pageviews with `NULL` userids, too.
2. For every visitor _without_ a userid, we want their first timestamp and a `NULL` for userid.

While simple, these changes require us from gathering info for users to _all visitors_, which is about a two order of magnitude increase in total visitor count.

```
def first_dates_upsert(microBatchOutputDF, batchId):

    microBatchOutputDF.createOrReplaceTempView("updates")

    # pass spark sql. Note: ._jdf.sparkSession() is necessary, as we have to use the same session as
    # the createOrReplaceTempView command above
    microBatchOutputDF._jdf.sparkSession().sql(f"""
    MERGE INTO dev.first_dates AS t
    USING (
    WITH visitor_characteristics AS (
      -- we want each vcid, landed, and the first non-null value for visitor properties. ORDER BY () IS NULL + landed guarantees NULLS last.
      SELECT
        visitorCookieId
        , landed
        , MIN(u.landed) OVER (PARTITION BY u.visitorCookieId) as firstDate
      FROM updates AS u
      WHERE 1 = 1
      )
      -- collapse to first date (one row per vcid)
      SELECT
        DISTINCT v.visitorCookieId
        , v.firstDate
        , date_format(v.firstDate, 'yyyy-MM-dd') as firstDay
        , LEFT(v.visitorCookieId, 2) as vcid_first_two
      FROM visitor_characteristics AS v
      GROUP BY 1,2,3,4,5,6,7,8,9,10
    ) AS s
    ON (s.vcid_first_two = LEFT(t.visitor_cookie_id, 2) AND t.visitor_cookie_id = s.visitorCookieId)

    WHEN MATCHED
      AND s.vcid_first_two = LEFT(t.visitor_cookie_id, 2)
      AND s.firstDate < t.first_date
    THEN UPDATE SET t.first_date = s.firstDate, t.first_day = s.firstDay

    -- only insert new values
    WHEN NOT MATCHED THEN
      INSERT (visitor_cookie_id
              , first_date
              , first_day
              , vcid_first_two
              )
      VALUES (s.visitorCookieId
              , s.firstDate
              , s.firstDay
              , s.vcid_first_two
              )
        """)
```

We can achieve this by again using `UPSERT` with `forEachBatch` to create a visitor log of first dates. Streaming off pageviews, we'll window over all rows in the update, getting the first non-null value for each desired characteristic. Collapsing the data to a single row per cookie allows us to merge into existing data.

Though the stream should process in order, we can add an update condition to retroactively correct dates if an earlier timestamp is found. If not, we'll insert.

For our user mapping upsert, we can add in a clause to check and apply the first date for pertinent rows. Now, the first row will have the desired timestamp.

```
, CASE WHEN (sui.isNewVcid OR sui.isFirstTimeUid)
                  AND sui.updateRank = sui.minUnequalUidUpdateRank
               THEN LEAST(sui.validStartDate, sui.firstDate) ELSE sui.validStartDate END as validStartDate
```

In order to assimilate our data into the desired format, a final `MERGE INTO` will be used once both streams have been completed. By using string formatting, we can insert timestamps to ensure only the most recent batch is inserted. Note, the logic and behavior here is slightly different than our user mapping example.

```
merge_into = f"""
MERGE INTO dev.visitor_lookup v
USING (
  WITH union_visitors AS (
    SELECT
      u.visitor_cookie_id
      , u.user_id
      , u.valid_start_date
      , u.valid_end_date
      , u.is_current

      , u.first_date
      , u.start_day
      , RANK() OVER (PARTITION BY visitor_cookie_id ORDER BY valid_start_date asc) as update_rank
    FROM dev.user_mapping u
    WHERE 1 = 1
      AND u.valid_start_date > '{max_lookup_timestamp}'
      AND u.valid_start_date <= '{max_first_date_timestamp}'

    UNION ALL

    SELECT
      f.visitor_cookie_id
      , NULL as user_id
      , f.first_date as valid_start_date
      , NULL as valid_end_date
      , TRUE as is_current

      , f.first_date
      , date_format(f.first_date, 'yyyy-MM-dd') as start_day
      , 1 as update_rank
    FROM dev.first_dates f
    LEFT JOIN dev.user_mapping u
      ON f.vcid_first_two = u.vcid_first_two
      AND u.is_current
      AND f.visitor_cookie_id = u.visitor_cookie_id
    WHERE 1 = 1
      AND u.visitor_cookie_id IS NULL
      AND f.first_date > '{max_lookup_timestamp}'
      AND f.first_date <= '{max_first_date_timestamp}'
  )
  -- insert all rows EXCEPT for existing vcid's with NULL user_id's
  -- we only want to update those (next union)
  SELECT
    NULL as merge_key
    , update_rank
    , u.visitor_cookie_id
    , u.user_id
    , u.valid_start_date
    , CASE WHEN u.is_current THEN NULL ELSE u.valid_end_date END as valid_end_date
    , u.is_current

    , u.start_day
    , LEFT(u.visitor_cookie_id, 2) AS vcid_first_two
  FROM union_visitors u
  LEFT JOIN dev.visitor_lookup v
    ON LEFT(u.visitor_cookie_id, 2) = v.vcid_first_two
    AND v.is_current
    AND v.visitor_cookie_id = u.visitor_cookie_id
  WHERE 1 = 1
    AND NOT (
      u.update_rank = 1
      AND u.user_id IS NOT NULL
      AND v.visitor_cookie_id IS NOT NULL
      AND v.user_id IS NULL
            )

  UNION ALL

  -- dupe first update row to change existing rows
  -- we want to update old CURRENT user_id rows and rows with a NULL user_id
  SELECT
    u.visitor_cookie_id as merge_key
    , update_rank
    , u.visitor_cookie_id
    , u.user_id
    , u.valid_start_date
    , CASE WHEN u.is_current THEN NULL ELSE u.valid_end_date END as valid_end_date
    , u.is_current

    , u.start_day
    , LEFT(u.visitor_cookie_id, 2) AS vcid_first_two
  FROM union_visitors u
  LEFT JOIN dev.visitor_lookup v
    ON LEFT(u.visitor_cookie_id, 2) = v.vcid_first_two
    AND v.is_current
    AND v.visitor_cookie_id = u.visitor_cookie_id
  WHERE 1 = 1
    AND u.update_rank = 1
    AND u.user_id IS NOT NULL
    AND v.visitor_cookie_id IS NOT NULL
) AS up
ON (up.vcid_first_two = v.vcid_first_two AND up.merge_key = v.visitor_cookie_id)

WHEN MATCHED
  AND v.is_current
  AND v.user_id IS NOT NULL
THEN UPDATE SET
  v.valid_end_date = up.valid_start_date - INTERVAL '1 microsecond'
  , v.is_current = FALSE

WHEN MATCHED
  AND v.is_current
  AND v.user_id IS NULL
THEN UPDATE SET
  v.valid_end_date = up.valid_end_date
  , v.is_current = up.is_current
  , v.user_id = up.user_id

WHEN NOT MATCHED
THEN INSERT (visitor_cookie_id
        , user_id
        , valid_start_date
        , valid_end_date
        , is_current
        , start_day
        , vcid_first_two
        )

VALUES (up.visitor_cookie_id
        , up.user_id
        , up.valid_start_date
        , up.valid_end_date
        , up.is_current
        , up.start_day
        , up.vcid_first_two
        )
"""

spark.sql(merge_into)
```

Lastly, current row timestamps are updated

```
spark.sql(f"""
            UPDATE dev.visitor_lookup
            SET valid_end_date = '{max_first_date_timestamp}'
            WHERE is_current
          """)
```

Finally, we have a working _visitor lookup_ table with all of the necessary attributes.

### Partitioning

All tables were initially partitioned on date— this is Storyblocks' convention for event tables. This proved quite problematic and slow for a few reasons.

1. We had to disable parallelism for ordered processing of data. Partitioning on date implies that writing to multiple partitions processes multiple dates, which breaks a table like this one since we rely on ordered processing of batches.
2. Most joins in our create script are on cookie. To get any benefit out of our partitioning, we needed to add range joins on both date and timestamp, which was cumbersome and confusing.
3. I have fears that as we scale, there will become an increasingly skewed number of visitors by date. Partitioning by cookie ensures no partition skew, since cookies are evenly distributed.
4. We can directly control the number of partitions by using 1, 2,or 3 characters of the visitor cookie. Date partitioned tables will have linearly increasing partitions.

Switching to partitioning by the first two characters of visitor cookie drastically improved the performance or our script and makes sense for the type of joins that we'll primarily use on this table.

### Schematic

I'm sure that wasn't entirely clear, so here's a brief diagram explaining the process:

<figure>
  <img src="/src/assets/posts/visitor-lookup/visitor_lookup.png" alt="Execution schematic"/>
  <figcaption><i><center>An example SCD Type-2 entry for a visitor switching userids</center></i></figcaption>
</figure>

### Applications

1. We're currently using the script as a part of our new _attribution_ framework for measuring marketing spend and conversion. The output table is joined to visitor lookup to backfill user id's and track conversions prior to registration on site. This has resulted in tangibly better tracking, picking up 65% more user sessions over our old method and having real impacts on how marketing makes spending decisions.
2. The same use case can be applied to backfilling AB Testing user id's (and it will be, hopefully)

### Checks and tests

There's no doubt this is a _very very_ complex solution. Honestly, I'd prefer a simpler method and I think one _should_ exist. If we were able to process each row individually, there might be a much better way to achieve the same result.

Unfortunately, after much trial and error this was the best result I could come to. I periodically run some of the following checks to make sure the script is working as expected:

**Start lag:** for each visitor cookie, is the previous valid_end_date equal to the valid_start_date - 1 microsecond?

```
%sql
WITH start_lag AS (
SELECT
  visitor_cookie_id
  , valid_start_date
  , valid_end_date
  , LAG(valid_end_date) OVER (PARTITION BY visitor_cookie_id ORDER BY valid_start_date ASC) as start_lag
FROM dev.visitor_lookup
WHERE 1 = 1
  AND user_id IS NOT NULL
)
SELECT
  visitor_cookie_id
  , valid_start_date
  , valid_end_date
  , start_lag
FROM start_lag AS sl
WHERE 1 = 1
  AND start_lag IS NOT NULL AND valid_end_date IS NOT NULL AND start_lag <> valid_start_date - INTERVAL '1 microsecond'
  AND start_lag < current_date - 1
```

**Current count:** does each cookie have only one current row?

```
%sql
SELECT
  visitor_cookie_id
  , COUNT(CASE WHEN is_current THEN visitor_cookie_id END) as current_count
FROM dev.visitor_lookup
WHERE 1 = 1
GROUP BY 1
HAVING current_count <> 1
```

**Start dates:** are there duplicated start dates for any cookies? _Note: there is one cookie that has two start dates... This is pretty bizarre, but it happens even when I rebuild the table. I'm not concerned given the rarity, but it is curious._

```
%sql
SELECT
  visitor_cookie_id
  , valid_start_date
  , COUNT(*) as current_count
FROM dev.visitor_lookup
WHERE 1 = 1
GROUP BY 1,2
HAVING current_count <> 1
```

**End dates:** are any end dates before start dates? _Again, for the same cookie there are two user id's with end dates one microsecond prior to start. It might be worth investigating the behavior of this visitor to find out how this happened!_

```
%sql
SELECT
  *
FROM dev.visitor_lookup
WHERE 1 = 1
  AND valid_end_date < valid_start_date
```

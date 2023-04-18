---
author: Matt Palmer
description: Airflow is obsolete, but here's why you should still use it.
draft: false
featured: true
ogImage: ""
postSlug: making-the-most-of-airflow
pubDatetime: 2023-04-22 00:00:00
tags: [data, opinion, guide]
title: Making the Most of Airflow
emoji: 🧂🤝
---

## ToC

## ◽️ Shades of Grey

In my last post, [🌶️ Hot Takes on the Modern Data Stack](/posts/hot-takes), I presented my opinions in a raw, unfiltered format. Rather than diving into nuance, I opted for starkness & contrast. Of course, the truth is never black and white, rather, varying shades of grey. While "hot takes" are fun and generate a buzz, they might be misleading.

One specific point of contention was **[Apache Airflow](https://airflow.apache.org/)**.

My perspective is one of a data engineer on a small team, who's able to implement _any_ open source tool I choose. As a small team, we have minimal tech debt and existing infrastructure can easily be migrated— what a luxury! Hopefully, it isn't difficult to see why Airflow isn't a top choice. There are so many tools that can move faster, have better support, come with advanced functionality out-of-the-box, etc.

For many, however, this **is not** reality. Perhaps you're on an established team with hundreds of DAGs, or your org is one of many using hosted Airflow, which is available on _every_ major cloud provider ([Amazon](https://aws.amazon.com/managed-workflows-for-apache-airflow/) / [Google](https://cloud.google.com/composer) / [Azure](https://learn.microsoft.com/en-us/azure/data-factory/concept-managed-airflow)).

Due to the popularity, adoption, and momentum of Airflow, it will be around for years, if not decades, regardless of competition. For the same reasons, understanding **how Airflow works** can be a game-changer for data engineers— upskilling popular tools improves marketability and potential impact. Hence, there are some direct and quite a few indirect reasons to know how Airflow works, at a minimum.

Last week, I sat down with [Daniel Imberman](https://www.linkedin.com/in/danielimberman/), who walked me through some features of the [AstroSDK](https://github.com/astronomer/astro-sdk). Our conversation opened my eyes to potential solutions for common problems in Airflow. While I was writing this post, [Jake Watson](https://www.linkedin.com/in/jake-watson-data/) reached out about a [very similar peice](https://thedataplatform.substack.com/p/why-airflow-sometimes-wins). I agree with many of Jake's points and hope to extend his argument on why Airflow "sometimes wins."

My goal this week is to give Airflow a fair shake and talk about how **you** can make the most of **your** Airflow deployment to build robust, production-ready DAGs.

## 👨🏻‍🔬 Let's Make the Most of It

Quite a bit has changed in the last few versions of Airflow— thought the [TaskFlow API was released in December 2020](https://airflow.apache.org/blog/airflow-two-point-oh-is-here/), the Airflow team has continued to provide improved functionality that competes with newer orchestrators (Dagster, Prefect, Mage) on a number of fronts, [fixing bugs and expanding the scope of Dynamic Task Mapping](https://github.com/apache/airflow/pulls?q=is%3Apr+author%3Auranusjr+is%3Aclosed+milestone%3A%22Airflow+2.5.0%22).

Much of this new functionality can be used to provide a smoother experience during development and improve code testability. Coupled with some external libraries, we can _make the most of Airflow_ by adhering to best practices.

**Here are a few common Airflow problems & my proposed solutions.**

### 🏗️ DAG Structure

I think one of the most _important_ aspects of DAG creation is structure— DAGs should be standardized as much as possible, prioritizing readability and consistency.

Perhaps the biggest weakness of Airflow is also it's biggest strength: _possibility_. Airflow revolutionized orchestration by providing engineers with a blank canvas— a `.py` file where they could do _whatever they want_. Unfortunately, it was introduced without any framework for modularity or testing.

The result? Without the discipline and rigor to standardize a deployment, DAGs can quickly turn into untested scripts.

![](/posts/making-the-most-of-airflow/seinfeld.gif)

**Solution:** DAG Templates

Luckily, simply using TaskFlow is a great start! In my own projects, I start from a template— pretty much _every_ job follows an extract-transform-load pattern that can be mapped to a few tasks. If not, the beauty of Airflow is that structure is completely mutable, but starting from basic, familiar components will reduce complexity in your DAGs and make them easier to interpret.

Here's my basic DAG template for a classic ETL job:

```python
import datetime
import logging
from airflow.operators.empty import EmptyOperator
from airflow.decorators import dag, task, task_group
from airflow.providers.amazon.aws.hooks.s3 import S3Hook

S3_BUCKET = Variable.get("S3_BUCKET", default_var=None)

logger = logging.getLogger("airflow.task")
logging.basicConfig(level=logging.INFO)

default_args = {
    "owner": "data-engineering",
    "retries": 1,
    "retry_delay": datetime.timedelta(minutes=1),
    "trigger_rule": "all_success",
}

@dag(
    start_date=datetime.datetime(2022, 2, 1),
    description="This is a template DAG— it's the wild west! 🤠",
    schedule_interval=None,
    catchup=False,
    default_args=default_args,
    render_template_as_native_obj=True,
)
def dag_name():
    @task
    def extract(**context):
        pass

    @task
    def transform(**context):
        pass

    @task
    def load(**context):
        pass

    start = EmptyOperator(task_id="start")
    end = EmptyOperator(task_id="end")

    start >> extract() >> transform() >> load() >> end

dag_name = dag_name()

# If you found this code useful, follow for more! https://www.linkedin.com/in/matt-palmer/
```

Consider storing something similar in your project _or_ if you're fancy, building the template into a VSCode [Snippet](https://code.visualstudio.com/docs/editor/userdefinedsnippets). We'll talk more about development environments later. This can get more complex as your team grows, but the _best_ solution will be to introduce modularity into your Airflow project, as we'll discuss shortly.

**Solution:** Linting

Though linting will not solve all problems, consider a solution like [Black](https://pypi.org/project/black/) for keeping your `.py` files in check. Black is the golden standard of Python linting packages, bringing pragmatic, functional format to your code.

Using a formatter directly improves the readability of your code and creates a smooth experience for every developer on your team. Black formatted code looks the same, regardless of the project you're reading. Though _nothing_ needs to be configured with Black, it can be [configured](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html#configuration-via-a-file) via a `pyproject.toml` file.

I've been using Black in my projects, personal and professional, for the past few years and it's made a world of difference. If you're not using a code formatter, I _highly_ recommend it— for the sanity of everyone involved. 😀

### 🏜️ DRY Code

Perhaps one of the trickiest things with a blank canvas like Airflow— users are left on their own to manage code reusability. [DRY](https://www.digitalocean.com/community/tutorials/what-is-dry-development) (Don't Repeat Yourself) is a principal of software development, aimed at reducing redundancy and abstracting common code.

With regards to Airflow, as Jake Watson notes in [_Why Airflow (Sometimes) Wins_](https://thedataplatform.substack.com/p/why-airflow-sometimes-wins):

> Airflow operators are amazing as they are free with the Airflow service, and there are over [1000 operators](https://registry.astronomer.io/modules?types=operators) to choose from. On the other, they are [not as modular as they could be especially when it comes to data copying](https://airbyte.com/blog/airflow-etl-pipelines#airflow-operator-sources-and-destinations-are-tightly-coupled).

So we need some way to improve operator modularity, which is specific to each use-case. Ideally, this would look like defining packages and functions for common hooks/tasks: reading an object from S3, writing to parquet, etc. Practically, it ends up not happening at all _or_ falling apart during parallel development.

**Solution:** Airflow Tasks-as-a-Service (ATaaS)

The issue of DRY-ness can be addressed with an in-house solution, but who has time for that? The [AstroSDK](https://docs.astronomer.io/learn/astro-python-sdk#how-it-works) is a good example of a framework that makes DRY code simpler. An observant reader might notice the [available functions](https://docs.astronomer.io/learn/astro-python-sdk-etl#python-sdk-functions) fit into the framework I outlined above (we might be on to something 😉).

By abstracting away some raw python, the SDK allows users to simply and quickly define functions to:

- Extract data from a warehouse or cloud storage, like Snowflake or S3
- Perform SQL transformations on extracted data
- Convert data between common formats (dataframes, etc)

No more fiddling with `S3Hooks` or storing `BytesIO` objects (which ALWAYS befuddles me). Instead, we can take the [Data Architecture as a Service](https://www.eckerson.com/articles/data-architecture-as-a-service-liberation-for-data-users) (DAaaS) approach and apply it to Airflow Tasks (ATaaS? 🤔).

DAaaS applies mainly to the transformation (warehouse) layer, but operates under a building block approach— architects design SQL patterns that can be implemented by a wide audience, eliminating bottlenecks. We can do the same with Airflow— start with the _building blocks_ of a DAG instead of the DAG itself!

Define reusable imports to do things like write, read, and transform data using the AstroSDK, then pull those task "blocks" into your DAGs. Note that Astro's framework simplifies the process of transforming dags as well, by minimizing the friction to transforming in _either_ SQL or Python.

By following this pattern, you'll improve the DRY-ness of your code _and_ improve the efficacy of your data team:

- Junior engineers will benefit, as they can focus on implementing building blocks rather than writing them from scratch. This is easier to review and unblocks downstream work.
- Senior engineers will benefit, since they get to focus on patterns and architecture, ultimately amplifying their impact.
- The _team_ will benefit, since more work will get done, more problems will be solved, and everyone's time will be freed to pursue more meaningful projects, it's a win-win-win!

![](/posts/making-the-most-of-airflow/biden.gif)

Now THIS approach is DRY 💨. See [Astro's docs](https://docs.astronomer.io/learn/astro-python-sdk-etl#before-and-after-the-astro-python-sdk) for a great walkthrough of how you can simplify your DAGs.

These features are something tools like [Mage](https://mage.ai) or [Dagster](https://dagster.io/) do exceptionally well— they allow "architects" to create reusable blocks of code that are then stitched together by downstream users. The boon of newer tools like Mage: they have a user-friendly GUI and pre-built testing framework out-of-the-box. For those in Airflow-land, however, the AstroSDK is a great way to implement similar functionality on your own.

### 🧪 Testing

DAGs can be incredibly complex— at each step (task), the number of unknowns multiply. Now imagine 100 of these DAGs, all running nightly. It's not hard to see how a data engineer's job can quickly become hell— you might find yourself on-call at 3AM looking like this:

![](/posts/making-the-most-of-airflow/elmo.gif)

Trying to solve every problem at once is overwhelming and, quite frankly, not possible. We need to start from first principles: break the problem down and tackle it at the source.

**Solution:** Implement unit tests, assertions, & break-points.

Unit tests allow us to _be sure_ each component of a DAG is working exactly as we'd expect.

Using DRY code makes testing easier, since there are overall fewer functions to test! Best of all, code coverage is guaranteed when tested code is reused. It's best to write tests for hooks, operators, and other commonly used pieces of logic in your DAG.

With the AstroSDK, we can:

- Use `dag.test` to test individual components of a DAG, in effect creating "mini-DAGs."
- Incorporate local/dev versions of our data sources/targets _or_ use `unittests.mock`
  - In [this example](https://github.com/astronomer/astro-sdk/blob/main/python-sdk/tests/sql/operators/test_dataframe.py#L217-L237) from the AstroSDK, dataframes are being mocked with sample data, then a sample dag is created and validated.
  - In this [example](https://github.com/astronomer/astro-sdk/blob/main/python-sdk/tests/sql/operators/test_load_file.py#L48-L69), local files are used for testing.
- Use `pytest` to check inputs— see [this example](https://github.com/astronomer/astro-sdk/blob/main/python-sdk/tests/sql/operators/test_merge.py#L16-L53).

Additionally, with Airflow 2.5.0:

> Task logs are visible right there in the console, instead of hidden away inside the task log files b. It is about an order of magnitude quicker to run the tasks than before (i.e. it gets to running the task code so much quicker) c. Everything runs in one process, so you can put a breakpoint in your IDE, and configure it to run `airflow dags test <mydag>` then debug code!

Using the new testing framework, you can easily mock inputs, like execution date, local connections, and run configs. This is as simple as adding an `if __name__ == "__main__":` to the bottom of your DAG— you can then pass inputs using the `.test()` method, for example:

```python
...
dag_obj = my_dag()

if __name__ == "__main__":
  conn_path = "connections.yaml"
 variables_path = "variables.yaml"
  overwrite = True

  dag_obj.test(
   execution_date=datetime(2023, 1, 1),
    conn_file_path=conn_path,
    variable_file_path=variables_path,
    run_conf={'overwrite': overwrite}
  )

# If you found this code useful, follow for more! https://www.linkedin.com/in/matt-palmer/
```

Once again, our friends at Astronomer have a [great guide](https://docs.astronomer.io/learn/testing-airflow#use-dagtest-with-the-astro-cli) for the functionality. Tying these all together, we have a robust framework for improving code reusability and test coverage while minimizing the time to failure by introducing break-points and leveraging `airflow dags test`.

## 🎁 Wrap-up

### 🔄 Embrace iteration

In summary, Airflow, while not for everyone, can be used as an effective data orchestration/ELT tool. To do so, I recommend:

- Creating DAG templates and linting code standardizes DAG creation and makes work more accessible.
- Airflow Task-as-a-Service (ATaaS) patterns improve code DRY-ness and reduce the scope of that which must be tested.
- The AstroSDK extends Airflow to make ATaaS more accessible.
- Airflow 2.5.0 adds additional testing functionality that allows users to create mini-DAGs and more easily debug inputs.

Each of the above works to streamline the development process, reduce bottlenecks, and improve the developer feedback loop: **embracing iteration in Airflow.**

The goal in building _any_ new piece of code should be to reach failure as fast as possible. Getting down to the root of the issue with minimal friction will allow you to spend more time doing fun stuff (building solutions) and less time trying to recreate errors.

Optimizing for speed of failure can shorten the developer feedback loop and drastically improve your efficiency, creating more value and unlocking the power of your data team. 🏃‍♂️

### 🚪 Closing

There's no such thing as a perfect solution. Unfortunately, even when a great fit is found, implementations will be limited by dogma, politics, technical debt, security constraints, and deployment considerations.

Airflow, like dbt, was the first tool of it's kind and revolutionized data engineering. As a result of its popularity, many subsequent tools have built upon its strengths and minimized its flaws. Still, the momentum and ubiquity of Airflow make it the de-facto choice. Broad adoption means that understanding Airflow is **essential**— it will be around for quite some time.

Today, many opinions are presented without nuance or balance. I hope that this article provided a sufficient deep-dive to explore just how a tool like Airflow can be used effectively, bringing a balanced perspective to some of my earlier comments. Sometimes, "good enough" is better than "not at all." Until next time! ✌️

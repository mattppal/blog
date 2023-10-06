---
author: Matt Palmer
description: ""
draft: true
featured: false
ogImage: ""
postSlug: the-very-best-cohorted-retention-view
pubDatetime: 2021-11-16 00:00:00
tags: [data, analytics]
title: The very best cohorted retention view
emoji: 📈
---

Note: the cohort grid here was adapted from a very helpful [towards data science article](https://towardsdatascience.com/a-step-by-step-introduction-to-cohort-analysis-in-python-a2cbbd8460ea).

### Preface

A big part of product analytics is determining how adoption/usage is trending over time. A great way to track retention is a cohorted view— that is, for each day/week/month a user joins, how is that group of users engaging with the product? By divvying users up into cohorts, we can approximate how the performance of a feature changes in discreet buckets, without worrying about confounding variables.

A _cohorted retention chart_ plots cohorts by row and retention metrics by column, creating a grid. Highlighting the cohorts can visually depict how a product is changing over time:

<center>
<figure>
  <img src="../../assets/postscohorted-retention/cohort-grid.png" alt="Example user retention cohort grid."/>
  <figcaption><i><center>Cohort months and totals are displayed for each row, with retention highlighted and colored by column.</center></i></figcaption>
</figure>
</center>

### Generating cohorted views

My personal cohort function, using the `seaborn` library is:

```
def sns_cohort_grid(pivoted_df, total_df, title, xlabel=''):
    with sns.axes_style("white"):
        fig,ax = plt.subplots(1, 2, figsize=(20, 8), sharey=True, gridspec_kw={'width_ratios': [1, 11]})

        # retention matrix
        sns.heatmap(pivoted_df,
                    mask=pivoted_df.isnull(),
                    annot=True,
                    fmt='.0%',
                    cmap='YlGnBu',
                    ax=ax[1]
                    )

        ax[1].set_title(title, fontsize=16)
        ax[1].set(xlabel=xlabel,
                ylabel='')

        # cohort size
        white_cmap = mcolors.ListedColormap(['white'])
        sns.heatmap(total_df,
                    annot=True,
                    cbar=False,
                    fmt='g',
                    cmap=white_cmap,
                    ax=ax[0]
                    )

        fig.tight_layout()
```

This takes a `pivoted_df`, a `total_df`, a `title`, and an `xlabel` as arguments. The `pivoted_df` is a dataframe containing the necessary elements for the grid, pivoted in Pandas.

For example, if I had the following table, `cohort_df`:

| cohort     | tenure_months | users  | cohort_total | pct |
| ---------- | ------------- | ------ | ------------ | --- |
| 2021-09-01 | 0             | 100000 | 100000       | 1   |
| 2021-09-01 | 1             | 90000  | 100000       | .9  |
| 2021-09-01 | 2             | 60000  | 100000       | .6  |

I would pivot using:

`cohort_df.pivot('cohort', 'tenure_months', 'pct')`.

To obtain `total_df`, we can just apply a groupby to the cohorts:

`cohort_df[['cohort','cohort_total']].groupby('cohort').max()`.

Our output will then be similar to the image show earlier, albeit with a more pleasing color scheme. 🙂

A great way to visualize cohort grids is in a "Spaghetti" chart— plotting the retention of each cohort by month. While the charts can be quite busy, using a tool like Plotly Express allows you to isolate individual lines with one click, making the charts interactive and useful.

<center>
<figure>
  <img src="cohorted-retention/spaghetti.jpg" alt="Example spaghetti chart."/>
  <figcaption><i><center>Example spaghetti chart for cohorted retention view.</center></i></figcaption>
</figure>
</center>

Additional analysis around cohorts includes:

- **Averaging retention across months:** this involves weighting each line by the number of users in that cohort and flattening charts. Think of taking the cohort grid displayed above and squishing it vertically into a single row.
- **Segmenting by different attributes:** this is often difficult, as it involves rewriting queries/changing groups if you pulled the data yourself, but picking target variables (i.e. pro status, user behavior, seasonality) and generating weighted retention for each often highlights trends and helps visualize discrepancies.
- **Plotting tenure month performance by time:** what if we plotted only how tenure month 1 performed over time (cohort on x-axis)? What about tenure month 2? Do we see changes? What might be driving these?

An important call-out is that the total cohort size will influence retention. As with any product analysis, as the body of users changes, so does user-intent (the likelihood of the user to perform a certain action). If drastic population-level changes occur over the duration of the analysis, these should be communicated and adjusted for, if necessary.

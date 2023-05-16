---
author: Matt Palmer
description: An overview of duckdb and a neat trick 🦆
draft: true
featured: true
ogImage: ""
postSlug: data-is-a-meme
pubDatetime: 2023-05-24 00:08:27
tags: [data, tutorial]
title: One-line to partitioned parquet with DuckDB
emoji: 🐥
---

<style>
  img {
    width: auto;
    max-height: 400px;
    aspect-ratio: attr(width) / attr(height);
  }
</style>

## Duck, duck, goose

A few weeks ago I saw Daniel Beech's post: [DuckDB vs. Polars](https://www.confessionsofadataguy.com/duckdb-vs-polars-for-data-engineering/) which led me to experiment with DuckDB the same way he did. Since then, I've been fiddling with the tool and chatting with others— I've even given a few lightning talks on my learnings. Of course, I'd be remiss if I didn't share them with the world.

## What on Earth is DuckDB?

Well, according to their [website](https://duckdb.org/):

> DuckDB is an in-process SQL OLAP database management system

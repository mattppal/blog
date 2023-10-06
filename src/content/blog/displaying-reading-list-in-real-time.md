---
author: Matt Palmer
description: Using Jekyll hooks to dynamically generate site content via Github Actions.
draft: false
featured: false
ogImage: ""
postSlug: displaying-reading-list-in-real-time
pubDatetime: 2021-07-28 00:00:00
tags: [software, guides]
title: Realtime Reading Lists With Jekyll Hooks
emoji: 📕
---

### Note

This content is now outdated, as I've migrated my site over to [Astro](https://astro.build). I hope you can still find it helpful. Enjoy 🙂

<figure>
  <center><img src="/src/assets/posts/goodreads/header.png" alt="Currently Reading Header"/></center>
</figure>

### Preface

You may have noticed my fancy [books](/books) page, which contains an up-to-date list of what I'm reading and what I've finished. That page is powered by Goodreads and updates on a daily basis. Initially, I was updating the page manually with a local build of my site and a push to GitHub, but I wanted to automate it— I already log my books on Goodreads, why shouldn't that be the end of it?

Goodreads profiles can be public (and [my profile is](https://www.goodreads.com/user/show/89626431-matt-palmer)). With a bit of digging, you can find RSS feeds for Bookshelves, i.e. _Reading_, _Read_, _To-Read_. Once I had the links, I just needed to loop through the feed items + generate some Jekyll data and I'd be set, right?

### Reality check

In reality, the task is a little more complex. Here were the most prominent challenges:

1. Since I was building my site locally and pushing to GitHub pages, I would have to rebuild locally if I wanted the lists to update— that's no fun. This was resolved through GitHub actions, which I'll discuss shortly.
2. I initially went the route of using a Generator to build `YAML` files with the RSS items. That was problematic because of how Jekyll renders a website: Generators that fetch data and add it to the site are prioritized _after_ the site is rendered. In practice it meant I had to build my site twice locally for changes to propagate (once to change the files and a second time to actually see them rendered in the browser). Additionally, when using Generators with a GitHub action to build the site, I was unable to overwrite the necessary files in the master branch, so my solution was completely non-functional with a remote build!
3. There is remarkably little documentation/discussion on how or when to use a Generator, Hook, or other custom plugin. I ultimately found [this blog](https://humanwhocodes.com/blog/2019/04/jekyll-hooks-output-markdown/) helpful, along with the (sparse) Jekyll documentation on [hooks](https://jekyllrb.com/docs/plugins/hooks/) and [plugins](https://jekyllrb.com/docs/plugins/).

After my initial crack at Generator -> GitHub Action -> Reading List failed, I went back to the drawing board.

### The Solution

Until now, this post has been relatively boring with little useful information, so I'll try to make it worth your time.

My plugin needs to:

1. Run at build.
2. Fetch and parse items from my Goodreads feed.
3. Inject that into my site (somehow) so I can loop through them in a list with [Liquid](https://shopify.github.io/liquid/basics/introduction/).
4. Have the ability to run via a GitHub action, i.e. be a truly automated solution.

#### Fetching RSS items

This was surprisingly simple, considering I had no Ruby knowledge beforehand. I used _Open URI_ to get the URL, the _RSS_ library to parse the feeds, and _Nokogiri_ for some html parsing, thought that wasn't strictly necessary.

```
reading_url = [your-url-for-reading-books]
read_url = [your-url-for-read-books]

def get_rss_items(input_url)
    item_list = []
    URI.open(input_url) do |rss|
        feed = RSS::Parser.parse(rss)

        feed.items.each do |item|
            parsed = Nokogiri::HTML.parse(item.description)

            author = item.description.match(/author:\s*((\w|\s|\.|\/)*)/)[1]
            date_read = item.description.match(/read\s*at:\s*((\d|\/)*)/)[1]
            img_src = parsed.xpath("//img").attr('src').text
            url = parsed.xpath("//a").attr('href').text
            guid = item.link.split('/')[-1].split('?')[0]

            payload = {'title' => item.title,
                        'link' => url,
                        'img_src' => img_src,
                        'date_read' => item.pubDate.to_date,
                        'author' => author,
                        'guid' => guid
            }
            puts item.title
            item_list.append(payload)
        end
    end
    return item_list
end
```

We start by opening the URL as `rss`, then passing that variable to our parser. A simple Ruby loop says that, for each item in the feed, we want to parse the description and other attributes (using Nokogiri and some regex) and assign them to a payload. We then print the title to the logs and append the payload to our list. The function then returns that list. Now all we need to do is get that into our site!

#### Using GitHub Actions to build the site on a schedule

After a bit of Googling, I was able to find [this action](https://github.com/jeffreytse/jekyll-deploy-action) that automates Jekyll deploys. Setting it up is pretty simple.

1. Create a `YAML` file in your [GitHub pages repository](https://github.com/mattppal/mattppal.github.io/blob/master/.github/workflows/build-jekyll.yaml)
2. Configure the `YAML` file to your preferred settings using the action docs. Note: this changes how your GitHub page functions. Rather than queuing off a `master` branch, you're building the site, outputting it to a separate branch (`gh-pages` is the default) _then_ building the page off that branch. It requires messing around with some settings, but I found the author of the action's guide to be sufficient.
3. Run the action on a schedule!

Now that we have the action firing, the site is being built remotely! Cool! But it's completely indifferent from before— not cool!

#### Loading to site data pre-render

We need to get our Ruby function running at the point just before the site is built. That way, we can create a variable accessible to the site/page/doc to iterate through. digging through the [Jekyll docs](https://jekyllrb.com/docs/plugins/hooks/), I found the Hook page. From the syntax, it appears to do just what we want:

```
Jekyll::Hooks.register :site, :pre_render do |site|
  # code to call after Jekyll renders a page
end
```

Using the _site_ and _pre_render_ arguments, we should be able to generate content prior to rendering and make that available to the entire site!

Wrapping our function in the Hook register:

```
require 'rss'
require 'open-uri'
require 'yaml'
require 'nokogiri'

Jekyll::Hooks.register :site, :pre_render do |site, payload|
    reading_url = [your-url-for-reading-books]
    read_url = [your-url-for-read-books]

    def get_rss_items(input_url)
        item_list = []
        URI.open(input_url) do |rss|
            feed = RSS::Parser.parse(rss)
            # Add fake virtual documents to the collection
            feed.items.each do |item|
                parsed = Nokogiri::HTML.parse(item.description)

                author = item.description.match(/author:\s*((\w|\s|\.|\/)*)/)[1]
                date_read = item.description.match(/read\s*at:\s*((\d|\/)*)/)[1]
                img_src = parsed.xpath("//img").attr('src').text
                url = parsed.xpath("//a").attr('href').text
                guid = item.link.split('/')[-1].split('?')[0]

                payload = {'title' => item.title,
                            'link' => url,
                            'img_src' => img_src,
                            'date_read' => item.pubDate.to_date,
                            'author' => author,
                            'guid' => guid
                }
                puts item.title
                item_list.append(payload)
            end
        end
        return item_list
    end

    site.data['reading'] = get_rss_items(reading_url)
    site.data['read'] = get_rss_items(read_url)

end
```

Boom! Now we're storing our lists in `site.data['reading']` and `site.data['read']`, respectively. Saving this to a Ruby file and popping it in the `_plugins` directory make it run on every build. Now that the data is accessible to the site and pages therein, Liquid makes it simple to iterate through them. Since things are always changing, you can checkout my current Goodreads script [here](https://github.com/mattppal/mattppal.github.io/blob/master/_plugins/goodreads.rb).

```
<div>
{% raw %}{% for book in site.data['reading'] %}
    <a href= "{{ book.link }}">
      <div>
        <h5>{{ book.title }}</h5>
          <p>{{ book.author }}</p>
        <!-- <small>{{ book.date_read }}</small> -->
      </div>
    </a>
{% endfor %}{% endraw %}
</div>

## Read

<div>
{% raw %}{% for book in site.data['read'] %}
    <a href= "{{ book.link }}">
      <div>
        <h5>{{ book.title }}</h5>
          <p>{{ book.author }}</p>
        <!-- <small>{{ book.date_read }}</small> -->
      </div>
    </a>
{% endfor %}{% endraw %}
</div>
```

And voila! The [books](/books) page arrives at it's present form. Marking a book _read_ or _reading_ on Goodreads will flow through to the site nightly and 100% automatically!

I'd love to hear if you found this helpful or implemented your own solution. Don't hesitate to reach out via one of the links on-site!

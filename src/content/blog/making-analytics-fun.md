---
author: Matt Palmer
description: We might have 1099 problems, but an audit ain't one
draft: false
featured: false
ogImage: ""
postSlug: level-up-medallion-architecture
pubDatetime: 2023-10-02 05:00:00
tags: [data, tutorial, medallion, opinion, dataengineeringwiki]
title: Making Analytics Fun
emoji: 😃
---

In **[a recent post](https://benn.substack.com/p/the-end-of-our-purple-era?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)** , **[Mode](https://mode.com/?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)** founder Benn Stancil discusses the maturation of analytics as a profession _,_ drawing parallels between analytics and accounting. He makes an argument for the standardization of metrics (like Lever Lab’s **[SOMA](https://github.com/Levers-Labs/SOMA-B2B-SaaS?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)** ) in the same way that GAAP standardized accounting.

We were at our best when we weren't just building dashboards and mechanically tracking metrics; we were at our best when we were given vague problems, well-sourced data, and the time and tools to go exploring.

I appreciated the post and I fully agree that, yes, if we’re thinking from a “maturity” perspective and we want analytics to “grow up,” it would be logical to do so, but I disagree with the premise: who says we want to grow up?

## Searching for fun

One book that seems to resurface in my life every few months is Linus Torvalds’ _**[Just for Fun](https://amzn.to/3PHd5hQ?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)**._

The book, Torvalds’ personal recount of creating Linux, is interesting to me not just because of the unique story of Torvalds and his playful writing style, but because of his motivation: **fun.**

Now don’t get me wrong, no one is perfect and I don’t expect Torvalds to be, but I _do_ believe fun was one of his primary motivators, even if 💰 was another.

Absent entirely from Stancil’s argument is what it means to make analytics fun, which isn’t mutually exclusive from a set of accepted metrics. Sure, as the profession matures, there will be fewer generalists and more specialists, but product/analytics is inherently more _creative_ than accounting (I’m not sure exploratory data analysis has an accounting parallel).

Stancil briefly mentions creativity, but I think **that’s** the main component that differentiates accounting from analytics _and_ the piece that makes it a bit easier to look for fun in data.

## Learning to have fun

It’s a bit funny that I had to relearn “how to have fun.” When I think about what that phrase means, my perspective has changed drastically in the last half-decade.

I’ve always considered myself a driven, motivated person. I played baseball for the first 21 years of my life, trained with extreme passion (and still do, albeit at **[other endeavors](https://mattpalmer.io/about/?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun#Interests:~:text=can%20subscribe%20below%3A-,Interests,-%F0%9F%8F%8B%EF%B8%8F%E2%80%8D%E2%99%80%EF%B8%8F%E2%80%83strength%20training%0A%F0%9F%A5%99%E2%80%83nutrition)** ), and relentlessly pursued things I felt important to me.

I walked away from college with two degrees (now somewhat irrelevant 😅) and a trip to the **[D3 World Series](https://www.swarthmore.edu/news-events/baseball-wins-ncaa-regional-advances-to-division-iii-world-series?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)**. My enthusiasm and passion paid off in ways I didn’t think it could, but looking back on it, I’m not sure I really enjoyed myself until the very end.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0692722c-3c36-44e8-8f6b-27cdc9b5f8ea_1292x861.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0692722c-3c36-44e8-8f6b-27cdc9b5f8ea_1292x861.jpeg)

 _I suppose winning is fun, too._

It was only when I surrounded myself by a group of quirky, rag-tag D3 baseball players that I was able to see the value and power in making things **fun**. They showed me you could _work hard_ and still _enjoy yourself_.

Unfortunately, most people are not very passionate about what they do for a living. An even _more_ unfortunate fact is that most people aren’t very passionate about what they _choose_ _to do_ _outside work._ That’s a bit sad!

In my experience, the best way to “make things suck less” is through gamification.

Take what you’re doing, maybe you don’t want to do it, and turn it into a game. Make it fun. Some how, some way— I promise it’s possible. Actually, it’s more than possible: gamifying things for long enough brings enjoyment, even those inherently painful, like grueling exercise.

Track your achievements, your work product, or maybe the number of people you help/the nice things people say about you (I do).

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc0ab19a-9329-45ce-9000-6283c088d280_863x287.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc0ab19a-9329-45ce-9000-6283c088d280_863x287.jpeg)

 _Not all heroes wear capes 🦸🏻‍♂️_

But don’t be selfish!

You have to make it fun for the people around you, too. Show up with a smile (not all the time, we’re not robots) and make dumb jokes. Talk about your weekend or toss in some self-deprecating humor.

That’s what my teammates taught me way back in 2018— that we could work hard _while_ goofing around and end up the 5th-best team in the country. Maybe the other 4 were working harder and _not_ goofing off (or maybe at that point it’s luck), but if you can get to **zeroth** percentile _and_ enjoy yourself, what more is there to ask for?

… but what about analytics?

## Making analytics fun

Most of my experience still lies in product analytics, which can either be a joyride or hell. Ironically, what Benn describes in his article is usually when things go awry: “just building dashboards and mechanically tracking metrics.”

For something so _inherently_ interesting— discovering what users enjoy, uncovering exciting trends, improving process, and _influencing the direction of a product_ — how can it become so rote? So dry?

Well, the answer is pretty simple: **undifferentiated work and a lack of creativity.**

## Differentiated work

The more time I spend doing things I _shouldn’t_ be doing (the stuff _anyone_ can do that _isn’t fun_ ), the less happy I am. If I spend 3 hours in traffic to go on a 90 minute hike:

1. I didn’t spend my time well

2. I remember the traffic more than the hike

Similarly, if I want to deliver a cool report and show my team an exciting new trend, but I have to:

1. Spend hours in meetings that don’t matter (some do)

2. Spend hours more than I should in Jira

3. Do the work

4. Respond to uninformed comments

5. Fight fires

6. Deal with bad tooling (data teams need to **[iterate](https://hex.tech/blog/iterating-in-analytics/?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)** faster!)

7. Send the work to a stakeholder who already forgot about it

8. Watch it slowly decay to obsolescence

It’s not difficult to see why work might be less than fun. Even if the actual work yields an exciting result, it’s sandwiched between corporate hell.

If you’re working with a stakeholders that have a short attention span, the problem gets worse. Nothing is more demotivating than work that ends up in the trash bin.

So reduce undifferentiated work, for the sake of everyone involved. This looks like:

1. No dumb meetings

2. Reduce, but don’t eliminate, process

3. Get good tools (think ROI— being cheap helps no one)

4. Improve developer experience, relentlessly

5. Work with good people

All easier said than done, but if you start with #6, the rest are _much_ easier. It’s actually funny— the hype is artificial intelligence, but a vast majority of life’s problems are solved by non-artificial (actual) intelligence and good people.

Start with finding good people that let you work hard on what you’re passionate about, the rest follows. This brings me to my next point:

## Creativity

> I’m feeling like the sun never sets
> Heaven is a place in my head
> Christo Bowman // Bad Suns

Ok, now here’s where it’s on you. You can have a really great manager/leader that does everything I’ve just mentioned and still be unhappy. As a matter of fact, you can be unhappy no matter how many good things happen to you. Many are! I am sometimes!

Emotions are odd and somewhat uncontrollable, but that means the opposite is true: you can also _be happy even when bad things happen._ Now there’s a revelation.

For me, that means **getting creative** and **saying yes**. Say “yes” to those fun little experiments or new things. “Yes” to those things that pique your interest but aren’t “in your lane.” Say “yes” to that little project that you feel is slightly out of your current capabilities.

But to say “yes,” we also have to say “no,” right? After all, there’s only so much time in the day. **Do it.**

Say “no” to dumb meetings and requests that are better suited for another teammate (or no one at all). Say “no” to things that don’t make sense. Have tact, but be firm. I promise your teammates will appreciate it. Many of these things are no one’s fault in particular, they just come about from group-think and the difficulty of change.

Being creative is about **[Essentialism](https://www.amazon.com/Essentialism-Disciplined-Pursuit-Greg-McKeown/dp/0804137382?utm_source=casewhen.beehiiv.com&utm_medium=referral&utm_campaign=making-analytics-fun)** , removing the unnecessary, perhaps more than innovation. The latter usually follows the former.

For everything you **do** say yes to, challenge yourself to do it the best you can. I guess that goes for analysts & accountants, it doesn’t really matter. You can have fun with a balance sheet or a Google Sheet. It’s all a state of mind.

You can just “have a job” or you can live your dream— that’s entirely up to you. Yes, we need to fight for process and a good work environment, but that only goes so far.

If you try for long enough and your coworkers/friends aren’t supportive, then get new ones… or start a company. I hear there’s lots of funding if you snag an `.ai` domain. 😉 

## Choose fun

I fail to see why analytics needs to “grow up” for the same reason I love tech and data. It’s the wild west. 🤠 

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe05aa957-a3fd-4748-8f8d-afc47927a6e4_1292x727.jpeg)](https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe05aa957-a3fd-4748-8f8d-afc47927a6e4_1292x727.jpeg)

You can still move out to Silicon Valley (or don’t and work remote, but people are more fun outside of Zoom) and participate in some of the most exciting, low-bureaucracy work on planet Earth: it’s **amazing**.

The moment we start to “grow up,” with standardization, pigeonholing, and rigidity, is the moment it dies. That’s the moment I go somewhere else to continue doing exciting work, where I can focus and make a difference.

If analytics became accounting, I would cease to be an analyst. If AI renders data engineering the equivalent of making widgets, I’ll find something else. But to be honest, even if I ended up accounting I’d never be an “accountant.”

That’s just it— regardless of whether your field “grows up,” _you_ choose your own adventure. Forget “going further as an industry,” how about we challenge ourselves to be the best we can be. I fully believe that’s tied to how much we’re having fun.

Not everything can be fun and life is not all 🌹 and ☀️. Bad stuff happens and life is hard sometimes. However, if you’re like me (pretty motivated and a _little_ too type-A) and you notice yourself grinding _a bit_ too much, ask yourself if you’re having fun and see what you can do to fix it.

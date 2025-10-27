# Markdown.social

A decentralized social network that uses Markdown files over HTTP. Decoupling content and presentation.

# Introduction

*The author determines the content, the reader determines its presentation.*

Inspired by [Org Social](https://github.com/tanrax/org-social), twtxt and others, Markdown.social is a decentralized
social network that is as simple and flexible as writing blog posts with a static page generator.

The intention behind using Markdown, a proven and well-known format, is to open up the idea of domain based social
media to a broader audience. It also offers more flexible ways to structure posts, by going beyond single files, while
still supporting them.

Markdown.social is meant to be easy to read and write by both humans and machines. Anyone who can host at least one
file in a way that is reachable by the rest of the internet should be able to use all the features, with or without
tooling that goes beyond any simple text editor.

# First steps

All you need to use Markdown.social is a place to publicly host at least one file, preferably with your own domain. As
long as the domain remains the same, other users can subscribe to your feed, by adding it to their follows-list.

## Using the mds tool

The easiest way, to create a `social.md` file is to use mds.

Right now, there are no prebuilt packages, so you need to build it yourself, using the zig compiler:

```shell
# assuming you have the most recent version of zig (v0.15.2 at the time of writing)
git clone https://github.com/nkoehring/markdown.social
cd markdown.social/cli
zig build # binary will be in zig-out/bin
# to build a small binary (kBs vs MBs) and copy it to ~/.local/bin, use:
# zig build --release=small --prefix ~/.local
```

As soon as you have the mds tool available, you can create a new social.md file with:

```shell
mds init
# optionally suppling some values already:
mds init --nick "Jon Doe" --title "Here's Johnny!"
```

This will create and prefill a social.md file and open it in your editor for further editing. To add a new post, use:

```shell
mds add
```

which behaves similar to init, in that it opens the file in your editor afterwards.

## Without any tooling

Markdown.social doesn't need any tools. In fact, the format is meant to be easily readable and writable by humans.

Start by creating the file: `social.md` and add some meta information to it.
Mandatory fields are type, version, format, nick and title. The rest is optional.
What follows is the about section, which is a full markdown post. Other posts can be added after the about section,
starting with another frontmatter section. Every post needs a valid ISO 8601 timestamp as unique ID but also supports
other fields optional fields. Here is an example:

```markdown
---
type: markdownsocial
version: "1.0"
nick: Alice
title: "Alice's Wonderland"
description: HTTP based social media, markdown and simplicity enthusiast
lang: en
avatar: /avatar.jpg
links:
  - https://alice.wonder.land
  - https://alice.wonder.land/social.md
  - https://codeberg.org/alice
  - mailto:alice@wonder.land
follow:
  - url: https://bob.example/social.md
    nick: my mate Bob
  - url: https://charlie.example/social.md
    nick: Charlie
---

Everything between the initial frontmatter and the first post is considered an about section.

# Say what?

Yes, you can do *whatever* you want, as long as [markdown](https://daringfireball.net/projects/markdown/) supports it.
This is just like any other markdown post. You decide its content, the reader decides how they want it to be rendered.

---
id: 2025-10-26T17:21:00Z
tags:
  - markdown
  - decentralization
  - social
mood: adventurous
---

I wonder, how a markdown based decentral social media network would look like...

---
id: 2025-10-26T17:27:00Z
lang: de
mood: 😜
---

Ja, ich spreche auch Deutsch, wenn ich will!

---
id: 2025-10-26T18:10:00Z
reply_to: https://charlie.example/social.md#2025-10-26T17:55:00Z
---

Yes, I totally agree with that very detailled and specific post of yours.
```

# Pages / Categories

Markdown.social supports an additional way of structuring your posts. While a single file might be enough for most, it
is possible to have additional files that could be called pages or categories. The file tree might then look like this:

```
/social.md/index.md     # Meta data (profile), about section, general posts
/social.md/ideas.md     # Ideas page, with its own meta data, about section and posts
/social.md/projects.md  # Projects page, with its own meta data, about section and posts
/social.md/2024.md      # Archive for last year posts, maybe? It's just another category
```

To make categories discoverable, they need to be added to your index.md file's frontmatter:

```markdown
---
type: markdownsocial
version: "1.0"
nick: Alice
title: "Alice's Wonderland"
categories:
  - ideas
  - "2024"
---
```

# Implementation

Please see the [SPEC](markdown-social.spec.md) for details on the file format.


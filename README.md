# Markdown.social

A decentralized social network that uses Markdown files over HTTP. Content and presentation decoupled.

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

The easiest way to use Markdown.social is by creating a simple file: `social.md` and add some meta information to it.
Mandatory fields are type, version, format, nick and title. The rest is optional.
What follows is the about section, which is a full markdown post. In single file mode, other posts can be added after
the about section, starting with another frontmatter section. Every post needs a valid ISO 8601 timestamp as unique ID.
All other entries are optional. Here is an example:

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
category: ideas
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
/social.md/2024.md      # Archive for last year posts, maybe? It would be just another category
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


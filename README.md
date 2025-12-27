# plaintext.casa

A decentralized social network that uses plain text files over HTTP. Decoupling content and presentation.

![plaintext-casa-logo](plaintext-casa.svg)

---

The plaintext.casa spec is still in its early stages. Help us grow by adding your feed to [public-feeds.txt](public-feeds.txt), ask questions, make suggestions, challenge the idea...

---

# Introduction

*The author determines the content, the reader determines its presentation.*

Inspired by [Org Social](https://github.com/tanrax/org-social), twtxt and others, plaintext.casa is a decentralized social network that is as simple and flexible as writing blog posts with a static page generator, maybe even simpler.

Other than the mentioned formats, plaintext.casa does not use a fixed file format but instead suggests shapes for different plain text formats like Markdown, Org, AsciiDoc or txt. Thanks to its flexibility, plaintext.casa supports Org Social feeds as well, but future compatibility is not guaranteed.

plaintext.casa is meant to be easy to read and write by both humans and machines. Anyone who can host at least one file in a way that is reachable by the rest of the internet should be able to use all the features, with or without tooling that goes beyond any simple text editor.

# First steps

All you need to use plaintext.casa is a place to publicly host at least one file, preferably with your own domain. As long as the domain remains the same, other users can subscribe to your feed, by adding it to their follows-list.

## Manual creation

plaintext.casa doesn't need any tools. In fact, the format is meant to be easily readable and writable by humans. The general file structure is:

1. Document header
2. About Section (optional)
3. Meta Data of the oldest (first) post
4. The oldest (first) post
5. Meta Data of the second oldest post
6. The second oldest post
...and so on.

### Document header

Start by creating the file in the format of your choice, for example: `feed.md`, `feed.org` or `feed.adoc` and add some meta data to it. Only `title` and `author` (or `nick`) are required, but more fields are supported by default. Some fields can appear multiple times:

|   Field     |                                 Description                                     | Multiple | Required |
| ----------- | ------------------------------------------------------------------------------- | -------- | -------- |
| title       | The title of your social feed                                                   |  ✘       |  ✔      |
| author      | Your nickname. This will be displayed in posts.                                 |  ✘       |  ✔/✘    |
| nick        | Your nickname. Alias for author.                                                |  ✘       |  ✔/✘    |
| description | A short description about you or your feed.                                     |  ✘       |  ✘       |
| lang        | ISO 639-1 or -2 code of the typical language used. Can be changed per post.     |  ✘       |  ✘       |
| avatar      | The URL of your avatar image. Org social has some constraints here, we do not.  |  ✘       |  ✘       |
| link        | Links to your website, profile, email, matrix, fediverse... you name it.        |  ✔      |  ✘       |
| follow      | Users you follow. Format: `<nick> URL`, eg `Nick https://nick.tld/plaintext.casa/feed.org`.|  ✔ | ✘  |
| contact     | Ways to contact you. Alias for link.                                            |  ✔      |  ✘       |
| page        | Additional feeds, if the multi page mode is used. See (#pages)                  |  ✔      |  ✘       |

    *) Either nick or author is required. Use nick for Org Social compatibility.

The feed title can be defined either as level one title (like, `# The Title` in Markdown) or like any other variable (`:title: The Title` in MD or ADOC, or `#+TITLE: The Title` in Org).

More fields can be added. They might or might not be supported by whatever tooling others use. The tool should simply show unsupported fields as text fields and otherwise ignore them.

Depending on the format, the header might be formatted differently. Org-mode files should be formatted just like Org-Social suggests. AsciiDoc files should use AsciiDoc's Document Headers. Markdown has no build-in support for meta data, so plaintext.casa comes with its own format for it, that is heavily inspired by AsciiDoc's. See the [examples folder](/examples) for all supported formats and their specifics.

### About section

After the feed meta data follows an optional about section. This is just like a post but without meta data. It can be shown as extended introduction, kind of like an about page. Specialised clients might handle it in their own way.

### Posts

Posts follow, ordered by time of creation, with the newest post last. Posts always start with the magic `**` followed by a newline and a post meta data block. Post meta data can optionally be wrapped in `:PROPERTIES:` and `:END:`, but this is generally only about Org Social compatibility. An empty line marks the end of the post meta data block.

Following fields are supported by default:

|   Field     |                              Description                           | Example                 | Required |
| ----------- | ------------------------------------------------------------------ | ----------------------- | -------- |
| id          | Unique identifier, use an RFC 3339 formatted timestamp for Social Org compatibility | `my-first-post` or `2025-11-11T12:00:00+0100` | ✔ |
| date        | Publishing date. **Recommended when IDs are not timestamps**       | `2025-11-11T23:42:00Z`  |  ✘       |
| lang        | The language used in this post. Use [ISO 639-1](https://www.loc.gov/standards/iso639-2/php/code_list.php) | `en`,`de`,`sw`,`art`,`tlh` | ✘ |
| tags        | space-separated tags                                               | `plaintext social feed` |  ✘       |
| reply_to    | ID of post being replied to. Format: `URL`+`#`+`ID`                | `https://foo.tld/plaintext.casa/feed.adoc#my-first-post` | ✘ |
| mood        | Mood indicator, either as emoji or plaintext.                      | `😊`,`❤`,`🚀`          |  ✘       |
| content_warning | To give any kind of content warning                            | `clickbait`             |  ✘       |
| supersedes  | This post supersedes an older post of yours.                       | `2025-10-10T10:30:00Z`  |  ✘       |

Just like with the feed meta data, additional fields are allowed, but might not be interpreted by any tooling.

Post meta data is followed by the actual post content in the format of your choice. Here is a full example in AsciiDoc:

```adoc
= Alice's Wonderland
:description: HTTP based social media and simplicity enthusiast
:author: Alice
:lang: en
:avatar: /avatar.jpg
:link: https://alice.wonder.land
:link: https://codeberg.org/alice
:link: mailto:alice@wonder.land
:follow: bob https://bob.tld/social.md
:follow: charlie https://charlie.tld/social.org
:follow: dieter https://dieter.tld/social.adoc

Everything between the initial meta data and the first post is considered an about section.

== Say what?
Yes, you can do *whatever* you want, as long as the https://asciidoc.org/[format] supports it
and it is not indicating a new post. This is just like any other markdown post. You decide its content, the reader
decides how they want it to be rendered.

**
:id: 2025-10-26T17:21:00Z
:tags: markdown decentralization social
:mood: adventurous

I wonder, how a markdown based decentral social media network would look like...

**
:id: My second post
:date: 2025-10-26T17:27:00Z
:lang: de
:mood: 😜

Ja, ich spreche auch Deutsch, wenn ich will!

**
:id: 2025-10-26T18:10:00Z
:reply_to: https://charlie.example/social.org#2025-10-26T17:55:00Z

Yes, I totally agree with that very detailled and specific post of yours.
```

See more formats in the [examples](/examples) folder.

# Pages

plaintext.casa supports an additional way of structuring your posts, similar to Org Social's groups. While a single file might be enough for most, it is possible to have additional files that could be called pages, groups or categories. The file tree might then look like this:

```
/feed.md                     # Meta data (profile), about section, general posts in Markdown format
/plaintext.casa/ideas.adoc   # Ideas page, with its own meta data, about section and posts (in AsciiDoc format)
/plaintext.casa/projects.md  # Projects page, with its own meta data, about section and posts
/plaintext.casa/2024.md      # Archive for last year posts, maybe? It's just another category
```

To make categories discoverable, they need to be added to your feeds meta data (in `feed.md`) and are always assumed to be in a `plaintext.casa` sub folder next to your `feed.md` file. The path of a page entry will be built like this: `{absolute/path/of/feed}/plaintext.casa/<page>`

The following meta data properties are supported in a page, none of them is required:

|   Field     |                                 Description                                     | Multiple | Required |
| ----------- | ------------------------------------------------------------------------------- | -------- | -------- |
| title       | The title of your page.                                                         |  ✘       |  ✘       |
| description | A short description of your page.                                               |  ✘       |  ✘       |
| lang        | ISO 639-1 or -2 code of the typical language used. Can be changed per post.     |  ✘       |  ✘       |
| header      | The URL of a header image.                                                      |  ✘       |  ✘       |

```markdown
:nick: Alice
:title: Alice's Wonderland
:description: HTTP based social media and simplicity enthusiast
:page: ideas.adoc
:page: projects.md
```

**projects.md**

```markdown
:title: Projects
:descriptions: My projects page

This place is about my projects. Most of them are not finished and never will be.

**
:id: 2025-10-26T17:21:00Z
:tags: markdown decentralization social
:mood: adventurous

I invented a new social network!
```

**Tips:**
* Unlisted pages are not discoverable and only reachable if the name (and therefore link) is known. You could call it a private page, but better don't use it for sensitive information.
* Sub folders are supported! Page names are just concatenated to a path, so `:page: projects/archive.md` would be resolve to /plaintext.casa/projects/archive.md.

# Plaintext Casa Specification v1.0

**Status:** Draft  
**Date:** October 2025  
**Authors:** koehr <n@koehr.ing>, the Plaintext Casa Community

## Abstract

Plaintext Casa is a decentralized social media format using plain text files served over HTTP/HTTPS. It enables individuals to publish social content from their own domains without requiring specialized server software or databases.

## 1. Introduction

### 1.1 Goals

- **Simplicity**: Plain text files, no special server required
- **Decentralization**: Each person controls their own content and domain
- **Interoperability**: Standard formats enable multiple client implementations
- **Ownership**: Content stays under the author's control
- **Separation of Concerns**: Authors control content; clients control presentation

### 1.2 Non-Goals

- Real-time delivery (no push notifications in the spec)
- Built-in encryption or privacy features
- Algorithmic feeds or recommendations
- Centralized identity or authentication

## 2. Terminology

**MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** follow [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

- **Feed**: A collection of posts published by a single author
- **Post**: A single social media update/entry
- **Profile**: Metadata about the feed author
- **Category**: A thematic grouping of posts
- **Client**: Software that reads and displays plaintext.casa feeds
- **Timestamp**: RFC 3339 formatted date-time with timezone

## 3. File Structure

### 3.1 Feed Modes

A plaintext.casa feed MUST use one of two modes:

**Single File Mode:**
A file with any name, preferably `social` or `feed`, of a supported plain text type. For example `social.org`, `feed.adoc` or `social.md`

**Multi-Page Mode:**
Files in a `plaintext.casa` folder, that are named `index` or after their category:

```
/plaintext.casa/
 ├─ index.adoc
 ├─ <category1>.adoc
 └─ <category2>.md
```

Files can be of any supported type.

### 3.2 File Naming

- In single-category mode, any file name is supported. The file suffix MUST indicate its format
- In multi-page mode, the directory MUST be `/plaintext.casa/`
- In multi-page mode, the index file MUST be named `index` and use one of the supported suffixes
- Category filenames SHOULD contain only alphanumeric characters, hyphens, and underscores

### 3.3 File Encoding

- Files MUST be encoded as UTF-8
- Line endings SHOULD be LF (`\n`)

## 4. Discovery

### 4.1 Feed Discovery

There is no fixed way of feed discovery. Feeds are shared with their full URL. There might be other means, like DNS TXT records or well-known URIs supported by clients.

### 4.2 Category Discovery

In multi-page mode, clients MUST:

1. Collect categories from the index file's profile meta data
2. Construct category URLs as `/plaintext.casa/<category>`
3. Fetch category files as needed
4. MUST NOT assume that the categories list exists, even in multi-page mode

Example:
```adoc
:category: tech
:category: photography
```
Maps to:
- `/social.md/tech.md`
- `/social.md/photography.md`

## 5. File Format

### 5.1 Overall Structure

Each file MUST follow this structure:

```markdown
---
<profile or category frontmatter>
---

<optional about content>

---
id: <timestamp>
<optional post metadata>
---

<post content>

---
id: <timestamp>
<optional post metadata>
---

<post content>
```

### 5.2 Parsing Rules

1. The first YAML frontmatter block (starting at byte 0) contains profile or category metadata
2. Content between the first frontmatter block and the first post is about/description content
3. Subsequent YAML frontmatter blocks containing an `id` field denote posts
4. Post content extends from the end of post frontmatter until the next frontmatter block or EOF
5. Empty lines between posts are permitted but not required

## 6. Profile Frontmatter

### 6.1 Profile Fields

Profile frontmatter appears in `/social.md` or `/social.md/index.md`.

**Required fields:**
```yaml
version: "1.0"               # Specification version
nick: Alice                  # Username
title: "Alice's Wonderland"  # Display title
```

**Optional fields:**
```yaml
description: "Developer and writer"  # Short bio
avatar: https://alice.io/avatar.jpg
links:  # Personal URLs with optional label
  - Homepage https://alice.io
  - https://github.com/alice
  - mailto:alice@example.com
  - Mastodon @alice@mas.to
follows:  # Feeds this user follows with optional nick, URLs MUST end with /social.md
  - Bobbie https://bob.com/social.md
  - https://charlie.org/social.md
pages:  # Multi-page mode only
  - tech
  - photography
lang: en  # Default language (ISO 639-1), can be overwritten on each post
```

### 6.2 Field Specifications

**`version`:**
- MUST be a string
- MUST be `"1.0"` for this specification version

**`nick`:**
- MUST be a string
- MAY contain whitespace

**`title`:**
- MUST be a string

**`avatar`:**
- MUST be a valid HTTP/HTTPS absolute or relative URL
- Relative URLs without leading slash are assumed to be in the same directory as the markdown file
- SHOULD be a valid image format

**`links`:**
- MAY be an array of strings OR objects
- String format: `[name] <url>` where name is optional
  * Examples: `https://alice.io` or `Homepage https://alice.io`
- Object format: `{ url: string, [name: string] }`
- Each item MUST be a valid URL

**`follows`:**
- MAY be an array of strings OR objects
- String format: `[nick] <url>` where nick is optional
  * Optional nick MAY be shown instead of fetched nick
  * Examples: `https://bob.com/social.md` or `Bobby https://bob.com/social.md`
- Object format: `{ url: string, [name: string], [note: string] }`
- URL MUST be a valid markdown social feed URL
- Feeds MAY follow specific category URLs, rather than entire feeds
  * Examples: `https://alice.io/social.md/tech.md` or `Alice's Tech https://alice.io/social.md/tech.md`
  * When following category URLs, clients SHOULD:
    * prefer the given nick to avoid fetching main feed
    * otherwise fetch meta information from /social.md/index.md

**`pages`:**
- MUST be an array of strings
- Only valid in multi-pages mode, otherwise ignored
- Each string maps to `<category>.md` file

## 7. Category Frontmatter

Category frontmatter appears in `/social.md/<category>.md` files.

**Required fields:**
```yaml
category: tech  # Category identifier
```

**Optional fields:**
```yaml
title: "Technical Writings"  # Display title
description: "About tech posts"  # Short description
lang: en  # Default language
```

### 7.1 Field Specifications

**`category`:**
- MUST be a string
- SHOULD match the filename (without `.md`)

## 8. Posts

### 8.1 Post Structure

Each post consists of:
1. YAML frontmatter block with post metadata
2. Markdown content

Minimum valid post:
```markdown
---
id: 2025-10-10T10:00:00Z
---

Post content here.
```

### 8.2 Post Frontmatter

**Required fields:**
```yaml
id: 2025-10-10T10:00:00Z  # RFC 3339 timestamp
```

**Optional fields:**
```yaml
published: 2025-10-08T12:00:00Z # to override date from ID
updated: 2025-10-08T12:00:00Z
tags: [tag1, tag2]  # List of tags
reply_to: <url>  # URL to post being replied to
lang: en  # Language code (ISO 639-1)
mood: 🚀  # Mood/reaction, MAY be an emoji
```

or any other client specific optional fields.

### 8.3 Post IDs

**Format:**
- MUST follow RFC 3339
- MUST include timezone
- It is RECOMMENDED to use coordinated universal time (UTC)
- Examples:
  - `2025-06-15T12:30:00Z`
  - `2025-06-15T14:30:00+02:00`
  - `2025-06-15T14:30:00-04:00`

**Requirements:**
- **Uniqueness**: Post IDs MUST be unique within a feed
- **Chronological**: Posts MUST be in chronological order by ID, with the newest post last

Rationale: Chronological ordering (newest last) enables efficient incremental fetching while simplifying manual editing. Authors can append new posts to the end of the file, clients can fetch posts sequentially and keep information like last byte length to efficiently fetch new posts using HTTP Range requests.

### 8.4 Post References

Posts are referenced using fragment identifiers:

**Format:** `<feed-url>#<timestamp-id>`

**Examples:**
- Main feed: `https://alice.io/social.md#2025-06-18T14:30:00Z`
  * This is equivalent to `https://alice.io/social.md/index.md#2025-06-18T14:30:00Z`
- Category file: `https://alice.io/social.md/tech.md#2025-06-18T14:30:00Z`

### 8.5 Post Content

Post content:
- MUST be valid Markdown
- MAY include any standard Markdown features
- MAY include HTML (implementation-dependent rendering)
- MAY include extended Markdown features (implementation-dependent rendering)
- SHOULD be UTF-8 encoded

## 9. Special Features

### 9.1 Mentions

Mentions use standard Markdown links:

```markdown
Hey [bob](https://bob.com/social.md), what do you think?
```

Clients MAY recognize these as mentions and provide special handling.

### 9.2 Replies

Replies use the `reply_to` field:

```yaml
---
id: 2025-10-10T15:00:00Z
reply_to: https://bob.com/social.md#2025-10-10T14:00:00Z
---

I agree with your point about...
```

Clients MAY recognize these as reply and provide special handling.

### 9.3 Media Attachments

Media MAY be specified in frontmatter to add meta data:

```yaml
media:
  - url: https://example.com/photo.jpg
    alt: "Sunset photo"
    type: image/jpeg
  - url: https://example.com/video.mp4
    alt: "Time-lapse video"
    type: video/mp4
```

Content MAY also embed media using standard Markdown:

```markdown
![Sunset](https://example.com/photo.jpg)
```

Client support for media or media meta data is OPTIONAL.

## 10. HTTP Considerations

### 10.1 Caching

Servers SHOULD:
- Include `Last-Modified` header
- Support `If-Modified-Since` conditional requests
- Include appropriate `Cache-Control` headers

Clients SHOULD:
- Respect cache headers
- Use conditional requests to minimize bandwidth

### 10.2 Partial Fetches

For large files, servers SHOULD support HTTP Range Requests ([RFC 7233](https://www.rfc-editor.org/rfc/rfc7233)).

Example - fetch last 50KB:
```
GET /social.md
Range: bytes=-51200
```

This allows clients to fetch only recent posts from large feeds.

### 10.3 CORS

Servers SHOULD include CORS headers to allow browser-based clients:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
```

### 10.4 HTTPS

Feeds SHOULD be served over HTTPS for:
- Authenticity verification
- Content integrity
- Privacy protection

## 11. Examples

### 11.1 Minimal Single File

**`/social.md`:**
```markdown
---
version: "1.0"
nick: bob
title: "Bob's Updates"
---

---
id: 2025-10-10T14:30:00Z
---

Hello world!

---
id: 2025-10-09T09:15:00Z
tags: [meta]
---

Setting up my feed.
```

### 11.2 Single File with Profile

**`/social.md`:**
```markdown
---
version: "1.0"
nick: alice
title: "Alice's Stream"
description: "Developer and writer"
avatar: https://alice.io/avatar.jpg
links:
  - https://alice.io
  - https://github.com/alice
follows:
  - url: https://bob.com/social.md
    nick: bob
---

# About Me

I write about technology, photography, and life.

Subscribe to follow my updates!

---
id: 2025-10-10T14:30:00Z
tags: [tech, markdown]
---

Working on a new markdown-based social spec with [bob](https://bob.com/social.md).

The key insight: separate content from presentation.

---
id: 2025-10-09T18:00:00Z
reply_to: https://bob.com/social.md#2025-10-09T15:00:00Z
---

[bob](https://bob.com/social.md) Great point about simplicity!
```

### 11.3 Multi-Page Mode

**`/social.md/index.md`:**
```markdown
---
version: "1.0"
nick: alice
title: "Alice's Digital Garden"
description: "Developer, photographer, writer"
avatar: https://alice.io/avatar.jpg
categories:
  - tech
  - photography
  - personal
links:
  - https://alice.io
---

# Welcome

Browse by category or subscribe to everything.

---
id: 2025-10-10T12:00:00Z
---

Reorganized my entire digital setup!
```

**`/social.md/tech.md`:**
```markdown
---
category: tech
title: "Technical Writings"
icon: 💻
tags: [programming, opensource]
---

# Tech Posts

Thoughts on software development.

---
id: 2025-10-10T14:30:00Z
tags: [markdown, spec]
---

Finalizing the markdown social specification today.

---
id: 2025-10-05T09:15:00Z
tags: [rust, webassembly]
---

Experimenting with Rust and WASM. Performance is incredible!
```

**`/social.md/photography.md`:**
```markdown
---
category: photography
title: "Photography"
icon: 📷
---

# Photo Blog

Film and digital photography.

---
id: 2025-10-08T16:00:00Z
tags: [film, landscape]
media:
  - url: https://alice.io/photos/mountains.jpg
    alt: "Mountain landscape"
---

![Mountains](https://alice.io/photos/mountains.jpg)

Early morning in the Alps. Shot on Portra 400.
```

## 12. Security Considerations

### 12.1 Content Injection

- Clients MUST sanitize HTML if rendering it
- Clients SHOULD render untrusted markdown in sandboxed contexts
- Links SHOULD be validated before following

### 12.2 Privacy

- Authors SHOULD be aware that all content is public
- Servers SHOULD use HTTPS to prevent eavesdropping

### 12.3 Impersonation

- No built-in authentication mechanism
- Domain ownership implies feed ownership
- Clients MAY implement additional verification (e.g., PGP signatures)

### 12.4 Denial of Service

- Servers MAY implement rate limiting
- Clients SHOULD implement timeout and size limits
- Large files MAY be mitigated with HTTP Range Requests

## 13. Implementation Guidelines

### 13.1 For Authors

**Publishing:**
- Create markdown files following this spec
- Host on any HTTP/HTTPS server
- Update files when posting new content
- Use version control (e.g., Git) for history

**Recommended workflow:**
1. Edit markdown file locally
2. Commit changes to version control
3. Deploy to web server
4. Server automatically invalidates caches

### 13.2 For Client Developers

**Fetching:**
1. Implement discovery algorithm (§4.1)
2. Parse YAML frontmatter
3. Render markdown content
4. Respect HTTP caching headers

**Display:**
- Presentation is completely client-controlled
- Timeline, grid, list views all valid
- Filtering by tags, categories, dates
- Threading based on `reply_to`

**Polling:**
- Check `Last-Modified` header
- Use conditional requests
- Configurable poll interval RECOMMENDED
- Exponential backoff on errors RECOMMENDED

## 14. Extensibility

### 14.1 Custom Fields

Implementations MAY add custom fields to frontmatter:

```yaml
---
id: 2025-10-10T10:00:00Z
custom_field: "value"
x_app_specific: true
---
```

Custom fields SHOULD use namespacing (e.g., `x_`, `app_`) to avoid conflicts.

### 14.2 Future Versions

Future versions of this spec:
- MUST increment the version number
- MUST NOT remove required fields
- MAY add new fields
- SHOULD maintain backward compatibility

Clients encountering unknown version numbers SHOULD attempt to parse using v1.0 rules.

## 15. Comparison with Other Formats

### 15.1 RSS/Atom

**Similarities:**
- Syndication format
- XML-based (RSS/Atom) vs Markdown-based
- Polling-based updates

**Differences:**
- Human-readable/editable
- No special server software required
- Integrated profile information
- Native markdown rendering

### 15.2 ActivityPub

**Similarities:**
- Decentralized social networking
- Profile + posts model

**Differences:**
- Pull-based (polling) vs push-based (federation)
- Static files vs dynamic servers
- No complex protocol implementation
- Simpler to host and maintain

### 15.3 Org Social

**Similarities:**
- Pull-based social networking
- Plain text format

**Differences:**
- Single file mode only
- Markdown vs Org-mode syntax
- YAML frontmatter vs Org properties
- Broader tooling ecosystem for Markdown

## 16. References

### 16.1 Normative References

- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) - Key words for use in RFCs
- [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339) - Date and Time on the Internet
- [RFC 7233](https://www.rfc-editor.org/rfc/rfc7233) - HTTP Range Requests
- [CommonMark](https://commonmark.org/) - Markdown specification
- [YAML 1.2](https://yaml.org/spec/1.2/) - YAML specification
- [ISO 639-1](https://www.iso.org/iso-639-language-codes.html) - Language codes

### 16.2 Informative References

- [Org Social](https://github.com/tanrax/org-social) - Similar pull-based social format
- [twtxt](https://twtxt.readthedocs.io/) - Similar but more restrictive social format
- [RSS 2.0](https://www.rssboard.org/rss-specification)
- [Atom Syndication Format](https://www.rfc-editor.org/rfc/rfc4287)
- [ActivityPub](https://www.w3.org/TR/activitypub/)

## Appendix A: Complete Grammar

```
feed            = profile-block about-content? post*
profile-block   = "---\n" profile-frontmatter "---\n"
about-content   = markdown-content
post            = "---\n" post-frontmatter "---\n" markdown-content
profile-frontmatter = YAML with required: version, nick, title
post-frontmatter    = YAML with required: id
markdown-content    = CommonMark
```

## Appendix B: MIME Types

Recommended MIME types:
- `text/markdown` - Preferred
- `text/plain` - Acceptable fallback

## Appendix C: Change Log

**v1.0 (October 2025):**
- Initial specification


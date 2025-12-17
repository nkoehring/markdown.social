# plaintext-casa

A TypeScript/JavaScript library for parsing and working with plaintext.casa feeds.

## What is plaintext.casa?

plaintext.casa is a decentralized social network that uses plain text files over HTTP. This library provides the core functionality for parsing feeds, assembling timelines, and working with plaintext.casa content.

## Installation

```bash
npm install plaintext-casa
# or
bun install plaintext-casa
```

## Features

- **Parse feeds** in multiple formats (Markdown, Org, AsciiDoc, plain text)
- **Assemble timelines** by fetching and combining posts from followed feeds
- **Post updates** - Support for the `supersedes` field to update posts while maintaining append-only feeds
- **Type-safe** - Full TypeScript support with comprehensive type definitions
- **Flexible** - Supports custom metadata fields
- **Zero dependencies** - Core library has no external dependencies

## Usage

### Parse a Feed

```typescript
import parseFeed from 'plaintext-casa'

const feedContent = `
# Alice's Feed
:author: Alice
:description: My plaintext.casa feed

**
:id: 2025-12-07T12:00:00Z
:tags: hello world

Hello from plaintext.casa!
`

const result = parseFeed(feedContent, 'md')
console.log(result.feed.title) // "Alice's Feed"
console.log(result.feed.posts.length) // 1
```

### Assemble a Timeline

```typescript
import { assembleTimeline } from 'plaintext-casa'

const myFeed = parseFeed(feedContent, 'md').feed
const timeline = await assembleTimeline(myFeed, 'https://example.com/feed.md')

// Timeline contains posts from your feed and all followed feeds
timeline.posts.forEach(post => {
  console.log(`${post.feedAuthor}: ${post.content}`)
})

// Check for any errors fetching followed feeds
if (timeline.errors.length > 0) {
  console.error('Some feeds failed to load:', timeline.errors)
}
```

## API

### `parseFeed(feedString, fileType?, feedConfig?, postConfig?)`

Parses a plaintext.casa feed from a string.

**Parameters:**
- `feedString: string` - The raw feed content
- `fileType?: string` - File extension hint ('md', 'org', 'adoc', 'txt')
- `feedConfig?: ParserConfig` - Optional feed parser configuration
- `postConfig?: ParserConfig` - Optional post parser configuration

**Returns:** `FeedParserResult` containing:
- `feed: Feed` - Parsed feed object
- `warnings` - Parser warnings
- `errors` - Parser errors

### `assembleTimeline(userFeed, userFeedUrl?)`

Assembles a timeline by fetching and combining posts from all followed feeds. Automatically filters out superseded posts.

**Parameters:**
- `userFeed: Feed` - The parsed user feed
- `userFeedUrl?: string` - Optional URL of the user's feed

**Returns:** `Promise<TimelineResult>` containing:
- `posts: TimelinePost[]` - All posts sorted chronologically with superseded posts filtered out
- `errors: Array<{url, error}>` - Any errors fetching feeds

## Types

### `Feed`

```typescript
interface Feed {
  title: string
  author: string
  description: string
  lang: string | null
  avatar: string | null
  links: string[]
  follows: string[]
  pages: string[]
  about: string
  posts: Post[]
}
```

### `Post`

```typescript
interface Post {
  id: string
  date?: string
  lang: string
  tags: string
  reply_to: URL
  supersedes?: string
  mood: string
  content_warning: string
  content: string
}
```

### `TimelinePost`

Extends `Post` with additional metadata:

```typescript
interface TimelinePost extends Post {
  feedTitle: string
  feedAuthor: string
  givenName?: string
  feedUrl?: string
  fetchedAt: Date
}
```

## Sorting

Posts in timelines are sorted chronologically (oldest first, newest last) using:

1. `:date:` field if present
2. `:id:` field if it's a valid RFC 3339 timestamp
3. Fetch time as fallback

This allows custom IDs while maintaining chronological order.

## Post Updates with Supersedes

The `supersedes` field allows you to update or correct posts while maintaining the append-only nature of plaintext.casa feeds.

When a post includes `:supersedes: <post-id>`, it indicates that this post replaces an older post. The timeline automatically filters out superseded posts, showing only the latest version.

**Important:** You can only supersede posts from your own feed. Cross-feed superseding is prevented to avoid censorship and maintain decentralization.

```typescript
// Original post with an error
const feedWithError = `
**
:id: 2024-01-01T10:00:00Z

The Earth is flat.
`

// Correction using supersedes
const feedWithCorrection = `
**
:id: 2024-01-01T10:00:00Z

The Earth is flat.

**
:id: 2024-01-01T12:00:00Z
:supersedes: 2024-01-01T10:00:00Z

Correction: The Earth is round.
`

// Timeline will only show the correction
const timeline = await assembleTimeline(parseFeed(feedWithCorrection, 'md').feed)
// timeline.posts.length === 1 (only the corrected post)
```

The original post remains in the feed file, but is filtered from timeline views.

## Supported Formats

Right now, only **Markdown** is fully supported. AsciiDoc and Plaintext should also work, but are not explicitly tested.

- **Markdown** (`.md`, `.markdown`)
- **AsciiDoc** (`.adoc`, `.asciidoc`)
- **Plain text** (`.txt`, `.text`)

## Support planned

- **Org mode** (`.org`) - Org Social compatible

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run type-check
```

## License

MIT

## Links

- [plaintext.casa website](https://plaintext.casa)
- [GitHub repository](https://github.com/koehr/plaintext.casa)
- [Examples](https://github.com/koehr/plaintext.casa/tree/main/examples)

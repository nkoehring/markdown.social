# plaintext.casa CLI

A command-line tool for viewing and assembling timelines from plaintext.casa feeds.

## Features

- **Parse plaintext.casa feeds** in multiple formats (Markdown, Org, AsciiDoc, txt)
- **Assemble timelines** by combining your posts with posts from all followed feeds
- **Fetch remote feeds** via HTTP(S) or local file:// URLs
- **Rich terminal output** with formatted tables and markdown rendering

## Installation

To install dependencies:

```bash
bun install
```

## Usage

### View Timeline (Default)

By default, the CLI assembles a timeline by fetching and combining posts from all feeds you follow:

```bash
bun run cli.ts feed.md
```

This will:
1. Parse your feed file
2. Extract all `:follow:` entries from the feed header
3. Fetch and parse each followed feed
4. Combine all posts (yours + followed feeds)
5. Sort posts by date (newest first)
6. Display the timeline in your terminal

### View Feed Only

To view just your own feed without fetching followed feeds:

```bash
bun run cli.ts --feed-only feed.md
```

### Command-Line Options

```
Usage
  $ casa <feed>

Options
  --help                 Displays this message
  --version              Displays the version number
  --timeline             Assemble timeline from followed feeds (default)
  --feed-only            Show only the feed without timeline assembly

Examples
  $ casa feed.md
  $ casa --timeline feed.md
  $ casa --feed-only feed.md
```

## Building

To build a standalone executable:

```bash
bun run build
```

This creates a `casa` binary that can be run without Bun installed.

## How Timeline Assembly Works

1. **Parse your feed**: The CLI reads and parses your feed file
2. **Extract follows**: All `:follow:` entries are extracted from the feed header
   - Format: `:follow: Name URL` or `:follow: URL`
   - Example: `:follow: Alice https://alice.example/feed.md`
3. **Fetch followed feeds**: Each followed feed is downloaded and parsed
   - Supports HTTP(S) URLs and local file:// URLs
   - Handles multiple formats (.md, .org, .adoc, .txt)
4. **Combine posts**: Posts from all feeds are merged together
5. **Sort timeline**: Posts are sorted by their ID (assumed to be RFC 3339 timestamps)
6. **Display**: Each post shows the author, feed URL, and all metadata

## Timeline Display Format

Each post in the timeline includes:

- 👤 **Author** - The feed author
- 🆔 **ID** - The post identifier/timestamp
- 🔗 **Feed URL** - Link to the source feed
- 🌐 **Language** - If specified
- ♯ **Tags** - Hashtags
- 🎭 **Mood** - Mood indicator
- ⚠️ **Content Warning** - If present
- ↪️ **Reply To** - If it's a reply

## Error Handling

If any followed feeds fail to fetch, the CLI will:
- Display an error message for each failed feed
- Continue processing other feeds
- Show the timeline with available posts

## Examples

See the `../examples/` directory for sample feeds:
- `feed.md` - Markdown format
- `feed.org` - Org-mode format
- `feed.adoc` - AsciiDoc format
- `test-timeline.md` - Example feed with follows for testing

## Development

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Type Checking

```bash
bun run type-check
```

### Project Structure

- `cli.ts` - Main CLI entry point
- `lib.ts` - Feed parser
- `src/parser.ts` - Core parsing logic
- `src/timeline.ts` - Timeline assembly logic
- `src/cli-renderer.ts` - Terminal rendering
- `src/types.ts` - TypeScript type definitions
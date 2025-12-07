# Casa
plaintext.casa CLI v0.1 -- A command-line tool for viewing and assembling timelines from plaintext.casa feeds.

## Implemented Features

- **Parse plaintext.casa feeds** in Markdown format
- **Assemble timelines** by combining your posts with posts from all followed feeds
- **Fetch remote feeds** via HTTP(S) (or local file:// URLs for testing)
- **Rich terminal output** with markdown rendering, including formatted tables and syntax highlighting

## Planned Features

- Feed path can be a URL
- Configuration file to set default feed path
- Pages (multi file feeds)
- Feeds in multiple formats (Org, AsciiDoc, txt) via converters

## Installation

To install dependencies:

```bash
bun install
```

## Usage

### View Timeline

If you use the compiled binary:
```bash
casa path/to/feed.md
```

You can also use bun directly. Check out https://bun.sh/ for help with the installation:
```
bun run cli.ts feed.md
```

This will:
1. Parse your feed file
2. Extract and parse each `:follow:` entry
3. Combine all posts and sort them by date (newest last)
4. Display the timeline in your terminal

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
  --timeline             Show your timeline (default)
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

Unfortunately, this bundles the complete bun executable together with the cli application, which results in a huge executable (>100MB).

## Timeline Display Format

Each post in the timeline includes:

- 👤 **Author** - The feed author
- 🆔 **ID** - The post identifier/timestamp
- ⌚ **Date** - The post timestamp, if the ID is not a timestamp
- 🔗 **Feed URL** - Link to the source feed
- 🌐 **Language** - If specified
- ♯ **Tags** - Hashtags
- 🎭 **Mood** - Mood indicator
- ⚠️ **Content Warning** - If present
- ↪️ **Reply To** - If it's a reply

## Error Handling

Right now, the CLI shows feeds that cannot be loaded, but otherwise ignores them and assembles the timeline out of everything that is available.

## Examples

See the `../examples/` directory for sample feeds.

## Development

This project was created using `bun init` in bun v1.3.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Type Checking

```bash
bun run type-check
```

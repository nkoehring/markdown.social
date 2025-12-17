# Casa CLI

plaintext.casa CLI v0.2 -- A command-line tool for viewing, managing, and building static sites from plaintext.casa feeds.

## Features

- **Parse plaintext.casa feeds** in Markdown format
- **Assemble timelines** by combining your posts with posts from all followed feeds
- **Fetch remote feeds** via HTTP(S) (or local file:// URLs for testing)
- **Add new posts** to your feed with automatic timestamp IDs
- **Generate static websites** from your feed (placeholder)
- **Rich terminal output** with markdown rendering, including formatted tables and syntax highlighting
- **Configuration file** to set default feed path
- **Subcommand architecture** for clear, organized operations

## Installation

To install dependencies:

```sh
bun install
```

## Quick Start

```sh
# First time setup - create config with your feed path
casa init feed.md

# View your timeline
casa timeline

# Add a new post
casa add

# Generate a static website
casa build
```

## Commands

### `casa init <feed>`

Initialize plaintext.casa configuration with your default feed path.

```sh
casa init feed.md
```

Creates a config file at `~/.casarc` with your feed path, so you don't need to specify it for every command.

### `casa timeline [page]`

View your timeline, assembled from your feed and all followed feeds.

```sh
# View timeline (uses config)
casa timeline

# View timeline from specific feed
casa timeline feed.md

# View specific page
casa timeline blog

# View only your feed without followed feeds
casa timeline --feed-only
```

**Options:**
- `--feed-only` - Show only the feed without fetching followed feeds

This will:
1. Parse your feed file
2. Extract and parse each `:follow:` entry
3. Combine all posts and sort them by date (newest last)
4. Display the timeline in your terminal

### `casa add [page]`

Add a new post to your feed and open it in your editor.

```sh
# Add to main feed (uses config)
casa add

# Add to specific feed
casa add feed.md

# Add to specific page
casa add blog
```

The new post template looks like:
```markdown
**
:id: 2025-12-16T06:00:00.000Z
:client: casa-cli v0.2.3

Write here...
```

The command will automatically open your `$VISUAL` or `$EDITOR` to edit the post.

### `casa build [feed]`

Generate a static website from your feed.

```sh
# Build with defaults (uses config)
casa build

# Build specific feed
casa build feed.md

# Custom output directory
casa build --output-dir ./dist

# Use custom templates
casa build --template-dir ./themes/custom
```

**Options:**
- `--output-dir <path>` - Output directory (default: `./public`)
- `--template-dir <path>` - Custom templates directory

⚠️ **Note:** Static site generation is currently a placeholder implementation. See [STATIC-GENERATOR.md](./STATIC-GENERATOR.md) for details.

### `casa pages`

List all pages defined in your feed.

```sh
casa pages
```

Pages are multi-file feeds that allow organizing content into separate files (e.g., blog posts, photos, notes).

## Backward Compatibility

You can still use the CLI without subcommands by passing a feed path directly:

```sh
# Equivalent to: casa timeline feed.md
casa feed.md

# Works with any .md, .org, .adoc file or path containing /
casa ../path/to/feed.md
```

## Configuration File

The config file is stored at `~/.casarc` and uses JSON format:

```json
{
  "feed": "/path/to/your/feed.md",
  "version": "1"
}
```

Create it with `casa init <feed>` or edit it manually.

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
- 🔄 **Supersedes** - If this post replaces an older post

## Post Updates with Supersedes

Plaintext.casa feeds are append-only, meaning you should never edit or delete old posts. However, you can publish corrections or updates using the `supersedes` field.

When a post includes `:supersedes: <post-id>`, it indicates that this post replaces the referenced post. The timeline will automatically filter out superseded posts, showing only the latest version.

**Important:** You can only supersede your own posts. Posts from different feeds cannot supersede each other, preventing censorship and ensuring each feed owner maintains control of their content.

**Example:**

```markdown
**
:id: 2024-01-01T10:00:00Z

The Earth is flat.

**
:id: 2024-01-01T12:00:00Z
:supersedes: 2024-01-01T10:00:00Z

Correction: The Earth is round.
```

## Building

To build a standalone executable:

```sh
bun run build
```

This creates a `casa` binary that can be run without Bun installed.

**Note:** The binary bundles the complete Bun runtime, resulting in a large executable (>100MB).

## Usage Patterns

### First Time User

```sh
# Set up your feed
casa init my-feed.md

# View your timeline
casa timeline

# Add your first post
casa add

# Generate a website
casa build
```

### Daily Usage

```sh
# Check timeline
casa timeline

# Add a post
casa add

# Build and deploy
casa build
```

### Working with Multiple Feeds

```sh
# Use config for main feed
casa init main-feed.md
casa timeline

# Override for specific feeds
casa timeline other-feed.md
casa add blog.md
```

### Working with Pages

```sh
# List available pages
casa pages

# Add to specific page
casa add blog
casa add photos

# View page timeline
casa timeline blog
```

## Error Handling

The CLI shows feeds that cannot be loaded but otherwise ignores them and assembles the timeline from everything that is available.

## Examples

See the `../examples/` directory for sample feeds.

## Development

This project uses [Bun](https://bun.sh) v1.3.2+ as its runtime.

### Project Structure

```
cli/
├── cli.ts                   # Main entry point, command routing
├── src/
│   ├── init/
│   │   └── index.ts        # Config file initialization
│   ├── timeline/
│   │   ├── index.ts        # Timeline viewing command
│   │   ├── renderer.ts     # Terminal rendering
│   │   └── renderer.test.ts
│   ├── add/
│   │   └── index.ts        # Add post command
│   ├── build/
│   │   ├── index.ts        # Build command
│   │   ├── generator.ts    # Static site generator
│   │   └── generator.test.ts
│   └── pages/
│       └── index.ts        # Pages management
└── package.json
```

### Running Tests

```sh
bun test
```

### Type Checking

```sh
bun run type-check
```

### Running in Development

```sh
bun run cli.ts <command> [options]
```

## Planned Features

- Interactive config creation
- Feed path as URL (read-only)
- Complete static site generation
- Feeds in multiple formats (Org, AsciiDoc, txt)
- Interactive post creation with tag and mood selector
- Page creation and management
- Local development server for previewing sites

## Contributing

Contributions are welcome! See the individual command modules for implementation details.

## License

MIT

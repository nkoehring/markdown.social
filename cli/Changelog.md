# Changlog

## CLI v0.3

### tl;dr

The CLI has been restructured from a flag-based interface to a subcommand-based interface and now supports a configuration file.

### Subcommands

**old structure (v0.2)**

`--timeline` was the default and the feed path was mandatory:

```sh
casa [--timeline] /path/to/feed.md  # View timeline
casa --feed-only /path/to/feed.md   # Show only feed 
casa --add /path/to/feed.md         # Add post
```

**new structure (v0.3)**

Casa now uses subcommands. Timeline is the default.

```sh
casa                             # View timeline of configured feed
casa [timeline] /path/to/feed.md # View timeline (without config)
casa timeline --feed-only        # View feed only
casa add [/path/to/feed.md]      # Add post
```

### Configuration File Support

`casa-cli` now supports a config file to store your default feed path.

**Setup:**
```sh
# One-time setup
casa init /path/to/feed.md
```

**Usage after setup:**
```sh
# No need to specify feed path anymore!
casa timeline
casa --feed-only
casa add
```

### Backward Compatibility

The new CLI maintains backward compatibility for the most common use case:

```bash
# This still works!
casa /path/to/feed.md
```

When you provide a path that looks like a feed file (ends with `.md`, `.org`, `.txt`, `.adoc`, or contains `/`), it will be treated as `casa timeline <path>`.

import meow from 'meow'
import pkg from './package.json'
import { loadConfig, initCommand } from './src/init/index'
import { timelineCommand } from './src/timeline/index'
import { addCommand } from './src/add/index'
import { buildCommand } from './src/build/index'
import { pagesCommand } from './src/pages/index'

const CLIENT = `${pkg.name} v${pkg.version}`

const cli = meow(
  `${CLIENT} - Reference implementation for plaintext.casa feeds

    Usage
      $ casa <command> [options]

    Commands
      init <feed>        Initialize config with feed path
      timeline [page]    View timeline from feed (default)*
      add [page]         Add a new post to feed*
      pages              List all pages in feed*
      build              Generate static website*

    Options
      --feed-only        Show only the feed without followed feeds (timeline)
      -h, --help         Show help
      -v, --version      Show version

    Examples
      $ casa init feed.md
      $ casa timeline
      $ casa timeline --feed-only
      $ casa add

    *) The build and pages commands are not yet fully implemented!
  `.trim(),
  {
    importMeta: import.meta,
    flags: {
      help: {
        shortFlag: 'h',
      },
      version: {
        shortFlag: 'v',
      },
      feedOnly: {
        type: 'boolean',
        default: false,
      },
      outputDir: {
        type: 'string',
      },
      templateDir: {
        type: 'string',
      },
    },
    version: CLIENT,
  },
)

const command = cli.input[0]
const target = cli.input[1]

// Load config
const config = loadConfig()

function checkTarget(target?: string, showHelp = false): string {
  if (!target) {
    console.error('No feed specified and no config found.')
    console.error('Run "casa init <feed>" first or specify feed path.')
    if (showHelp) cli.showHelp(1)
    else process.exit(1)
  }
  return target!
}

async function main() {
  // Route to appropriate command
  switch (command) {
    case 'init': {
      checkTarget(target)
      initCommand({ feed: target })
      break
    }

    case 'timeline': {
      const feedPath = checkTarget(target || config?.feed)
      await timelineCommand({
        feedPath,
        feedOnly: cli.flags.feedOnly,
      })
      break
    }

    case 'add': {
      const feedPath = checkTarget(target || config?.feed)
      await addCommand({
        feedPath,
        client: CLIENT,
      })
      break
    }

    case 'build': {
      const feedPath = checkTarget(target || config?.feed)
      await buildCommand({
        feedPath,
        outputDir: cli.flags.outputDir,
        templateDir: cli.flags.templateDir,
      })
      break
    }

    case 'pages': {
      const feedPath = checkTarget(target || config?.feed)
      await pagesCommand({ feedPath })
      break
    }

    case undefined: {
      // Default to timeline if no command given
      const feedPath = checkTarget(target || config?.feed, true)
      await timelineCommand({
        feedPath,
        feedOnly: cli.flags.feedOnly,
      })
      break
    }

    default: {
      // Check if the "command" looks like a file path
      if (
        command &&
        (command.endsWith('.md') ||
          command.endsWith('.txt') ||
          command.endsWith('.org') ||
          command.endsWith('.adoc') ||
          command.includes('/'))
      ) {
        // Treat as feed path for timeline command
        await timelineCommand({
          feedPath: command,
          feedOnly: cli.flags.feedOnly,
        })
      } else {
        console.error(`Unknown command: ${command}`)
        cli.showHelp(1)
      }
    }
  }
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})

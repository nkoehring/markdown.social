import fs from 'fs'
import { resolve } from 'path'
import { pipeline } from 'node:stream/promises'
import meow from 'meow'
import parseFeed from './lib'
import { renderMarkdownFeed, renderTimeline } from './src/cli-renderer'
import { assembleTimeline } from './src/timeline'

const cli = meow(
  `
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
  `,
  {
    importMeta: import.meta,
    flags: {
      feed: {
        type: 'string',
        shortFlag: 'f',
      },
      timeline: {
        type: 'boolean',
        default: true,
      },
      feedOnly: {
        type: 'boolean',
        default: false,
      },
    },
  },
)

const filePath = cli.input.at(0)

if (!filePath) {
  console.error('Path to feed is mandatory.')
  cli.showHelp(1)
} else {
  void readFeedFile(filePath)
}

async function readFeedFile(filePath: string) {
  const absPath = resolve(filePath)
  const readStream = fs.createReadStream(absPath, { encoding: 'utf8' })
  const chunks: string[] = []

  try {
    for await (const chunk of readStream) chunks.push(chunk)
    const rawFeed = chunks.join()
    const fileFormat = filePath.split('.').at(-1)
    const parsedFeed = parseFeed(rawFeed, fileFormat)

    // TODO: handle errors and warnings?

    // If --feed-only flag is set, just show the feed
    if (cli.flags.feedOnly) {
      const renderedFeed = await renderMarkdownFeed(parsedFeed.feed)
      console.log(renderedFeed)
      return
    }

    // Default behavior: assemble timeline from followed feeds
    if (cli.flags.timeline) {
      const followCount = parsedFeed.feed.follows?.length || 0

      if (followCount > 0) {
        console.error(
          `\nAssembling timeline from ${followCount} followed feed${followCount === 1 ? '' : 's'}...\n`,
        )
      }

      const timelineResult = await assembleTimeline(parsedFeed.feed, absPath)

      // Show any errors that occurred while fetching followed feeds
      if (timelineResult.errors.length > 0) {
        console.error('Errors fetching followed feeds:')
        timelineResult.errors.forEach(({ url, error }) => {
          console.error(`  - ${url}: ${error}`)
        })
        console.error('')
      }

      const renderedTimeline = await renderTimeline(timelineResult.posts)
      console.log(renderedTimeline)
    } else {
      // Fallback: just show the feed
      const renderedFeed = await renderMarkdownFeed(parsedFeed.feed)
      console.log(renderedFeed)
    }
  } catch (err) {
    console.error('Failed to read feed at', absPath, err)
    process.exit(1)
  }
}

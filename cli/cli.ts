import fs from 'fs'
import { resolve } from 'path'
import { pipeline } from 'node:stream/promises'
import meow from 'meow'
import parseFeed, { assembleTimeline } from 'plaintext-casa'
import { renderMarkdownFeed, renderTimeline } from './src/cli-renderer'
import pkg from './package.json'

const CLIENT = `${pkg.name} v${pkg.version}`

const cli = meow(
  `${CLIENT} is a reference implementation for handling plaintext-casa feeds.

    Usage
        $ casa <feed>

    Options
    -t --timeline          Assemble timeline from followed feeds (default)
    -a --add               Add a new post to the feed and open in editor
    -o --feed-only         Show only the feed without timeline assembly
    -h --help              Displays this message
    -v --version           Displays the version number

    Examples
       $ casa feed.md
       $ casa --timeline feed.md
       $ casa --feed-only feed.md
       $ casa --add feed.md
  `.trim(),
  {
    importMeta: import.meta,
    flags: {
      feed: {
        type: 'string',
      },
      help: {
        shortFlag: 'h',
      },
      version: {
        shortFlag: 'v',
      },
      timeline: {
        type: 'boolean',
        shortFlag: 't',
        default: true,
      },
      feedOnly: {
        type: 'boolean',
        shortFlag: 'o',
        default: false,
      },
      add: {
        type: 'boolean',
        shortFlag: 'a',
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

function checkFileAccess(absPath: string, mode = fs.constants.R_OK): boolean {
  try {
    fs.accessSync(absPath, fs.constants.R_OK | fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

async function addPostToFeed(absPath: string) {
  try {
    // Generate RFC 3339 timestamp as ID
    const timestamp = new Date().toISOString()

    // Create new post with minimal metadata
    // Ensure proper spacing: newline then blank line, then post marker
    const newPost = `\n**\n:id: ${timestamp}\n:client: ${CLIENT}\n\nWrite here...\n`

    // Append to the feed file
    await fs.promises.appendFile(absPath, newPost, 'utf8')

    console.debug(`\nNew post added with ID: ${timestamp}`)

    // Get the editor from environment variables
    const editor = process.env.VISUAL || process.env.EDITOR || 'vi'
    console.debug(`Opening feed in editor: ${editor}`)

    // Open the file in the editor
    const { spawn } = await import('child_process')
    const editorProcess = spawn(editor, [absPath], {
      stdio: 'inherit',
    })

    editorProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error('\nEditor exited with code:', code)
        process.exit(1)
      }
    })
  } catch (err) {
    console.error('Failed to add post to feed at', absPath, err)
    process.exit(1)
  }
}

async function readFeedFile(filePath: string) {
  const absPath = resolve(filePath)

  // Handle --add flag
  if (cli.flags.add) {
    if (!checkFileAccess(absPath, fs.constants.W_OK)) {
      console.error('Cannot add post, because file is not writable!')
      process.exit(1)
    }

    await addPostToFeed(absPath)
    return
  }

  if (!checkFileAccess(absPath)) {
    console.error('Cannot access feed at', absPath)
    process.exit(1)
  }

  const readStream = fs.createReadStream(absPath, { encoding: 'utf8' })
  const chunks: string[] = []

  try {
    for await (const chunk of readStream) chunks.push(chunk)
    const rawFeed = chunks.join()

    const fileFormat = filePath.split('.').at(-1)
    const parsedFeed = parseFeed(rawFeed, fileFormat)

    // TODO: handle parser errors and warnings?

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

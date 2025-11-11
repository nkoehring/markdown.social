import fs from 'fs'
import { resolve } from 'path'
import { pipeline } from 'node:stream/promises'
import meow from 'meow'
import parseFeed from './lib'
import { renderMarkdownFeed } from './src/cli-renderer'

const cli = meow(
  `
    Usage
        $ casa <feed>

    Options
    --help                 Displays this message
    --version              Displays the version number

    Example
       $ casa feed.md
  `,
  {
    importMeta: import.meta,
    flags: {
      feed: {
        type: "string",
        shortFlag: "f",
      },
    },
  }
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
    const renderedFeed = renderMarkdownFeed(parsedFeed.content)
    console.log(renderedFeed)

  } catch(err) {
    console.error('Failed to read feed at', absPath, err)
    process.exit(1)
  }
}

import fs from 'fs';
import { pipeline } from 'node:stream/promises';
import meow from 'meow'
import parseFeed from './lib'

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
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' })
  const chunks: string[] = []

  try {
    for await (const chunk of readStream) chunks.push(chunk)
    const rawFeed = chunks.join()
    const fileFormat = filePath.split('.').at(-1)
    const parsedFeed = parseFeed(rawFeed, fileFormat)

    console.log(parseFeed(chunks.join()))
  } catch(err) {
    console.error('Failed to read feed at', filePath, err.code)
    process.exit(1)
  }
}

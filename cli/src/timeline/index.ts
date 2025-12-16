import fs from 'fs'
import { resolve } from 'path'
import parseFeed, { assembleTimeline } from 'plaintext-casa'
import { renderMarkdownFeed, renderTimeline } from './renderer'

export interface TimelineOptions {
  feedPath: string
  feedOnly?: boolean
}

/**
 * Display timeline from a feed, optionally including followed feeds
 */
export async function timelineCommand(options: TimelineOptions): Promise<void> {
  const absPath = resolve(options.feedPath)

  if (!checkFileAccess(absPath)) {
    console.error('Cannot access feed at', absPath)
    process.exit(1)
  }

  const readStream = fs.createReadStream(absPath, { encoding: 'utf8' })
  const chunks: string[] = []

  try {
    for await (const chunk of readStream) chunks.push(chunk)
    const rawFeed = chunks.join()

    const fileFormat = options.feedPath.split('.').at(-1)
    const parsedFeed = parseFeed(rawFeed, fileFormat)

    // TODO: handle parser errors and warnings?

    // If --feed-only flag is set, just show the feed
    if (options.feedOnly) {
      const renderedFeed = await renderMarkdownFeed(parsedFeed.feed)
      console.log(renderedFeed)
      return
    }

    // Default behavior: assemble timeline from followed feeds
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
  } catch (err) {
    console.error('Failed to read feed at', absPath, err)
    process.exit(1)
  }
}

function checkFileAccess(absPath: string, mode = fs.constants.R_OK): boolean {
  try {
    fs.accessSync(absPath, mode)
    return true
  } catch {
    return false
  }
}

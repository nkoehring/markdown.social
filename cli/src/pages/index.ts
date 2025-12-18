import { readFile, access, constants } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import parseFeed from 'plaintext-casa'

export interface PagesOptions {
  feedPath: string
}

async function checkFileAccess(
  absPath: string,
  mode = constants.R_OK,
): Promise<boolean> {
  try {
    await access(absPath, mode)
    return true
  } catch {
    return false
  }
}
/**

 * List all pages in a feed
 */
export async function pagesCommand(options: PagesOptions): Promise<void> {
  const absPath = resolve(options.feedPath)

  try {
    // Read and parse the feed
    const rawFeed = await readFile(absPath, 'utf8')
    const parsedFeed = parseFeed(rawFeed)

    const pages = parsedFeed.feed.pages

    if (pages.length === 0) {
      console.log('No pages defined.')
      return
    }

    console.warn('⚠️ Pages are not yet included in feeds!')
    console.log('Pages:')
    pages.forEach(async (page) => {
      const path = resolve(dirname(absPath), 'plaintext.casa', page)
      const isReadable = await checkFileAccess(path)
      console.log(`  - ${page} ${!isReadable ? '(⚠️ not readable!)' : ''}`)
    })
  } catch (err) {
    console.error('Failed to read feed:', err)
    process.exit(1)
  }
}

import type { Feed, Post } from './types'
import parseFeed from '../lib'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

export interface TimelinePost extends Post {
  feedTitle: string
  feedAuthor: string
  givenName?: string
  feedUrl?: string
  fetchedAt: Date
}

export interface TimelineResult {
  posts: TimelinePost[]
  errors: Array<{ url: string; error: string }>
}

/**
 * Parses a follow entry in the format "name url" or just "url"
 */
function parseFollowEntry(
  followEntry: string,
): { givenName?: string; url: string } | null {
  const trimmed = followEntry.trim()
  if (!trimmed) return null

  // Try to split by whitespace - format: "name url"
  const parts = trimmed.split(/\s+/)

  if (parts.length >= 2) {
    // Format: "name url"
    const url = parts[parts.length - 1]!
    const givenName = parts.slice(0, -1).join(' ')
    return { givenName, url }
  } else if (parts.length === 1) {
    // Format: just "url"
    const url = parts[0]!
    return { url }
  }

  return null
}

/**
 * Fetches a feed from a URL and parses it
 * Supports both HTTP(S) URLs and file:// URLs
 */
async function fetchAndParseFeed(url: string): Promise<Feed | null> {
  try {
    let rawFeed: string
    let fileFormat: string | undefined

    // Handle file:// URLs
    if (url.startsWith('file://')) {
      const filePath = fileURLToPath(url)
      rawFeed = await fs.readFile(filePath, 'utf-8')

      // Determine format from file extension
      if (filePath.endsWith('.md') || filePath.endsWith('.markdown')) {
        fileFormat = 'md'
      } else if (filePath.endsWith('.org')) {
        fileFormat = 'org'
      } else if (filePath.endsWith('.adoc') || filePath.endsWith('.asciidoc')) {
        fileFormat = 'adoc'
      } else if (filePath.endsWith('.txt') || filePath.endsWith('.text')) {
        fileFormat = 'txt'
      }
    } else {
      // Handle HTTP(S) URLs
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type') || ''
      rawFeed = await response.text()

      // Try to determine file format from URL or content-type
      if (url.endsWith('.md') || url.endsWith('.markdown')) {
        fileFormat = 'md'
      } else if (url.endsWith('.org')) {
        fileFormat = 'org'
      } else if (url.endsWith('.adoc') || url.endsWith('.asciidoc')) {
        fileFormat = 'adoc'
      } else if (url.endsWith('.txt') || url.endsWith('.text')) {
        fileFormat = 'txt'
      } else if (contentType.includes('markdown')) {
        fileFormat = 'md'
      } else if (contentType.includes('text/plain')) {
        fileFormat = 'txt'
      }
    }

    const parseResult = parseFeed(rawFeed, fileFormat)
    return parseResult.feed
  } catch (error) {
    // Don't log here - let caller handle error reporting
    return null
  }
}

/**
 * Extracts posts from a feed and tags them with feed metadata
 */
function extractPostsFromFeed(
  feed: Feed,
  feedUrl?: string,
  givenName?: string,
): TimelinePost[] {
  const fetchedAt = new Date()
  return feed.posts.map((post) => ({
    ...post,
    feedTitle: feed.title,
    feedAuthor: feed.author,
    feedUrl,
    givenName,
    fetchedAt,
  }))
}

/**
 * Gets the date to use for sorting a post
 * Priority: 1) date field, 2) id if valid date, 3) fetchedAt time
 */
function getPostSortDate(post: TimelinePost): Date {
  // First try the explicit date field
  if (post.date) {
    const date = new Date(post.date)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Then try the id as a date
  const idDate = new Date(post.id)
  if (!isNaN(idDate.getTime())) {
    return idDate
  }

  // Fall back to fetch time
  return post.fetchedAt
}

/**
 * Sorts posts by their date (newest last)
 * Uses date field if present, falls back to ID if it's a valid date,
 * otherwise uses the time when the feed was fetched
 */
function sortPostsByDate(posts: TimelinePost[]): TimelinePost[] {
  return posts.sort((a, b) => {
    const dateA = getPostSortDate(a)
    const dateB = getPostSortDate(b)
    return dateA.getTime() - dateB.getTime() // Newest last
  })
}

/**
 * Assembles a timeline from a user's feed and all followed feeds
 */
export async function assembleTimeline(
  userFeed: Feed,
  userFeedUrl?: string,
): Promise<TimelineResult> {
  const allPosts: TimelinePost[] = []
  const errors: Array<{ url: string; error: string }> = []

  // Add user's own posts
  const userPosts = extractPostsFromFeed(userFeed, userFeedUrl, 'me')
  allPosts.push(...userPosts)

  // Parse follows
  const follows = userFeed.follows || []

  if (follows.length === 0) {
    // No follows, just return user's posts
    return {
      posts: sortPostsByDate(allPosts),
      errors,
    }
  }

  // Fetch and parse all followed feeds
  const followPromises = follows.map(async (followEntry) => {
    const parsedFollow = parseFollowEntry(followEntry)

    if (!parsedFollow) {
      errors.push({
        url: followEntry,
        error: 'Invalid follow entry format',
      })
      return
    }

    const { url, givenName } = parsedFollow

    try {
      const feed = await fetchAndParseFeed(url)

      if (feed) {
        const posts = extractPostsFromFeed(feed, url, givenName)
        allPosts.push(...posts)
      } else {
        errors.push({
          url,
          error:
            'Could not fetch or parse the feed (check URL or network connection)',
        })
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred'
      errors.push({
        url,
        error: errorMsg,
      })
    }
  })

  // Wait for all feeds to be fetched
  await Promise.all(followPromises)

  // Sort all posts by date (newest first)
  const sortedPosts = sortPostsByDate(allPosts)

  return {
    posts: sortedPosts,
    errors,
  }
}

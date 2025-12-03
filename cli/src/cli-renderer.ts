import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

import type { Feed, Post } from './types'

marked.use(markedTerminal({ reflowText: true, tab: 2 }))

const knownFields = [
  'title',
  'author',
  'description',
  'lang',
  'avatar',
  'links',
  'follows',
  'pages',
  'about',
  'posts',
]

function feedHeaderToMd(feed: Feed): string {
  let md = `# ${feed.title}\n`

  md += `| **Author** | ${feed.author} |\n`
  md += `| --- | --- |\n`

  if (feed.description) md += `| **Description** | ${feed.description} |\n`
  if (feed.lang) md += `| **Language** | ${feed.lang} |\n`
  if (feed.links?.length) {
    md += `| **Links** | ${feed.links[0]} |\n`
    md += feed.links
      .slice(1)
      .map((l) => `| | ${l} |`)
      .join('\n')
  }
  if (feed.follows?.length) {
    md += `| **Follows** | ${feed.follows[0]} |\n`
    md += feed.follows
      .slice(1)
      .map((l) => `| | ${l} |`)
      .join('\n')
  }

  return md
}

function postToMd(post: Post): string {
  let md = `\n\n| 🆔 | ${post.id} |\n`
  md += '|---|---|\n'

  if (post.lang) md += `| 🌐 | ${post.lang} |\n`
  if (post.tags) md += `| ♯ | #${post.tags.split(' ').join(' #')} |\n`
  if (post.mood) md += `| 🎭 | ${post.mood} |\n`
  if (post.content_warning) md += `| ⚠️ | ${post.content_warning} |\n`
  if (post.reply_to) md += `| ↪️ | ${post.reply_to} |\n`

  md += `\n\n${post.content}\n`

  return md
}

export async function renderMarkdownFeed(feed: Feed): Promise<string> {
  let md = `${feedHeaderToMd(feed)}

## About

${feed.about}\n\n---\n\n`

  feed.posts.forEach((post) => {
    md += postToMd(post)
  })

  return marked.parse(md)
}

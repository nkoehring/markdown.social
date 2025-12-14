import { marked, type MarkedExtension } from 'marked'
import { markedTerminal } from 'marked-terminal'

import type { Feed, Post, TimelinePost } from 'plaintext-casa'

const termRenderer = markedTerminal({
  width: 80,
  reflowText: true,
  tab: 2,
  tableOptions: {
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
  },
}) as MarkedExtension
marked.use(termRenderer)

const stringFieldRenderer = (v: string, f: string) => `| **${f}** | ${v} |`
const listFieldRenderer = (v: string[], f: string) => {
  if (v.length === 0) return `| **${f}** | none |`
  if (v.length === 1) return `| **${f}** | ${v[0]} |`

  return (
    `| **${f}** | ${v[0]} |\n` +
    v
      .slice(1)
      .map((l) => `| | ${l} |`)
      .join('\n')
  )
}

const headerFields = {
  title: (v: string) => `# ${v}`,
  author: stringFieldRenderer,
  _separator: () => '| --- | --- |',
  description: stringFieldRenderer,
  lang: stringFieldRenderer,
  client: stringFieldRenderer,
  avatar: stringFieldRenderer,
  links: listFieldRenderer,
  follows: listFieldRenderer,
  pages: listFieldRenderer,
}

export function feedHeaderToMd(feed: Feed): string {
  return Object.entries(headerFields)
    .map(([key, render]) => {
      const x = feed[key as keyof Feed]
      if (!x && !key.startsWith('_')) return null
      const value = x as string & string[] // ugh
      const field = key[0]?.toLocaleUpperCase() + key.slice(1)
      return render(value, field)
    })
    .filter((v) => v)
    .join('\n')
}

export function postToMd(post: Post): string {
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
\n\n---\n\n${feed.about}\n\n---\n\n`

  feed.posts.forEach((post) => {
    md += postToMd(post)
  })

  return marked.parse(md)
}

function timelinePostToMd(post: TimelinePost): string {
  let author = `**${post.feedAuthor}**`
  if (post.givenName && post.feedAuthor !== post.givenName)
    author += ` (${post.givenName})`

  let md = `\n\n| 👤 | ${author} |\n`
  md += '|---|---|\n'
  md += `| 🆔 | ${post.id} |\n`

  if (post.date) md += `| ⌚ | ${post.date} |\n`
  if (post.feedUrl) md += `| 🔗 | ${post.feedUrl} |\n`
  if (post.lang) md += `| 🌐 | ${post.lang} |\n`
  if (post.tags) md += `| ♯ | #${post.tags.split(' ').join(' #')} |\n`
  if (post.mood) md += `| 🎭 | ${post.mood} |\n`
  if (post.content_warning) md += `| ⚠️ | ${post.content_warning} |\n`
  if (post.reply_to) md += `| ↪️ | ${post.reply_to} |\n`

  md += `\n\n${post.content}\n`

  return md
}

export async function renderTimeline(posts: TimelinePost[]): Promise<string> {
  let md = `# Timeline\n\n---\n\n`

  posts.forEach((post) => {
    md += timelinePostToMd(post)
  })

  return marked.parse(md)
}

import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

marked.use(markedTerminal({ reflowText: true, tab: 2 }));

const knownFields = [
  'title', 'author', 'description',
  'lang', 'avatar', 'links', 'follows', 'pages',
  'about', 'posts'
]

function feedHeaderToMd(feed: Feed): string {
  let md = `# ${feed.title}\n`

  md += `| **Author** | ${feed.author} |\n`
  md += `| --- | --- |\n`

  if (feed.description) md += `| **Description** | ${feed.description} |\n`
  if (feed.lang) md += `| **Language** | ${feed.lang} |\n`
  if (feed.links?.length) {
    md += `| **Links** | ${feed.links[0]} |\n`
    md += feed.links.slice(1).map(l => `| | ${l} |`).join('\n')
  }
  if (feed.follows?.length) {
    md += `| **Follows** | ${feed.follows[0]} |\n`
    md += feed.follows.slice(1).map(l => `| | ${l} |`).join('\n')
  }

  return md
}

function postToMd(post: Post): string {
  let md = `| **ID** | ${post.id} |\n`
  md += `| --- | --- |\n`

  if (post.lang) md += `| **Language** | ${post.lang} |\n`
  if (post.tags) md += `| **Tags** | ${post.tags} |\n`
  if (post.mood) md += `| **Mood** | ${post.mood} |\n`
  if (post.content_warning) md += `| **Content Warning** | ${post.content_warning} |\n`
  if (post.reply_to) md += `| **Reply To** | ${post.reply_to} |\n`

  md += `\n\n${post.content}\n`

  return md
}

export function renderMarkdownFeed(feed: Feed): void {
  let md = `${feedHeaderToMd(feed)}

## About

${feed.about}\n\n---\n\n`

  feed.posts.forEach(post => {
    md += postToMd(post)
  })

  return marked.parse(md)
}

export interface ParserConfig {
  singleFields: string[]
  multiFields: string[]
}

interface ParsedMetaData {
  [key: string]: string | string[]
}

function parseField(line: string): { field: string, value: string } {
  const [_1, field, _2, value] = line.split(':')
  return { field, value: value.trim() }
}

function parseFromRaw(raw: string): Feed {
  const feed: Feed = {
    title: '',
    author: '',
    description: '',
    lang: null,
    avatar: null,
    links: [],
    follows: [],
    pages: [],
    posts: [],
  }

  const lines = raw.split('\n')
  const headerLines: string[] = []
  const aboutLines: string[] = []
  const posts: { metaLines: string[], contentLines: string[] }[] = []

  let state: 'meta'|'about'|'post-meta'|'post-content' = 'meta'

  lines.forEach((line, i) => {
    const empty = line.trim().length === 0

    switch (state) {
      case 'meta':
        if (line.trim().length === 0) state = 'about'
        else headerLines.push(line)
        break
      case 'about':
        if (line.trim() === '**' && lines[i+1].trim()[0] === ':') {
          posts.push({ metaLines: [], contentLines: [] })
          state = 'post-meta'
        } else aboutLines.push(line)
        break
      case 'post-meta':
        if (line.trim().length === 0) state = 'post-content'
        else posts.at(-1).metaLines.push(line)
        break
      case 'post-content':
        if (line.trim() === '**' && lines[i+1].trim()[0] === ':') {
          posts.push({ metaLines: [], contentLines: [] })
          state = 'post-meta'
        } else posts.at(-1).contentLines.push(line)
        break
    }
  })

  return { headerLines, aboutLines, posts }
}

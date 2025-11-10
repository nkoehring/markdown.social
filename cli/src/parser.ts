import { warnMsg, errMsg } from './util'

interface ParserResult<T> {
  content: T
  warnings: DebugMessage[]
  errors: DebugMessage[]
}

interface FieldConfig {
  label: string
  multi?: boolean
  required?: boolean
  alias?: string
}

export interface ParserConfig {
  fields: FieldConfig[]
  debug: boolean
}

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

export const defaultConfig: ParserConfig = Object.freeze({
  fields: [
    { label: 'title', required: true },
    { label: 'author', required: true, alias: 'nick' },
    { label: 'description', required: false },
    { label: 'lang', required: false },
    { label: 'avatar', required: false },
    { label: 'links', required: false, multi: true },
    { label: 'follows', required: false, multi: true },
    { label: 'pages', required: false, multi: true },
    { label: 'posts', required: false, multi: true },
  ],
  debug: true,
})

interface ParsedMetaData {
  [key: string]: string | string[]
}

const metaDataRegex = new RegExp(/^:([^:]+):\s*(.*)$/)
const allowedTitleMarkers = ['# ', '= ']

export function parseHeader(
  headerLines: string[],
  config: ParserConfig,
): ParserResult {
  const content: ParsedHeader = {}
  const warnings: DebugMessage[] = []
  const errors: DebugMessage[] = []
  const { fields, debug } = config

  const singleFields = fields.filter(f => !f.multi).map(f => f.label)
  const multiFields = fields.filter(f => f.multi).map(f => f.label)
  const requiredFields = fields.filter(f => f.required)

  // Initialize multi-fields with empty arrays
  multiFields.forEach(field => content[`${field}s`] = [])

  let lineIdx = 0

  // DocumentHeaders in Markdown or AsciiDoc are allowed to start with a title
  // that is formatted in its native format
  const firstChars = headerLines[0].slice(0,2)
  if (allowedTitleMarkers.includes(firstChars)) {
    content['title'] = headerLines.shift().slice(2)
    lineIdx++
  }

  for (const line of headerLines) {
    lineIdx++

    const match = line.match(metaDataRegex)
    // TODO: skip parsing alltogether or ignore invalid lines?
    if (!match) continue

    const key = match[1].trim()
    const value = match[2].trim()

    if (singleFields.includes(key)) {
      if (debug && content.hasOwnProperty(key)) {
        // if single key appear multiple times, last occurence wins
        warnings.push(warnMsg(
          `Field "${key} marked as single, but appeared multiple times!"`,
          lineIdx
        ))
      }
      content[key] = value
    } else if (multiFields.includes(key)) {
      ;(content[`${key}s`] as string[]).push(value)
    } else {
      // Unknown fields are treatet as simple string fields
      content[key] = value
    }
  }

  const foundFields = Object.keys(content)
  for (const { label, alias } of requiredFields) {
    if (foundFields.includes(label)) continue
    if (foundFields.includes(alias)) {
      content[label] = content[alias]
      delete content[alias]
      continue
    }
    errors.push(errMsg(`Required field "${label}" not defined!`))
  }

  return { content, warnings, errors }
}

function parseFromRaw(raw: string): Feed {

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

  const result = parseHeader(headerLines, parserConfig)

  return { headerLines, aboutLines, posts }
}

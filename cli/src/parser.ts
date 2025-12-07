import { warnMsg, errMsg } from './util'
import type { Feed, Post, DebugMessage } from './types'

interface ParserResult<T> {
  content: T
  warnings: DebugMessage[]
  errors: DebugMessage[]
}

interface FeedParserResult {
  feed: Feed
  warnings: {
    header: DebugMessage[]
    posts: DebugMessage[][]
  }
  errors: {
    header: DebugMessage[]
    posts: DebugMessage[][]
  }
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

export const defaultConfigFeed: ParserConfig = Object.freeze({
  fields: [
    { label: 'title', required: true },
    { label: 'author', required: true, alias: 'nick' },
    { label: 'description', required: false },
    { label: 'lang', required: false },
    { label: 'avatar', required: false },
    { label: 'link', required: false, multi: true },
    { label: 'follow', required: false, multi: true },
    { label: 'page', required: false, multi: true },
  ],
  debug: true,
})

export const defaultConfigPost: ParserConfig = Object.freeze({
  fields: [
    { label: 'id', required: true },
    { label: 'date', required: false },
    { label: 'lang', required: false },
    { label: 'tags', required: false },
    { label: 'mood', required: false },
    { label: 'content_warning', required: false },
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
): ParserResult<ParsedMetaData> {
  const content: ParsedMetaData = {}
  const warnings: DebugMessage[] = []
  const errors: DebugMessage[] = []
  const { fields, debug } = config

  const singleFields = fields.filter((f) => !f.multi).map((f) => f.label)
  const multiFields = fields.filter((f) => f.multi).map((f) => f.label)
  const requiredFields = fields.filter((f) => f.required)

  // Initialize multi-fields with empty arrays
  multiFields.forEach((field) => (content[`${field}s`] = []))

  let lineIdx = 0

  // DocumentHeaders in Markdown or AsciiDoc are allowed to start with a title
  // that is formatted in its native format
  const firstChars = headerLines.length ? headerLines[0]!.slice(0, 2) : ''
  if (allowedTitleMarkers.includes(firstChars)) {
    content['title'] = headerLines.shift()!.slice(2)
    lineIdx++
  }

  for (const line of headerLines) {
    lineIdx++

    const match = line.match(metaDataRegex)
    // TODO: skip parsing alltogether or ignore invalid lines?
    if (!match) continue

    const key = match[1]!.trim()
    const value = match[2]!.trim()

    if (singleFields.includes(key)) {
      if (debug && content.hasOwnProperty(key)) {
        // if single key appear multiple times, last occurence wins
        warnings.push(
          warnMsg(
            `Field "${key} marked as single, but appeared multiple times!"`,
            lineIdx,
          ),
        )
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
    if (alias && foundFields.includes(alias)) {
      content[label] = content[alias]!
      delete content[alias]
      continue
    }
    errors.push(errMsg(`Required field "${label}" not defined!`))
  }

  return { content, warnings, errors }
}

export function parseFromRaw(
  raw: string,
  feedConfig = defaultConfigFeed,
  postConfig = defaultConfigPost,
): FeedParserResult {
  const lines = raw.split('\n')
  const headerLines: string[] = []
  const aboutLines: string[] = []
  const posts: { metaLines: string[]; contentLines: string[] }[] = []

  let state: 'meta' | 'about' | 'post-meta' | 'post-content' = 'meta'

  lines.forEach((line, i) => {
    const currentLine = line.trim()
    const empty = currentLine.length === 0
    const nextLineFirstChar = lines[i + 1]?.[0]

    switch (state) {
      case 'meta':
        if (empty) state = 'about'
        else headerLines.push(currentLine)
        break
      case 'about':
        if (currentLine === '**' && nextLineFirstChar === ':') {
          posts.push({ metaLines: [], contentLines: [] })
          state = 'post-meta'
        } else aboutLines.push(line)
        break
      case 'post-meta':
        if (empty) state = 'post-content'
        else posts.at(-1)!.metaLines.push(line)
        break
      case 'post-content':
        if (currentLine === '**' && nextLineFirstChar === ':') {
          posts.push({ metaLines: [], contentLines: [] })
          state = 'post-meta'
        } else posts.at(-1)!.contentLines.push(line)
        break
    }
  })

  const parsedDocumentHeader = parseHeader(headerLines, feedConfig)
  const parsedAboutSection = aboutLines.join('\n').trim()
  const parsedPosts = posts.map(({ metaLines, contentLines }) => {
    const header = parseHeader(metaLines, postConfig)
    const content = contentLines.join('\n').trim()
    return { header, content }
  })

  const warnings = {
    header: parsedDocumentHeader.warnings,
    posts: parsedPosts.map((p) => p.header.warnings),
  }

  const errors = {
    header: parsedDocumentHeader.errors,
    posts: parsedPosts.map((p) => p.header.errors),
  }

  return {
    feed: {
      ...parsedDocumentHeader.content,
      about: parsedAboutSection,
      posts: parsedPosts.map(
        (p) =>
          ({
            ...p.header.content,
            content: p.content,
          }) as Post,
      ),
    } as Feed,
    warnings,
    errors,
  }
}

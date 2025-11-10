import { warnMsg, errMsg } from './util'

interface FieldConfig {
  label: string
  multi?: boolean
  required?: boolean
  url?: boolean
}

export interface ParserConfig {
  fields: FieldConfig[]
  debug: boolean
}

interface ParsedMetaData {
  [key: string]: string | string[] | URL | URL[]
}

const metaDataRegex = new RegExp(/^:([^:]+):\s*(.*)$/)
const allowedTitleMarkers = ['# ', '= ']

export function parseHeader(headerLines: string[], config: ParserConfig): ParsedHeader {
  const result: ParsedHeader = {}
  const warnings: DebugMessage[] = []
  const errors: DebugMessage[] = []
  const { fields, debug } = config

  const singleFields = fields.filter(f => !f.multi).map(f => f.label)
  const multiFields = fields.filter(f => f.multi).map(f => f.label)
  const requiredFields = fields.filter(f => f.required).map(f => f.label)
  const urlFields = fields.filter(f => f.url).map(f => f.label)

  // Initialize multi-fields with empty arrays
  multiFields.forEach(field => result[`${field}s`] = [])

  let lineIdx = 0

  // DocumentHeaders in Markdown or AsciiDoc are allowed to start with a title
  // that is formatted in its native format
  const firstChars = headerLines[0].slice(0,2)
  if (allowedTitleMarkers.includes(firstChars)) {
    result['title'] = headerLines.shift().slice(2)
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
      if (debug && result.hasOwnProperty(key)) {
        // if single key appear multiple times, last occurence wins
        warnings.push(warnMsg(
          `Field "${key} marked as single, but appeared multiple times!"`,
          lineIdx
        ))
      }
      // parse URLs
      if (urlFields.includes(key)) {
        try {
          const url = new URL(value)
          result[key] = url
        } catch {
          errors.push(errMsg(`Field "${key} expected URL"`, lineIdx))
        }
      } else {
        result[key] = value
      }
    } else if (multiFields.includes(key)) {
      if (urlFields.includes(key)) {
        try {
          const url = new URL(value)
          ;(result[`${key}s`] as string[]).push(url)
        } catch(err) {
          errors.push(errMsg(`Field "${key}" expected URL. ${err}`, lineIdx))
        }
      } else {
        ;(result[`${key}s`] as string[]).push(value)
      }
    } else {
      // Unknown fields are treatet as simple string fields
      result[key] = value
    }
  }

  const foundFields = Object.keys(result)
  for (const field of requiredFields) {
    if (foundFields.includes(field)) continue
    errors.push(errMsg(`Required field "${field}" not defined!`))
  }

  return { result, warnings, errors }
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

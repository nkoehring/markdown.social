export type Severity = 'debug' | 'info' | 'warning' | 'error'

export interface DebugMessage {
  line: number
  message: string
  severity: Severity
}

export interface Post {
  id: string
  lang: string
  tags: string
  reply_to: URL
  mood: string
  content_warning: string
  content: string
}

export interface Feed {
  title: string
  author: string
  description: string
  lang: string | null
  avatar: string | null
  links: string[]
  follows: string[]
  pages: string[]
  about: string
  posts: Post[]
}

// for use with type guard
export type Rfc3339Date = string

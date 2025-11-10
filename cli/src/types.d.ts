declare global {
  type Severity = 'debug' | 'info' | 'warning' | 'error'

  interface DebugMessage {
    line: number
    message: string
    severity: Severity
  }

  interface Post {
    id: string
    lang: string
    tags: string[]
    reply_to: URL
    mood: string
    contentWarning: string
    content: string
  }

  interface Feed {
    title: string
    author: string
    description: string
    lang: string | null
    avatar: URL | null
    links: URL[]
    follows: {
      name: string
      url: URL
    }[]
    pages: URL[]
    posts: Post[]
  }

  // for use with type guard
  type Rfc3339Date = string
  
}

export {}

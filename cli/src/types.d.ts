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
    content_warning: string
    content: string
  }

  interface Feed {
    title: string
    author: string
    description: string
    lang: string | null
    avatar: string | null
    links: string[]
    follows: {
      name: string
      url: string
    }[]
    pages: string[]
    about: string
    posts: Post[]
  }

  // for use with type guard
  type Rfc3339Date = string
  
}

export {}

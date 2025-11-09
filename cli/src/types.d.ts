declare global {
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
  
}

export {}

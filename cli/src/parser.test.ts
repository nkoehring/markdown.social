import { describe, expect, test } from 'bun:test'
import { parseHeader, parseFromRaw } from './parser'

const headerPlain = `:title: Alice's Wonderland
:description: HTTP based social media and simplicity enthusiast
:author: Alice
:lang: en
:avatar: /avatar.jpg
:link: https://alice.wonder.land
:link: https://codeberg.org/alice
:link: mailto:alice@wonder.land
:follow: bob https://bob.tld/social.md
:follow: charlie https://charlie.tld/social.org
:follow: dieter https://dieter.tld/social.adoc
`

const headerMissingFields = `:title: Yet another feed
:description: This feed misses an author
`

const headerWithHeader = `# Alice's Wonderland
:author: Alice
:description: HTTP based social media and simplicity enthusiast
`
const headerWithAlias = `:title: Alice's Wonderland
:nick: Alice
:description: HTTP based social media and simplicity enthusiast
`

const feedPlain = `${headerPlain}

About me!
Yeah!

And another line.

**
:id: 2025-10-26T17:27:00Z
:lang: de
:mood: 😜

Ja, ich spreche auch Deutsch, wenn ich will!

**
:id: 2025-10-26T18:10:00Z

Another post
`

const parserConfig = {
  fields: [
    { label: 'title', required: true },
    { label: 'author', required: true, alias: 'nick' },
    { label: 'description', required: false },
    { label: 'link', multi: true },
    { label: 'follow', multi: true },
  ],
  debug: true,
}

describe("Parser", () => {
  test("plain header parsing without errors", () => {
    const headerLines = headerPlain.split('\n')
    const { content, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    expect(content).toMatchObject({
      title: 'Alice\'s Wonderland',
      author: 'Alice',
      description: 'HTTP based social media and simplicity enthusiast',
      lang: 'en',
      avatar: '/avatar.jpg',
      links: [
        'https://alice.wonder.land',
        'https://codeberg.org/alice',
        'mailto:alice@wonder.land',
      ],
      follows: [
        'bob https://bob.tld/social.md',
        'charlie https://charlie.tld/social.org',
        'dieter https://dieter.tld/social.adoc',
      ],
    })
  })

  test("header parsing error missing field", () => {
    const headerLines = headerMissingFields.split('\n')
    const { content, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors[0]).toMatchObject({
      line: -1,
      severity: 'error',
      message: 'Required field "author" not defined!',
    })
    expect(content).toMatchObject({
      title: 'Yet another feed',
      description: 'This feed misses an author',
    })
  })

  test("header parsing with markdown title", () => {
    const headerLines = headerWithHeader.split('\n')
    const { content, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    expect(content).toMatchObject({
      title: 'Alice\'s Wonderland',
      author: 'Alice',
      description: 'HTTP based social media and simplicity enthusiast',
    })
  })

  test("header parsing with alias", () => {
    const headerLines = headerWithAlias.split('\n')
    const { content, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    expect(content).toMatchObject({
      title: 'Alice\'s Wonderland',
      author: 'Alice',
      description: 'HTTP based social media and simplicity enthusiast',
    })
  })

  test("document parsing with default config", () => {
    const { header, about, posts, warnings, errors } = parseFromRaw(feedPlain)

    expect(warnings).toEqual({
      header: [],
      posts: [[], []],
    })
    expect(errors).toEqual({
      header: [],
      posts: [[], []],
    })
    expect(header).toMatchObject({})
    expect(about).toEqual('About me!\nYeah!\n\nAnd another line.')
    expect(posts).toEqual([
      'Ja, ich spreche auch Deutsch, wenn ich will!',
      'Another post',
    ])
  })
})

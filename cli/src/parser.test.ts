import { describe, expect, test } from 'bun:test'
import { parseHeader } from './parser'

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

const parserConfig = {
  fields: [
    { label: 'title', required: true },
    { label: 'author', required: true },
    { label: 'description', required: false },
    { label: 'link', multi: true, url: true },
    { label: 'follow', multi: true },
  ],
  debug: true,
}

describe("Parser", () => {
  test("plain header parsing without errors", () => {
    const headerLines = headerPlain.split('\n')
    const { result, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    expect(result).toMatchObject({
      title: 'Alice\'s Wonderland',
      author: 'Alice',
      description: 'HTTP based social media and simplicity enthusiast',
      lang: 'en',
      avatar: '/avatar.jpg',
      links: [
        new URL('https://alice.wonder.land'),
        new URL('https://codeberg.org/alice'),
        new URL('mailto:alice@wonder.land'),
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
    const { result, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors[0]).toMatchObject({
      line: -1,
      severity: 'error',
      message: 'Required field "author" not defined!',
    })
    expect(result).toMatchObject({
      title: 'Yet another feed',
      description: 'This feed misses an author',
    })
  })

  test("header parsing with markdown title", () => {
    const headerLines = headerWithHeader.split('\n')
    const { result, warnings, errors } = parseHeader(headerLines, parserConfig)

    expect(warnings).toEqual([])
    expect(errors).toEqual([])
    expect(result).toMatchObject({
      title: 'Alice\'s Wonderland',
      author: 'Alice',
      description: 'HTTP based social media and simplicity enthusiast',
    })
  })
})

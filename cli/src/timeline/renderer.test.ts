import { describe, expect, test } from 'bun:test'
import { feedHeaderToMd } from './renderer'

const fullFeed = {
  title: "Alice's Wonderland",
  description: 'HTTP based social media and simplicity enthusiast',
  author: 'Alice',
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
  pages: ['foo', 'bar', 'baz'],
  about: '',
  posts: [],
}

const minimalFeed = {
  title: 'title',
  description: 'description',
  author: 'author',
  links: ['https://example.com'],
  follows: [],
  pages: [],
  posts: [],
}

describe('feed header', () => {
  test('renders full header', () => {
    const output = feedHeaderToMd(fullFeed)
    const expectedOutput = `# Alice's Wonderland
| **Author** | Alice |
| --- | --- |
| **Description** | HTTP based social media and simplicity enthusiast |
| **Lang** | en |
| **Avatar** | /avatar.jpg |
| **Links** | https://alice.wonder.land |
| | https://codeberg.org/alice |
| | mailto:alice@wonder.land |
| **Follows** | bob https://bob.tld/social.md |
| | charlie https://charlie.tld/social.org |
| | dieter https://dieter.tld/social.adoc |
| **Pages** | foo |
| | bar |
| | baz |`.trim()

    expect(output).toEqual(expectedOutput)
  })

  test('renders minimal header', () => {
    const output = feedHeaderToMd(minimalFeed)
    const expectedOutput = `# title
| **Author** | author |
| --- | --- |
| **Description** | description |
| **Links** | https://example.com |
| **Follows** | none |
| **Pages** | none |`.trim()

    expect(output).toEqual(expectedOutput)
  })
})

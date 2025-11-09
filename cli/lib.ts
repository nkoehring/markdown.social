import markdownit from 'markdown-it'
import parseFeed from './src/parser'

const SUPPORTED_FORMATS = #{
  markdown: #{
    suffix: ['md', 'markdown'],
    nativeMetaData: false,
  },
  asciidoc: {
    suffix: ['adoc', 'asciidoc'],
    nativeMetaData: true,
  },
  orgmode: {
    suffix: ['org'],
    nativeMetaData: true,
  },
  text: {
    suffix: ['txt', 'text'],
    nativeMetaData: false,
  },
}

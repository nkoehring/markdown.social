import { describe, it, expect } from 'bun:test'
import {
  sanitizeFilename,
  generatePostSlug,
  getDefaultIndexTemplate,
  getDefaultPostTemplate,
  getDefaultStyles,
} from './generator'
import type { Post } from 'plaintext-casa'

describe('static-generator', () => {
  describe('sanitizeFilename', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeFilename('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(sanitizeFilename('my blog post')).toBe('my-blog-post')
    })

    it('should remove special characters', () => {
      expect(sanitizeFilename('Hello! @World #2024')).toBe('hello-world-2024')
    })

    it('should remove leading and trailing hyphens', () => {
      expect(sanitizeFilename('---hello---')).toBe('hello')
    })

    it('should handle multiple consecutive special chars', () => {
      expect(sanitizeFilename('hello!!!world')).toBe('hello-world')
    })

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(300)
      const result = sanitizeFilename(longString)
      expect(result.length).toBeLessThanOrEqual(200)
    })
  })

  describe('generatePostSlug', () => {
    it('should use date field if available', () => {
      const post: Post = {
        id: 'some-id',
        date: '2024-01-15T10:30:00Z',
        content: 'Hello world',
      }
      expect(generatePostSlug(post)).toBe('2024-01-15t10-30-00z')
    })

    it('should use ID if title is not available and ID is not a date', () => {
      const post: Post = {
        id: 'unique-post-identifier',
        content: 'Hello world',
      }
      expect(generatePostSlug(post)).toBe('unique-post-identifier')
    })

    it('should use date if ID looks like a date', () => {
      const post: Post = {
        id: '2024-01-15T10:30:00Z',
        content: 'Hello world',
      }
      expect(generatePostSlug(post)).toBe('2024-01-15t10-30-00z')
    })

    it('should use ID when date looks like a timestamp', () => {
      const post: Post = {
        id: '2024-01-15T10:30:00Z',
        content: 'Hello world',
      }
      expect(generatePostSlug(post)).toBe('2024-01-15t10-30-00z')
    })
  })

  describe('template functions', () => {
    it('should return default index template', () => {
      const template = getDefaultIndexTemplate()
      expect(template).toContain('<!DOCTYPE html>')
      expect(template).toContain('{{title}}')
      expect(template).toContain('{{#each posts}}')
    })

    it('should return default post template', () => {
      const template = getDefaultPostTemplate()
      expect(template).toContain('<!DOCTYPE html>')
      expect(template).toContain('{{title}}')
      expect(template).toContain('{{feedTitle}}')
    })

    it('should return default styles', () => {
      const styles = getDefaultStyles()
      expect(styles).toContain(':root')
      expect(styles).toContain('--font-sans')
      expect(styles).toContain('.timeline')
      expect(styles).toContain('article.post')
    })
  })
})

import { describe, expect, test } from 'bun:test'
import { isRfc3339Date } from './util'

describe('utils', () => {
  test('isRfc3339Date', () => {
    expect(isRfc3339Date('2025-10-10T10:00:00Z')).toBe(true)
    expect(isRfc3339Date('2025-10-10T10:00:00+0100')).toBe(false)
    expect(isRfc3339Date('2025-10-10T10:00:00+01:00')).toBe(true)
    expect(isRfc3339Date('2025-10-10 10:00:00+01:00')).toBe(false)
    expect(isRfc3339Date('25-10-10T10:00:00+01:00')).toBe(false)
    expect(isRfc3339Date('20251010T100000Z')).toBe(false)
  })
})


import { describe, it, expect } from 'vitest'
import { getNextVersion } from './generatedReportModel'

describe('getNextVersion', () => {
  it('increments integer version (v1 → v2)', () => {
    expect(getNextVersion('v1')).toBe('v2')
    expect(getNextVersion('v5')).toBe('v6')
    expect(getNextVersion('v12')).toBe('v13')
  })

  it('increments minor version (v0.1 → v0.2)', () => {
    expect(getNextVersion('v0.1')).toBe('v0.2')
    expect(getNextVersion('v1.3')).toBe('v1.4')
  })

  it('returns v1 for invalid format', () => {
    expect(getNextVersion('invalid')).toBe('v1')
    expect(getNextVersion('')).toBe('v1')
  })
})

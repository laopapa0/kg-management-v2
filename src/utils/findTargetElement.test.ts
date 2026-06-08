import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { findTargetElement } from './findTargetElement'

describe('findTargetElement', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('finds element by data-node-id', () => {
    const el = document.createElement('div')
    el.setAttribute('data-node-id', 'node-1')
    document.body.appendChild(el)

    expect(findTargetElement('node-1')).toBe(el)
  })

  it('finds element by data-tag-id', () => {
    const el = document.createElement('div')
    el.setAttribute('data-tag-id', 'tag-1')
    document.body.appendChild(el)

    expect(findTargetElement('tag-1')).toBe(el)
  })

  it('finds element by data-rule-id', () => {
    const el = document.createElement('div')
    el.setAttribute('data-rule-id', 'rule-1')
    document.body.appendChild(el)

    expect(findTargetElement('rule-1')).toBe(el)
  })

  it('finds element by data-indicator-id', () => {
    const el = document.createElement('div')
    el.setAttribute('data-indicator-id', 'ind-1')
    document.body.appendChild(el)

    expect(findTargetElement('ind-1')).toBe(el)
  })

  it('returns null when no element matches', () => {
    expect(findTargetElement('non-existent')).toBeNull()
  })

  it('prefers data-node-id over other selectors', () => {
    const nodeEl = document.createElement('div')
    nodeEl.setAttribute('data-node-id', 'shared-id')
    document.body.appendChild(nodeEl)

    const tagEl = document.createElement('div')
    tagEl.setAttribute('data-tag-id', 'shared-id')
    document.body.appendChild(tagEl)

    expect(findTargetElement('shared-id')).toBe(nodeEl)
  })
})

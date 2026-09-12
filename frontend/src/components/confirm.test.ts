import { expect, test } from 'vitest'
import { confirmDialog } from './confirm'

test('confirmDialog calls window.confirm with window as this', () => {
  const original = window.confirm
  const calls: string[] = []
  window.confirm = function (this: unknown, text?: string): boolean {
    expect(this).toBe(window)
    calls.push(text ?? '')
    return true
  }
  try {
    expect(confirmDialog('Are you sure?')).toEqual(true)
    expect(calls).toEqual(['Are you sure?'])
  } finally {
    window.confirm = original
  }
})

import { test } from '../../test'
import { assertDeepEqual, assertEqual } from '../../assert'
import { confirmDialog } from '../../../src/components/internal/confirm'

test('confirmDialog calls window.confirm with window as this', () => {
  const original = window.confirm
  const calls: string[] = []
  window.confirm = function (this: unknown, text?: string): boolean {
    assertEqual(this, window)
    calls.push(text ?? '')
    return true
  }
  try {
    assertEqual(confirmDialog('Are you sure?'), true)
    assertDeepEqual(calls, ['Are you sure?'])
  } finally {
    window.confirm = original
  }
})

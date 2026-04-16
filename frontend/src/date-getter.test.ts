import { expect, test } from 'vitest'
import { getDate } from './date-getter'

test('getDate', () => {
  const date = getDate()
  expect(date.getFullYear()).toBeGreaterThan(2000)
})

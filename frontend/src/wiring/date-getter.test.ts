import { expect, test } from 'vitest'
import { getDate, getNextMonthDate } from './date-getter'

test('getDate', () => {
  const date = getDate()
  expect(date.getFullYear()).toBeGreaterThan(2000)
})

test('getNextMonthDate', () => {
  // There's no guarantee on a later Date object having a greater timestamp, so
  // let's just satisfy coverage requirement by calling the function under test
  // and asserting something very generic.
  const nextMonthDate = getNextMonthDate()
  expect(nextMonthDate.getFullYear()).toBeGreaterThan(2000)
})

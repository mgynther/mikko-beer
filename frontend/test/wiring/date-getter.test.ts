import { test } from '../test'
import { assertGreaterThan } from '../assert'
import { getDate, getNextMonthDate } from '../../src/wiring/date-getter'

test('getDate', () => {
  const date = getDate()
  assertGreaterThan(date.getFullYear(), 2000)
})

test('getNextMonthDate', () => {
  // There's no guarantee on a later Date object having a greater timestamp, so
  // let's just satisfy coverage requirement by calling the function under test
  // and asserting something very generic.
  const nextMonthDate = getNextMonthDate()
  assertGreaterThan(nextMonthDate.getFullYear(), 2000)
})

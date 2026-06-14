import { expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'

import { formatYearMonth, parseYearMonth, toTimestamp } from './filter-util'

test('format YearMonth padded', () => {
  expect(formatYearMonth({ year: 2019, month: 5 })).toEqual('2019-05')
})

test('format YearMonth non-padded', () => {
  expect(formatYearMonth({ year: 2019, month: 11 })).toEqual('2019-11')
})

test('parse YearMonth', () => {
  expect(parseYearMonth('2019-05', { year: 2016, month: 2 })).toEqual({
    year: 2019,
    month: 5,
  })
})

// toTimestamp cannot be comprehensively tested without hard-coding a lot of
// known values. Smoke testing with the known values.
test('YearMonth start toTimestamp', () => {
  expect(toTimestamp(testTimes.min.yearMonth, 'start')).toEqual(
    testTimes.min.utcTimestamp,
  )
})

test('YearMonth end toTimestamp', () => {
  expect(toTimestamp(testTimes.max.yearMonth, 'end')).toEqual(
    testTimes.max.utcTimestamp,
  )
})

interface ParseYearMonthFallbackTest {
  value: string | undefined
  label: string
}

const parseYearMonthFallbackTests: ParseYearMonthFallbackTest[] = [
  { value: undefined, label: 'undefined' },
  { value: '2019', label: '"2019"' },
  { value: '2019-', label: '"2019-"' },
  { value: 'asdf', label: '"asdf"' },
  { value: 'asdf-', label: '"asdf-"' },
  { value: '2019-a', label: '"2019-a"' },
  { value: '0-12', label: '"0-12"' },
  { value: '2019-0', label: '"2019-0"' },
  { value: '2019-123', label: '"2019-123"' },
  { value: '-', label: '"-"' },
]

parseYearMonthFallbackTests.forEach((testCase) =>
  test(`fallback to default on parsing ${testCase.label} YearMonth`, () => {
    expect(parseYearMonth(testCase.value, { year: 2016, month: 2 })).toEqual({
      year: 2016,
      month: 2,
    })
  }),
)

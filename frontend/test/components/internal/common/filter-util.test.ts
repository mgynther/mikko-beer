import { test } from '../../../test'
import { assertDeepEqual, assertEqual } from '../../../assert'
import { testTimes } from '../../filter-time'

import {
  formatYearMonth,
  parseYearMonth,
  toTimestamp,
} from '../../../../src/components/internal/common/filter-util'

test('format YearMonth padded', () => {
  assertEqual(formatYearMonth({ year: 2019, month: 5 }), '2019-05')
})

test('format YearMonth non-padded', () => {
  assertEqual(formatYearMonth({ year: 2019, month: 11 }), '2019-11')
})

test('parse YearMonth', () => {
  assertDeepEqual(parseYearMonth('2019-05', { year: 2016, month: 2 }), {
    year: 2019,
    month: 5,
  })
})

// toTimestamp cannot be comprehensively tested without hard-coding a lot of
// known values. Smoke testing with the known values.
test('YearMonth start toTimestamp', () => {
  assertEqual(
    toTimestamp(testTimes.min.yearMonth, 'start'),
    testTimes.min.utcTimestamp,
  )
})

test('YearMonth end toTimestamp', () => {
  assertEqual(
    toTimestamp(testTimes.max.yearMonth, 'end'),
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
    assertDeepEqual(parseYearMonth(testCase.value, { year: 2016, month: 2 }), {
      year: 2016,
      month: 2,
    })
  }),
)

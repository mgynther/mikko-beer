import { expect, test } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'

import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault,
  filtersOpenOrDefault,
  filtersOpenStr,
  formatYearMonth,
  parseYearMonth,
  toTimestamp,
} from './filter-util'
import type { SearchParameters } from '../util'

test('average str', () => {
  expect(averageStr(8.23)).toEqual('8.23')
})

test('count str', () => {
  expect(countStr(122)).toEqual('122')
})

function toSearchParams(record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name],
  }
}

test('default asc list direction', () => {
  const search: Record<string, string> = {}
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('asc')
})

test('asc list direction', () => {
  const search: Record<string, string> = {
    list_direction: 'asc',
  }
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('asc')
})

test('desc list direction', () => {
  const search: Record<string, string> = {
    list_direction: 'desc',
  }
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('desc')
})

test('filters_open default', () => {
  const search: Record<string, string> = {}
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(false)
})

test('filters_open', () => {
  const search: Record<string, string> = {
    filters_open: '1',
  }
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(true)
})

test('filters closed', () => {
  const search: Record<string, string> = {
    filters_open: '0',
  }
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(false)
})

test('filtersOpenStr open', () => {
  expect(filtersOpenStr(true)).toEqual('1')
})

test('filtersOpenStr closed', () => {
  expect(filtersOpenStr(false)).toEqual('0')
})

test('min_review_count default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('min_review_count', toSearchParams(search)),
  ).toEqual(1)
})

test('min_review_count', () => {
  const search: Record<string, string> = {
    min_review_count: '13',
  }
  expect(
    filterNumOrDefault('min_review_count', toSearchParams(search)),
  ).toEqual(13)
})

test('max_review_count default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('max_review_count', toSearchParams(search)),
  ).toEqual(Infinity)
})

test('max_review_count', () => {
  const search: Record<string, string> = {
    max_review_count: '21',
  }
  expect(
    filterNumOrDefault('max_review_count', toSearchParams(search)),
  ).toEqual(21)
})

test('min_review_average default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('min_review_average', toSearchParams(search)),
  ).toEqual(4)
})

test('min_review_average', () => {
  const search: Record<string, string> = {
    min_review_average: '8.30',
  }
  expect(
    filterNumOrDefault('min_review_average', toSearchParams(search)),
  ).toEqual(8.3)
})

test('max_review_average default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('max_review_average', toSearchParams(search)),
  ).toEqual(10)
})

test('max_review_average', () => {
  const search: Record<string, string> = {
    max_review_average: '8.50',
  }
  expect(
    filterNumOrDefault('max_review_average', toSearchParams(search)),
  ).toEqual(8.5)
})

test('max_review_count', () => {
  const search: Record<string, string> = {
    max_review_count: '21',
  }
  expect(
    filterNumOrDefault('max_review_count', toSearchParams(search)),
  ).toEqual(21)
})

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

import { test } from '../../../test'
import { assertEqual } from '../../../assert'

import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault,
  filtersOpenOrDefault,
  filtersOpenStr,
} from '../../../../src/components/internal/stats/filter-util'
import type { SearchParameters } from '../../../../src/components/types/types'

test('average str', () => {
  assertEqual(averageStr(8.23), '8.23')
})

test('count str', () => {
  assertEqual(countStr(122), '122')
})

function toSearchParams(record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name],
  }
}

test('default asc list direction', () => {
  const search: Record<string, string> = {}
  assertEqual(listDirectionOrDefault(toSearchParams(search)), 'asc')
})

test('asc list direction', () => {
  const search: Record<string, string> = {
    list_direction: 'asc',
  }
  assertEqual(listDirectionOrDefault(toSearchParams(search)), 'asc')
})

test('desc list direction', () => {
  const search: Record<string, string> = {
    s_direction: 'desc',
  }
  assertEqual(listDirectionOrDefault(toSearchParams(search)), 'desc')
})

test('filters open default', () => {
  const search: Record<string, string> = {}
  assertEqual(filtersOpenOrDefault(toSearchParams(search)), false)
})

test('filters open', () => {
  const search: Record<string, string> = {
    s_filters: '1',
  }
  assertEqual(filtersOpenOrDefault(toSearchParams(search)), true)
})

test('filters closed', () => {
  const search: Record<string, string> = {
    s_filters: '0',
  }
  assertEqual(filtersOpenOrDefault(toSearchParams(search)), false)
})

test('filtersOpenStr open', () => {
  assertEqual(filtersOpenStr(true), '1')
})

test('filtersOpenStr closed', () => {
  assertEqual(filtersOpenStr(false), '0')
})

test('min review count default', () => {
  const search: Record<string, string> = {}
  assertEqual(filterNumOrDefault('s_min_count', toSearchParams(search)), 1)
})

test('min review count', () => {
  const search: Record<string, string> = {
    s_min_count: '13',
  }
  assertEqual(filterNumOrDefault('s_min_count', toSearchParams(search)), 13)
})

test('max review count default', () => {
  const search: Record<string, string> = {}
  assertEqual(
    filterNumOrDefault('s_max_count', toSearchParams(search)),
    Infinity,
  )
})

test('max review count', () => {
  const search: Record<string, string> = {
    s_max_count: '21',
  }
  assertEqual(filterNumOrDefault('s_max_count', toSearchParams(search)), 21)
})

test('min review average default', () => {
  const search: Record<string, string> = {}
  assertEqual(filterNumOrDefault('s_min_avg', toSearchParams(search)), 4)
})

test('min review average', () => {
  const search: Record<string, string> = {
    s_min_avg: '8.30',
  }
  assertEqual(filterNumOrDefault('s_min_avg', toSearchParams(search)), 8.3)
})

test('max_review_average default', () => {
  const search: Record<string, string> = {}
  assertEqual(filterNumOrDefault('s_max_avg', toSearchParams(search)), 10)
})

test('max review average', () => {
  const search: Record<string, string> = {
    s_max_avg: '8.50',
  }
  assertEqual(filterNumOrDefault('s_max_avg', toSearchParams(search)), 8.5)
})

test('max review count', () => {
  const search: Record<string, string> = {
    s_max_count: '21',
  }
  assertEqual(filterNumOrDefault('s_max_count', toSearchParams(search)), 21)
})

test('min review count falls back on non-numeric value', () => {
  const search: Record<string, string> = {
    s_min_count: 'abc',
  }
  assertEqual(filterNumOrDefault('s_min_count', toSearchParams(search)), 1)
})

test('max review count falls back on non-numeric value', () => {
  const search: Record<string, string> = {
    s_max_count: 'xyz',
  }
  assertEqual(
    filterNumOrDefault('s_max_count', toSearchParams(search)),
    Infinity,
  )
})

test('min review average falls back on non-numeric value', () => {
  const search: Record<string, string> = {
    s_min_avg: 'foo',
  }
  assertEqual(filterNumOrDefault('s_min_avg', toSearchParams(search)), 4)
})

test('max review average falls back on non-numeric value', () => {
  const search: Record<string, string> = {
    s_max_avg: 'bar',
  }
  assertEqual(filterNumOrDefault('s_max_avg', toSearchParams(search)), 10)
})

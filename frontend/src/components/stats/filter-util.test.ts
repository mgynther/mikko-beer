import { expect, test } from 'vitest'

import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault,
  filtersOpenOrDefault,
  filtersOpenStr,
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
    s_direction: 'desc',
  }
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('desc')
})

test('filters open default', () => {
  const search: Record<string, string> = {}
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(false)
})

test('filters open', () => {
  const search: Record<string, string> = {
    s_filters: '1',
  }
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(true)
})

test('filters closed', () => {
  const search: Record<string, string> = {
    s_filters: '0',
  }
  expect(filtersOpenOrDefault(toSearchParams(search))).toEqual(false)
})

test('filtersOpenStr open', () => {
  expect(filtersOpenStr(true)).toEqual('1')
})

test('filtersOpenStr closed', () => {
  expect(filtersOpenStr(false)).toEqual('0')
})

test('min review count default', () => {
  const search: Record<string, string> = {}
  expect(filterNumOrDefault('s_min_count', toSearchParams(search))).toEqual(1)
})

test('min review count', () => {
  const search: Record<string, string> = {
    s_min_count: '13',
  }
  expect(filterNumOrDefault('s_min_count', toSearchParams(search))).toEqual(13)
})

test('max review count default', () => {
  const search: Record<string, string> = {}
  expect(filterNumOrDefault('s_max_count', toSearchParams(search))).toEqual(
    Infinity,
  )
})

test('max review count', () => {
  const search: Record<string, string> = {
    s_max_count: '21',
  }
  expect(filterNumOrDefault('s_max_count', toSearchParams(search))).toEqual(21)
})

test('min review average default', () => {
  const search: Record<string, string> = {}
  expect(filterNumOrDefault('s_min_avg', toSearchParams(search))).toEqual(4)
})

test('min review average', () => {
  const search: Record<string, string> = {
    s_min_avg: '8.30',
  }
  expect(filterNumOrDefault('s_min_avg', toSearchParams(search))).toEqual(8.3)
})

test('max_review_average default', () => {
  const search: Record<string, string> = {}
  expect(filterNumOrDefault('s_max_avg', toSearchParams(search))).toEqual(10)
})

test('max review average', () => {
  const search: Record<string, string> = {
    s_max_avg: '8.50',
  }
  expect(filterNumOrDefault('s_max_avg', toSearchParams(search))).toEqual(8.5)
})

test('max review count', () => {
  const search: Record<string, string> = {
    s_max_count: '21',
  }
  expect(filterNumOrDefault('s_max_count', toSearchParams(search))).toEqual(21)
})

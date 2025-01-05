import { expect, test } from 'vitest'

import {
  averageStr,
  countStr,
  listDirectionOrDefault,
  filterNumOrDefault
} from './filter-util'
import type { SearchParameters } from '../util'

test('average str', () => {
  expect(averageStr(8.23)).toEqual('8.23')
})

test('count str', () => {
  expect(countStr(122)).toEqual('122')
})

function toSearchParams (record: Record<string, string>): SearchParameters {
  return {
    get: (name: string) => record[name]
  }
}

test('default asc list direction', () => {
  const search: Record<string, string> = {}
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('asc')
})

test('asc list direction', () => {
  const search: Record<string, string> = {
    list_direction: 'asc'
  }
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('asc')
})

test('desc list direction', () => {
  const search: Record<string, string> = {
    list_direction: 'desc'
  }
  expect(listDirectionOrDefault(toSearchParams(search))).toEqual('desc')
})

test('min_review_count default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('min_review_count', toSearchParams(search))
  ).toEqual(1)
})

test('min_review_count', () => {
  const search: Record<string, string> = {
    min_review_count: '13'
  }
  expect(
    filterNumOrDefault('min_review_count', toSearchParams(search))
  ).toEqual(13)
})

test('max_review_count default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('max_review_count', toSearchParams(search))
  ).toEqual(Infinity)
})

test('max_review_count', () => {
  const search: Record<string, string> = {
    max_review_count: '21'
  }
  expect(
    filterNumOrDefault('max_review_count', toSearchParams(search))
  ).toEqual(21)
})

test('min_review_average default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('min_review_average', toSearchParams(search))
  ).toEqual(4)
})

test('min_review_average', () => {
  const search: Record<string, string> = {
    min_review_average: '8.30'
  }
  expect(
    filterNumOrDefault('min_review_average', toSearchParams(search))
  ).toEqual(8.30)
})

test('max_review_average default', () => {
  const search: Record<string, string> = {}
  expect(
    filterNumOrDefault('max_review_average', toSearchParams(search))
  ).toEqual(10)
})

test('max_review_average', () => {
  const search: Record<string, string> = {
    max_review_average: '8.50'
  }
  expect(
    filterNumOrDefault('max_review_average', toSearchParams(search))
  ).toEqual(8.50)
})

import { expect, test } from 'vitest'

import type {
  AnnualStats,
  MonthlyStats,
  Storage,
  StorageList,
} from '../core/storage/types'

import {
  validateStorage,
  validateStorageOrUndefined,
  validateStorageListOrUndefined,
  validateAnnualStorageStatsOrUndefined,
  validateMonthlyStorageStatsOrUndefined
} from './storage'

const validStorage: Storage = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  beerId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  beerName: 'Siperia',
  bestBefore: '2025-12-31T12:00:00.000Z',
  breweries: [
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      name: 'Koskipanimo'
    }
  ],
  container: {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    type: 'bottle',
    size: '0.33'
  },
  createdAt: '2024-06-15T18:30:00.000Z',
  hasReview: true,
  styles: [
    {
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      name: 'Imperial Stout'
    }
  ]
}

test('validateStorage returns storage for valid input', () => {
  expect(validateStorage(validStorage)).toEqual(validStorage)
})

test('validateStorage throws for invalid input', () => {
  expect(() => validateStorage({
    id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
    beerId: 123
  })).toThrow()
})

test('validateStorageOrUndefined returns undefined for undefined', () => {
  expect(validateStorageOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateStorageOrUndefined returns storage for valid input', () => {
  expect(validateStorageOrUndefined(validStorage))
  .toEqual(validStorage)
})

test('validateStorageOrUndefined throws for invalid input', () => {
  expect(() => validateStorageOrUndefined({
    id: '11223344-5566-7788-99aa-bbccddeeff00'
  })).toThrow()
})

test('validateStorageListOrUndefined returns undefined for undefined', () => {
  expect(validateStorageListOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateStorageListOrUndefined returns list for valid input', () => {
  const list: StorageList = {
    storages: [validStorage]
  }
  expect(validateStorageListOrUndefined(list))
  .toEqual(list)
})

test('validateStorageListOrUndefined throws for invalid input', () => {
  expect(() => validateStorageListOrUndefined({
    storages: [{ id: 123 }]
  })).toThrow()
})

test('validateStorageListOrUndefined returns empty list', () => {
  const list: StorageList = { storages: [] }
  expect(validateStorageListOrUndefined(list))
  .toEqual(list)
})

test('validateAnnualStorageStatsOrUndefined returns undefined', () => {
  expect(validateAnnualStorageStatsOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateAnnualStorageStatsOrUndefined returns stats', () => {
  const stats: AnnualStats = {
    annual: [
      { year: '2024', count: '42' }
    ]
  }
  expect(validateAnnualStorageStatsOrUndefined(stats))
  .toEqual(stats)
})

test('validateAnnualStorageStatsOrUndefined throws for invalid', () => {
  expect(() => validateAnnualStorageStatsOrUndefined({
    annual: [{ year: 2024, count: 42 }]
  })).toThrow()
})

test('validateAnnualStorageStatsOrUndefined returns empty list', () => {
  const stats: AnnualStats = { annual: [] }
  expect(validateAnnualStorageStatsOrUndefined(stats))
  .toEqual(stats)
})

test('validateMonthlyStorageStatsOrUndefined returns undefined', () => {
  expect(validateMonthlyStorageStatsOrUndefined(undefined))
  .toEqual(undefined)
})

test('validateMonthlyStorageStatsOrUndefined returns stats', () => {
  const stats: MonthlyStats = {
    monthly: [
      { year: '2024', month: '6', count: '10' }
    ]
  }
  expect(validateMonthlyStorageStatsOrUndefined(stats))
  .toEqual(stats)
})

test('validateMonthlyStorageStatsOrUndefined throws for invalid', () => {
  expect(() => validateMonthlyStorageStatsOrUndefined({
    monthly: [{ year: '2024' }]
  })).toThrow()
})

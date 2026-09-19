import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import { formatError } from './format-error'
import type { BreweryBasics } from './brewery'
import { ValidatedBreweryBasics, toBreweryBasics } from './brewery'
import type { Container } from './container'
import { ValidatedContainer, toContainer } from './container'
import type { Style } from './style'
import { ValidatedStyle, toStyle } from './style'

// This layer's own view of a valid storage, declared here rather than
// imported from types/. See the comment in style.ts.
export interface CreatedStorage {
  id: string
  beer: string
  bestBefore: string
  container: string
}

export interface Storage {
  id: string
  beerId: string
  beerName: string
  bestBefore: string
  breweries: BreweryBasics[]
  container: Container
  createdAt: string
  hasReview: boolean
  styles: Style[]
}

export interface StorageList {
  storages: Storage[]
}

export interface OneYearStats {
  year: string
  count: string
}

export interface AnnualStats {
  annual: OneYearStats[]
}

export interface OneMonthStats {
  year: string
  month: string
  count: string
}

export interface MonthlyStats {
  monthly: OneMonthStats[]
}

const ValidatedCreatedStorage = t.type({
  id: t.string,
  beer: t.string,
  bestBefore: t.string,
  container: t.string,
})

const ValidatedStorage = t.type({
  id: t.string,
  beerId: t.string,
  beerName: t.string,
  bestBefore: t.string,
  breweries: t.array(ValidatedBreweryBasics),
  container: ValidatedContainer,
  createdAt: t.string,
  hasReview: t.boolean,
  styles: t.array(ValidatedStyle),
})

const ValidatedStorageList = t.type({
  storages: t.array(ValidatedStorage),
})

const ValidatedOneYearStats = t.type({
  year: t.string,
  count: t.string,
})

const ValidatedAnnualStorageStats = t.type({
  annual: t.array(ValidatedOneYearStats),
})

const ValidatedOneMonthStats = t.type({
  year: t.string,
  month: t.string,
  count: t.string,
})

const ValidatedMonthlyStorageStats = t.type({
  monthly: t.array(ValidatedOneMonthStats),
})

function toStorage(storage: t.TypeOf<typeof ValidatedStorage>): Storage {
  return {
    id: storage.id,
    beerId: storage.beerId,
    beerName: storage.beerName,
    bestBefore: storage.bestBefore,
    breweries: storage.breweries.map(toBreweryBasics),
    container: toContainer(storage.container),
    createdAt: storage.createdAt,
    hasReview: storage.hasReview,
    styles: storage.styles.map(toStyle),
  }
}

function toOneYearStats(
  stats: t.TypeOf<typeof ValidatedOneYearStats>,
): OneYearStats {
  return {
    year: stats.year,
    count: stats.count,
  }
}

function toOneMonthStats(
  stats: t.TypeOf<typeof ValidatedOneMonthStats>,
): OneMonthStats {
  return {
    year: stats.year,
    month: stats.month,
    count: stats.count,
  }
}

export function validateCreatedStorage(result: unknown): CreatedStorage {
  const decoded = ValidatedCreatedStorage.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const storage = decoded.right
  return {
    id: storage.id,
    beer: storage.beer,
    bestBefore: storage.bestBefore,
    container: storage.container,
  }
}

export function validateStorageOrUndefined(
  result: unknown,
): Storage | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStorage(result)
}

export function validateStorage(result: unknown): Storage {
  const decoded = ValidatedStorage.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return toStorage(decoded.right)
}

export function validateStorageListOrUndefined(
  result: unknown,
): StorageList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStorageList(result)
}

function validateStorageList(result: unknown): StorageList {
  const decoded = ValidatedStorageList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    storages: decoded.right.storages.map(toStorage),
  }
}

export function validateAnnualStorageStatsOrUndefined(
  result: unknown,
): AnnualStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateAnnualStorageStats(result)
}

function validateAnnualStorageStats(result: unknown): AnnualStats {
  const decoded = ValidatedAnnualStorageStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    annual: decoded.right.annual.map(toOneYearStats),
  }
}

export function validateMonthlyStorageStatsOrUndefined(
  result: unknown,
): MonthlyStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateMonthlyStorageStats(result)
}

function validateMonthlyStorageStats(result: unknown): MonthlyStats {
  const decoded = ValidatedMonthlyStorageStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  return {
    monthly: decoded.right.monthly.map(toOneMonthStats),
  }
}

import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type {
  AnnualStats,
  MonthlyStats,
  Storage,
  StorageList,
} from '../core/storage/types'
import { formatError } from './format-error'
import { ValidatedBrewery } from './brewery'
import { ValidatedStyle } from './style'
import { ValidatedContainer } from './container'

const ValidatedStorage = t.type({
  id: t.string,
  beerId: t.string,
  beerName: t.string,
  bestBefore: t.string,
  breweries: t.array(ValidatedBrewery),
  container: ValidatedContainer,
  createdAt: t.string,
  hasReview: t.boolean,
  styles: t.array(ValidatedStyle)
})

const ValidatedStorageList = t.type({
  storages: t.array(ValidatedStorage)
})

const ValidatedAnnualStorageStats = t.type({
  annual: t.array(t.type({
    year: t.string,
    count: t.string
  }))
})

const ValidatedMonthlyStorageStats = t.type({
  monthly: t.array(t.type({
    year: t.string,
    month: t.string,
    count: t.string
  }))
})

export function validateStorageOrUndefined(
  result: unknown
): Storage | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStorage(result)
}

function validateStorage(result: unknown): Storage {
  type StorageT = t.TypeOf<typeof ValidatedStorage>
  const decoded = ValidatedStorage.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StorageT = decoded.right
  return valid
}

export function validateStorageListOrUndefined(
  result: unknown
): StorageList | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateStorageList(result)
}

function validateStorageList(result: unknown): StorageList {
  type StorageListT = t.TypeOf<typeof ValidatedStorageList>
  const decoded = ValidatedStorageList.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: StorageListT = decoded.right
  return valid
}

export function validateAnnualStorageStatsOrUndefined(
  result: unknown
): AnnualStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateAnnualStorageStats(result)
}

function validateAnnualStorageStats(result: unknown): AnnualStats {
  type AnnualStatsT = t.TypeOf<typeof ValidatedAnnualStorageStats>
  const decoded = ValidatedAnnualStorageStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: AnnualStatsT = decoded.right
  return valid
}

export function validateMonthlyStorageStatsOrUndefined(
  result: unknown
): MonthlyStats | undefined {
  if (typeof result === 'undefined') {
    return undefined
  }
  return validateMonthlyStorageStats(result)
}

function validateMonthlyStorageStats(result: unknown): MonthlyStats {
  type MonthlyStatsT = t.TypeOf<typeof ValidatedMonthlyStorageStats>
  const decoded = ValidatedMonthlyStorageStats.decode(result)
  if (isLeft(decoded)) {
    throw Error(formatError(decoded))
  }
  const valid: MonthlyStatsT = decoded.right
  return valid
}

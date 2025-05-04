import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

import type {
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

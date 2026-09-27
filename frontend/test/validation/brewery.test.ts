import { test } from '../test'
import { assertDeepEqual, assertEqual, assertThrows } from '../assert'

import type { Brewery, BreweryList } from '../../src/validation/brewery'

import {
  validateBreweryOrUndefined,
  validateBrewery,
  validateBreweryListOrUndefined,
  validateBreweryList,
} from '../../src/validation/brewery'

const validBrewery: Brewery = {
  id: 'a60b1313-eec8-412a-92fd-12a446b95ecf',
  name: 'Test Brewery',
  country: undefined,
}

test('validateBreweryOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateBreweryOrUndefined(undefined), undefined)
})

test('validateBreweryOrUndefined returns brewery for valid input', () => {
  assertDeepEqual(validateBreweryOrUndefined(validBrewery), validBrewery)
})

test('validateBreweryOrUndefined throws for invalid input', () => {
  assertThrows(() => validateBreweryOrUndefined({ id: 123 }))
})

test('validateBreweryOrUndefined throws for missing name', () => {
  assertThrows(() =>
    validateBreweryOrUndefined({
      id: 'ff5a9ed2-f0dc-4759-8e97-1a06e31c50d3',
    }),
  )
})

test('validateBreweryOrUndefined throws for missing id', () => {
  assertThrows(() =>
    validateBreweryOrUndefined({
      name: 'Test Brewery',
    }),
  )
})

test('validateBrewery returns brewery for valid input', () => {
  const brewery: Brewery = {
    id: 'b1eb758e-02f3-4ed6-b305-12928340f60f',
    name: 'Another Brewery',
    country: undefined,
  }
  assertDeepEqual(validateBrewery(brewery), brewery)
})

test('validateBrewery throws for invalid input', () => {
  assertThrows(() => validateBrewery({ id: 123 }))
})

test('validateBrewery throws for non-string name', () => {
  assertThrows(() =>
    validateBrewery({
      id: 'de4901c9-716c-460f-bd19-78bd31e04dfc',
      name: 456,
    }),
  )
})

test('validateBreweryListOrUndefined returns undefined for undefined', () => {
  assertDeepEqual(validateBreweryListOrUndefined(undefined), undefined)
})

test('validateBreweryListOrUndefined returns list for valid input', () => {
  const list: BreweryList = {
    breweries: [validBrewery],
  }
  assertDeepEqual(validateBreweryListOrUndefined(list), list)
})

test('validateBreweryListOrUndefined throws for invalid input', () => {
  assertThrows(() => validateBreweryListOrUndefined({ breweries: 'wrong' }))
})

test('validateBreweryListOrUndefined throws for invalid list', () => {
  assertThrows(() =>
    validateBreweryListOrUndefined({
      breweries: [{ id: 123 }],
    }),
  )
})

test('validateBreweryListOrUndefined returns empty list', () => {
  const list: BreweryList = { breweries: [] }
  assertDeepEqual(validateBreweryListOrUndefined(list), list)
})

test('validateBreweryList returns list for valid input', () => {
  const list: BreweryList = {
    breweries: [validBrewery],
  }
  assertDeepEqual(validateBreweryList(list), list)
})

test('validateBreweryList throws for invalid input', () => {
  assertThrows(() => validateBreweryList({}))
})

test('validateBreweryList throws for missing breweries field', () => {
  assertThrows(() => validateBreweryList({ wrong: [] }))
})

test('validateBreweryList returns list with multiple breweries', () => {
  const list: BreweryList = {
    breweries: [
      validBrewery,
      {
        id: 'ccaf97db-2c89-40a0-ae2c-e00275c24307',
        name: 'Another Brewery',
        country: undefined,
      },
    ],
  }
  assertDeepEqual(validateBreweryList(list), list)
})

test('validateBrewery returns country', () => {
  const brewery: Brewery = {
    id: '9a20b0f5-25d5-4a56-a9f4-a3a6a9df0d51',
    name: 'Brewery With Country',
    country: 'FI',
  }
  assertDeepEqual(validateBrewery(brewery), brewery)
})

test('validateBrewery sets missing country explicitly undefined', () => {
  const brewery = validateBrewery({
    id: '1ecb1e0e-8b1c-4de6-a9d8-5a3a75fbb9a6',
    name: 'Brewery Without Country',
  })
  assertEqual(Object.keys(brewery).includes('country'), true)
  assertEqual(brewery.country, undefined)
})

test('validateBrewery throws for non-string country', () => {
  assertThrows(() =>
    validateBrewery({
      id: '4bd5d1a1-3cbb-4a6e-84e6-2cdd10a1d3a0',
      name: 'Test Brewery',
      country: 358,
    }),
  )
})

test('validateBreweryList sets missing country explicitly undefined', () => {
  const list = validateBreweryList({
    breweries: [
      {
        id: 'b7b0c5b1-1b1a-4b37-9f6f-38b6a9c0f0c1',
        name: 'Brewery Without Country',
      },
    ],
  })
  const brewery = list.breweries[0]
  assertEqual(Object.keys(brewery).includes('country'), true)
  assertEqual(brewery.country, undefined)
})

test('validateBreweryList returns countries', () => {
  const list: BreweryList = {
    breweries: [
      {
        id: 'a9a99f43-4f58-4b56-90e4-0a9a4b6e6b39',
        name: 'Brewery With Country',
        country: 'FI',
      },
    ],
  }
  assertDeepEqual(validateBreweryList(list), list)
})

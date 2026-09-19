import { expect, test } from 'vitest'

import type { Brewery, BreweryList } from './brewery'

import {
  validateBreweryOrUndefined,
  validateBrewery,
  validateBreweryListOrUndefined,
  validateBreweryList,
} from './brewery'

const validBrewery: Brewery = {
  id: 'a60b1313-eec8-412a-92fd-12a446b95ecf',
  name: 'Test Brewery',
  country: undefined,
}

test('validateBreweryOrUndefined returns undefined for undefined', () => {
  expect(validateBreweryOrUndefined(undefined)).toEqual(undefined)
})

test('validateBreweryOrUndefined returns brewery for valid input', () => {
  expect(validateBreweryOrUndefined(validBrewery)).toEqual(validBrewery)
})

test('validateBreweryOrUndefined throws for invalid input', () => {
  expect(() => validateBreweryOrUndefined({ id: 123 })).toThrow()
})

test('validateBreweryOrUndefined throws for missing name', () => {
  expect(() =>
    validateBreweryOrUndefined({
      id: 'ff5a9ed2-f0dc-4759-8e97-1a06e31c50d3',
    }),
  ).toThrow()
})

test('validateBreweryOrUndefined throws for missing id', () => {
  expect(() =>
    validateBreweryOrUndefined({
      name: 'Test Brewery',
    }),
  ).toThrow()
})

test('validateBrewery returns brewery for valid input', () => {
  const brewery: Brewery = {
    id: 'b1eb758e-02f3-4ed6-b305-12928340f60f',
    name: 'Another Brewery',
    country: undefined,
  }
  expect(validateBrewery(brewery)).toEqual(brewery)
})

test('validateBrewery throws for invalid input', () => {
  expect(() => validateBrewery({ id: 123 })).toThrow()
})

test('validateBrewery throws for non-string name', () => {
  expect(() =>
    validateBrewery({
      id: 'de4901c9-716c-460f-bd19-78bd31e04dfc',
      name: 456,
    }),
  ).toThrow()
})

test('validateBreweryListOrUndefined returns undefined for undefined', () => {
  expect(validateBreweryListOrUndefined(undefined)).toEqual(undefined)
})

test('validateBreweryListOrUndefined returns list for valid input', () => {
  const list: BreweryList = {
    breweries: [validBrewery],
  }
  expect(validateBreweryListOrUndefined(list)).toEqual(list)
})

test('validateBreweryListOrUndefined throws for invalid input', () => {
  expect(() => validateBreweryListOrUndefined({ breweries: 'wrong' })).toThrow()
})

test('validateBreweryListOrUndefined throws for invalid list', () => {
  expect(() =>
    validateBreweryListOrUndefined({
      breweries: [{ id: 123 }],
    }),
  ).toThrow()
})

test('validateBreweryListOrUndefined returns empty list', () => {
  const list: BreweryList = { breweries: [] }
  expect(validateBreweryListOrUndefined(list)).toEqual(list)
})

test('validateBreweryList returns list for valid input', () => {
  const list: BreweryList = {
    breweries: [validBrewery],
  }
  expect(validateBreweryList(list)).toEqual(list)
})

test('validateBreweryList throws for invalid input', () => {
  expect(() => validateBreweryList({})).toThrow()
})

test('validateBreweryList throws for missing breweries field', () => {
  expect(() => validateBreweryList({ wrong: [] })).toThrow()
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
  expect(validateBreweryList(list)).toEqual(list)
})

test('validateBrewery returns country', () => {
  const brewery: Brewery = {
    id: '9a20b0f5-25d5-4a56-a9f4-a3a6a9df0d51',
    name: 'Brewery With Country',
    country: 'FI',
  }
  expect(validateBrewery(brewery)).toEqual(brewery)
})

test('validateBrewery sets missing country explicitly undefined', () => {
  const brewery = validateBrewery({
    id: '1ecb1e0e-8b1c-4de6-a9d8-5a3a75fbb9a6',
    name: 'Brewery Without Country',
  })
  expect(Object.keys(brewery).includes('country')).toEqual(true)
  expect(brewery.country).toEqual(undefined)
})

test('validateBrewery throws for non-string country', () => {
  expect(() =>
    validateBrewery({
      id: '4bd5d1a1-3cbb-4a6e-84e6-2cdd10a1d3a0',
      name: 'Test Brewery',
      country: 358,
    }),
  ).toThrow()
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
  expect(Object.keys(brewery).includes('country')).toEqual(true)
  expect(brewery.country).toEqual(undefined)
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
  expect(validateBreweryList(list)).toEqual(list)
})

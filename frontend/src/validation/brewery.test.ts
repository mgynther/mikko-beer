import { expect, test } from 'vitest'

import type {
  Brewery,
  BreweryList
} from '../core/brewery/types'

import {
  validateBreweryOrUndefined,
  validateBrewery,
  validateBreweryListOrUndefined,
  validateBreweryList
} from './brewery'

const validBrewery: Brewery = {
  id: 'a60b1313-eec8-412a-92fd-12a446b95ecf',
  name: 'Test Brewery'
}

test('validateBreweryOrUndefined returns undefined for undefined',
  () => {
    expect(validateBreweryOrUndefined(undefined))
      .toEqual(undefined)
  })

test('validateBreweryOrUndefined returns brewery for valid input',
  () => {
    expect(validateBreweryOrUndefined(validBrewery))
      .toEqual(validBrewery)
  })

test('validateBreweryOrUndefined throws for invalid input', () => {
  expect(() => validateBreweryOrUndefined({ id: 123 })).toThrow()
})

test('validateBreweryOrUndefined throws for missing name', () => {
  expect(() => validateBreweryOrUndefined({
    id: 'ff5a9ed2-f0dc-4759-8e97-1a06e31c50d3'
  })).toThrow()
})

test('validateBreweryOrUndefined throws for missing id', () => {
  expect(() => validateBreweryOrUndefined({
    name: 'Test Brewery'
  })).toThrow()
})

test('validateBrewery returns brewery for valid input', () => {
  const brewery: Brewery = {
    id: 'b1eb758e-02f3-4ed6-b305-12928340f60f',
    name: 'Another Brewery'
  }
  expect(validateBrewery(brewery)).toEqual(brewery)
})

test('validateBrewery throws for invalid input', () => {
  expect(() => validateBrewery({ id: 123 })).toThrow()
})

test('validateBrewery throws for non-string name', () => {
  expect(() => validateBrewery({
    id: 'de4901c9-716c-460f-bd19-78bd31e04dfc',
    name: 456
  })).toThrow()
})

test('validateBreweryListOrUndefined returns undefined for undefined',
  () => {
    expect(validateBreweryListOrUndefined(undefined))
      .toEqual(undefined)
  })

test('validateBreweryListOrUndefined returns list for valid input',
  () => {
    const list: BreweryList = {
      breweries: [validBrewery]
    }
    expect(validateBreweryListOrUndefined(list)).toEqual(list)
  })

test('validateBreweryListOrUndefined throws for invalid input',
  () => {
    expect(
      () => validateBreweryListOrUndefined({ breweries: 'wrong' })
    ).toThrow()
  })

test(
  'validateBreweryListOrUndefined throws for invalid brewery in list',
  () => {
    expect(() => validateBreweryListOrUndefined({
      breweries: [{ id: 123 }]
    })).toThrow()
  })

test('validateBreweryListOrUndefined returns empty list', () => {
  const list: BreweryList = { breweries: [] }
  expect(validateBreweryListOrUndefined(list)).toEqual(list)
})

test('validateBreweryList returns list for valid input', () => {
  const list: BreweryList = {
    breweries: [validBrewery]
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
        name: 'Another Brewery'
      }
    ]
  }
  expect(validateBreweryList(list)).toEqual(list)
})

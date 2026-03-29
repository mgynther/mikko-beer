import { expect, test } from 'vitest'

import type {
  Beer,
  BeerList,
  BeerWithIds
} from '../core/beer/types'

import {
  validateBeerOrUndefined,
  validateBeerWithIds,
  validateBeerListOrUndefined,
  validateBeerList
} from './beer'

const validBeer: Beer = {
  id: '84192d35-554b-435f-98a8-47ee40c4e0fc',
  name: 'Test IPA',
  breweries: [{
    id: 'd2c99660-0334-4201-aaa5-207020ab18f8',
    name: 'Test Brewery'
  }],
  styles: [{
    id: 'fd24d0da-dd8d-407c-97cc-f53e01928b00',
    name: 'IPA'
  }]
}

test('validateBeerOrUndefined returns undefined for undefined', () => {
  expect(validateBeerOrUndefined(undefined)).toEqual(undefined)
})

test('validateBeerOrUndefined returns beer for valid input', () => {
  expect(validateBeerOrUndefined(validBeer)).toEqual(validBeer)
})

test('validateBeerOrUndefined throws for invalid input', () => {
  expect(() => validateBeerOrUndefined({ id: 123 })).toThrow()
})

test('validateBeerOrUndefined throws for missing breweries', () => {
  expect(() => validateBeerOrUndefined({
    id: '37545722-6d98-47e4-be34-2c9a96e733e0',
    name: 'Test beer',
    styles: []
  })).toThrow()
})

test('validateBeerOrUndefined throws for missing styles', () => {
  expect(() => validateBeerOrUndefined({
    id: 'ba9a6857-dd3a-46a8-9eaa-c86f912b292d',
    name: 'Test stout',
    breweries: []
  })).toThrow()
})

test('validateBeerOrUndefined throws for invalid brewery in array',
  () => {
    expect(() => validateBeerOrUndefined({
      id: '56a02462-f9f9-402b-83ac-d57c3dcdc265',
      name: 'Test beer',
      breweries: [{ id: 123 }],
      styles: []
    })).toThrow()
  })

test('validateBeerOrUndefined throws for invalid style in array',
  () => {
    expect(() => validateBeerOrUndefined({
      id: '62705975-19be-4b23-bebc-f1935d33ffb7',
      name: 'Test beer',
      breweries: [],
      styles: [{ wrong: true }]
    })).toThrow()
  })

test('validateBeerOrUndefined returns beer with empty arrays', () => {
  const beer = {
    id: '73d684bd-46f1-44cc-b453-7d42aec8a069',
    name: 'Test lager',
    breweries: [],
    styles: []
  }
  expect(validateBeerOrUndefined(beer)).toEqual(beer)
})

test('validateBeerWithIds returns beer with ids for valid input',
  () => {
    const beerWithIds: BeerWithIds = {
      id: '0f6d691d-c04a-4d97-a683-7e94b419d4b6',
      name: 'Test Lager',
      breweries: ['bd20827a-3086-4122-8b52-011780524eb9'],
      styles: ['c5150719-40fb-41cc-86d5-d8ae5287d304']
    }
    expect(validateBeerWithIds(beerWithIds)).toEqual(beerWithIds)
  })

test('validateBeerWithIds throws for invalid input', () => {
  expect(() => validateBeerWithIds({ id: 123 })).toThrow()
})

test('validateBeerWithIds throws for missing name', () => {
  expect(() => validateBeerWithIds({
    id: '267e87d4-45ea-465e-ad79-d639aee2ccb1',
    breweries: [],
    styles: []
  })).toThrow()
})

test('validateBeerWithIds throws for non-string brewery id', () => {
  expect(() => validateBeerWithIds({
    id: '6e7cecdf-616d-46fd-889a-4036be0bfa66',
    name: 'Test',
    breweries: [123],
    styles: []
  })).toThrow()
})

test('validateBeerWithIds throws for non-string style id', () => {
  expect(() => validateBeerWithIds({
    id: '24d77d31-9717-4a7a-aaf2-54956bd9858f',
    name: 'Test',
    breweries: [],
    styles: [456]
  })).toThrow()
})

test('validateBeerWithIds returns beer with empty arrays', () => {
  const beerWithIds: BeerWithIds = {
    id: '7fef9944-c310-45cf-9926-302746ff0e3c',
    name: 'Minimal',
    breweries: [],
    styles: []
  }
  expect(validateBeerWithIds(beerWithIds)).toEqual(beerWithIds)
})

test('validateBeerListOrUndefined returns undefined for undefined',
  () => {
    expect(validateBeerListOrUndefined(undefined))
      .toEqual(undefined)
  })

test('validateBeerListOrUndefined returns list for valid input',
  () => {
    const list: BeerList = { beers: [validBeer] }
    expect(validateBeerListOrUndefined(list)).toEqual(list)
  })

test('validateBeerListOrUndefined throws for invalid input', () => {
  expect(() => validateBeerListOrUndefined({ beers: 'wrong' }))
    .toThrow()
})

test('validateBeerListOrUndefined throws for invalid beer in list',
  () => {
    expect(() => validateBeerListOrUndefined({
      beers: [{ id: 123 }]
    })).toThrow()
  })

test('validateBeerListOrUndefined returns empty list', () => {
  const list: BeerList = { beers: [] }
  expect(validateBeerListOrUndefined(list)).toEqual(list)
})

test('validateBeerList returns list for valid input', () => {
  const list: BeerList = { beers: [validBeer] }
  expect(validateBeerList(list)).toEqual(list)
})

test('validateBeerList throws for invalid input', () => {
  expect(() => validateBeerList({})).toThrow()
})

test('validateBeerList throws for missing beers field', () => {
  expect(() => validateBeerList({ wrong: [] })).toThrow()
})

test('validateBeerList returns list with multiple beers', () => {
  const list: BeerList = {
    beers: [
      validBeer,
      {
        id: 'a4ccd1ea-a353-4ff2-b8a6-592fc8931dd1',
        name: 'Another Beer',
        breweries: [
          {
            id: '00bef9e6-e4e7-4ae0-9331-4ba29408acf7',
            name: 'Another Brewery'
          }
        ],
        styles: []
      }
    ]
  }
  expect(validateBeerList(list)).toEqual(list)
})

import { expect } from 'earl'

import {
  validateBreweryStatsOrder,
  validateLocationStatsOrder,
  validateStatsIdFilter,
  validateStatsFilter,
} from '../../../src/core/stats/stats'
import type { StatsFilter } from '../../../src/core/stats/stats'
import {
  invalidIdFilterError,
  invalidBreweryStatsQueryError,
  invalidLocationStatsQueryError,
} from '../../../src/core/errors'
import { expectThrow } from '../controller-error-helper'

const noFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined
}

describe('stats brewery style filter unit tests', () => {
  it('validate undefined filter', () => {
    expect(validateStatsIdFilter(undefined)).toEqual(noFilter)
  })

  it('validate empty filter', () => {
    expect(validateStatsIdFilter({})).toEqual(noFilter)
  })

  it('validate brewery filter', () => {
    expect(
      validateStatsIdFilter({ brewery: 'testing' })
    ).toEqual({ brewery: 'testing', location: undefined, style: undefined })
  })

  it('validate location filter', () => {
    expect(
      validateStatsIdFilter({ location: 'testing' })
    ).toEqual({ brewery: undefined, location: 'testing', style: undefined })
  })

  it('validate style filter', () => {
    expect(
      validateStatsIdFilter({ style: 'testing' })
    ).toEqual({ brewery: undefined, location: undefined, style: 'testing' })
  })

  interface MultipleIdFilters {
    brewery?: string
    location?: string
    style?: string
  }

  const multipleIdFilterCases: MultipleIdFilters[] = [
    { brewery: 'testing', location: 'testing', style: undefined },
    { brewery: 'testing', location: undefined, style: 'testing' },
    { brewery: undefined, location: 'testing', style: 'testing' },
    { brewery: 'testing', location: 'testing', style: 'testing' }
  ]

  multipleIdFilterCases.forEach(test => {
    it(`validate multiple id filter cases brewery: ${test.brewery} location: ${test.location} style: ${test.style}`, () => {
      expectThrow(
        () =>
          validateStatsIdFilter(
            { ...test }
          )
      , invalidIdFilterError)
    })
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsIdFilter({ brewery: 123 })).toEqual(noFilter)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsIdFilter({ additional: 'testing' })).toEqual(noFilter)
  })
})

describe('stats filter unit tests', () => {
  const defaultFilter: StatsFilter = {
    brewery: undefined,
    location: undefined,
    style: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1
  }
  it('validate undefined filter', () => {
    expect(validateStatsFilter(undefined)).toEqual(defaultFilter)
  })

  it('validate empty filter', () => {
    expect(validateStatsFilter({})).toEqual(defaultFilter)
  })

  it('validate valid filter', () => {
    expect(
      validateStatsFilter({
        brewery: 'testing',
        max_review_average: '9.54',
        min_review_average: '5',
        max_review_count: '100',
        min_review_count: '4'
      })
    ).toEqual({
      ...defaultFilter,
      brewery: 'testing',
      maxReviewAverage: 9.54,
      minReviewAverage: 5,
      maxReviewCount: 100,
      minReviewCount: 4
    })
  })

  it('validate invalid min review count', () => {
    expect(
      validateStatsFilter({ brewery: 'testing', min_review_count: 'test' })
    ).toEqual({ ...defaultFilter, brewery: 'testing' })
  })

  it('validate too small', () => {
    expect(
      validateStatsFilter({ brewery: 'testing', min_review_count: '-1' })
    ).toEqual({ ...defaultFilter, brewery: 'testing' })
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsFilter({ brewery: 123 })).toEqual(defaultFilter)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsFilter({ additional: 'testing' })).toEqual(defaultFilter)
  })
})

describe('brewery stats order unit tests', () => {
  const defaultOrder = {
    property: 'brewery_name',
    direction: 'asc'
  }

  it('validate empty order', () => {
    expect(validateBreweryStatsOrder({})).toLooseEqual(defaultOrder)
  })

  it('validate average desc order', () => {
    expect(validateBreweryStatsOrder({
      order: 'average',
      direction: 'desc'
    })).toEqual({ property: 'average', direction: 'desc' })
  })

  it('validate brewery name desc order', () => {
    expect(validateBreweryStatsOrder({
      order: 'brewery_name',
      direction: 'desc'
    })).toEqual({ property: 'brewery_name', direction: 'desc' })
  })

  it('validate count asc order', () => {
    expect(validateBreweryStatsOrder({
      order: 'count',
      direction: 'asc'
    })).toEqual({ property: 'count', direction: 'asc' })
  })

  it('validate invalid asc order', () => {
    expectThrow(() => validateBreweryStatsOrder({
      order: 'invalid',
      direction: 'asc'
    }), invalidBreweryStatsQueryError)
  })

  it('validate beer name invalid order', () => {
    expectThrow(() => validateBreweryStatsOrder({
      order: 'beer_name',
      direction: 'invalid'
    }), invalidBreweryStatsQueryError)
  })
})

describe('location stats order unit tests', () => {
  const defaultOrder = {
    property: 'location_name',
    direction: 'asc'
  }

  it('validate empty order', () => {
    expect(validateLocationStatsOrder({})).toLooseEqual(defaultOrder)
  })

  it('validate average desc order', () => {
    expect(validateLocationStatsOrder({
      order: 'average',
      direction: 'desc'
    })).toEqual({ property: 'average', direction: 'desc' })
  })

  it('validate location name desc order', () => {
    expect(validateLocationStatsOrder({
      order: 'location_name',
      direction: 'desc'
    })).toEqual({ property: 'location_name', direction: 'desc' })
  })

  it('validate count asc order', () => {
    expect(validateLocationStatsOrder({
      order: 'count',
      direction: 'asc'
    })).toEqual({ property: 'count', direction: 'asc' })
  })

  it('validate invalid asc order', () => {
    expectThrow(() => validateLocationStatsOrder({
      order: 'invalid',
      direction: 'asc'
    }), invalidLocationStatsQueryError)
  })

  it('validate beer name invalid order', () => {
    expectThrow(() => validateLocationStatsOrder({
      order: 'beer_name',
      direction: 'invalid'
    }), invalidLocationStatsQueryError)
  })
})

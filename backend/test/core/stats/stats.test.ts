import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

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
    assert.deepEqual(validateStatsIdFilter(undefined), noFilter)
  })

  it('validate empty filter', () => {
    assert.deepEqual(validateStatsIdFilter({}), noFilter)
  })

  it('validate brewery filter', () => {
    assert.deepEqual(
      validateStatsIdFilter({ brewery: 'testing' }),
      { brewery: 'testing', location: undefined, style: undefined })
  })

  it('validate location filter', () => {
    assert.deepEqual(
      validateStatsIdFilter({ location: 'testing' }),
      { brewery: undefined, location: 'testing', style: undefined })
  })

  it('validate style filter', () => {
    assert.deepEqual(
      validateStatsIdFilter({ style: 'testing' }),
      { brewery: undefined, location: undefined, style: 'testing' })
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
    assert.deepEqual(
      validateStatsIdFilter({ brewery: 123 }), noFilter)
  })

  it('validate unknown filter', () => {
    assert.deepEqual(
      validateStatsIdFilter({ additional: 'testing' }), noFilter)
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
    assert.deepEqual(validateStatsFilter(undefined), defaultFilter)
  })

  it('validate empty filter', () => {
    assert.deepEqual(validateStatsFilter({}), defaultFilter)
  })

  it('validate valid filter', () => {
    assert.deepEqual(
      validateStatsFilter({
        brewery: 'testing',
        max_review_average: '9.54',
        min_review_average: '5',
        max_review_count: '100',
        min_review_count: '4'
      }), {
      ...defaultFilter,
      brewery: 'testing',
      maxReviewAverage: 9.54,
      minReviewAverage: 5,
      maxReviewCount: 100,
      minReviewCount: 4
    })
  })

  it('validate invalid min review count', () => {
    assert.deepEqual(
      validateStatsFilter({ brewery: 'testing', min_review_count: 'test' }),
      { ...defaultFilter, brewery: 'testing' })
  })

  it('validate too small', () => {
    assert.deepEqual(
      validateStatsFilter({ brewery: 'testing', min_review_count: '-1' }),
      { ...defaultFilter, brewery: 'testing' })
  })

  it('validate invalid brewery filter', () => {
    assert.deepEqual(
      validateStatsFilter({ brewery: 123 }), defaultFilter)
  })

  it('validate unknown filter', () => {
    assert.deepEqual(
      validateStatsFilter({ additional: 'testing' }), defaultFilter)
  })
})

describe('brewery stats order unit tests', () => {
  const defaultOrder = {
    property: 'brewery_name',
    direction: 'asc'
  }

  it('validate empty order', () => {
    assert.deepEqual(validateBreweryStatsOrder({}), defaultOrder)
  })

  it('validate average desc order', () => {
    assert.deepEqual(validateBreweryStatsOrder({
      order: 'average',
      direction: 'desc'
    }), { property: 'average', direction: 'desc' })
  })

  it('validate brewery name desc order', () => {
    assert.deepEqual(validateBreweryStatsOrder({
      order: 'brewery_name',
      direction: 'desc'
    }), { property: 'brewery_name', direction: 'desc' })
  })

  it('validate count asc order', () => {
    assert.deepEqual(validateBreweryStatsOrder({
      order: 'count',
      direction: 'asc'
    }), { property: 'count', direction: 'asc' })
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
    assert.deepEqual(validateLocationStatsOrder({}), defaultOrder)
  })

  it('validate average desc order', () => {
    assert.deepEqual(validateLocationStatsOrder({
      order: 'average',
      direction: 'desc'
    }), { property: 'average', direction: 'desc' })
  })

  it('validate location name desc order', () => {
    assert.deepEqual(validateLocationStatsOrder({
      order: 'location_name',
      direction: 'desc'
    }), { property: 'location_name', direction: 'desc' })
  })

  it('validate count asc order', () => {
    assert.deepEqual(validateLocationStatsOrder({
      order: 'count',
      direction: 'asc'
    }), { property: 'count', direction: 'asc' })
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

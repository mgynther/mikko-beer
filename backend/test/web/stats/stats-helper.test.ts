import { describe, it } from 'node:test'

import {
  validateBreweryCountryStatsOrder,
  validateBreweryStatsOrder,
  validateLocationStatsOrder,
  validateStatsFilter,
  validateStatsIdFilter,
  validateStyleStatsOrder,
} from '../../../src/web/stats/stats-helper.js'
import {
  invalidBreweryCountryStatsQueryError,
  invalidBreweryStatsQueryError,
  invalidIdFilterError,
  invalidLocationStatsQueryError,
  invalidStyleStatsQueryError,
} from '../../../src/logic/errors.js'
import { expectThrow } from '../../logic/controller-error-helper.js'
import { assertDeepEqual } from '../../assert.js'

describe('stats helper tests', () => {
  it('return stats id filter', () => {
    const result = validateStatsIdFilter({ brewery: 'testing' })
    assertDeepEqual(result, {
      brewery: 'testing',
      location: undefined,
      style: undefined,
    })
  })

  it('throw id filter error for multiple stats id filters', () => {
    expectThrow(
      () => validateStatsIdFilter({ brewery: 'a', style: 'b' }),
      invalidIdFilterError,
    )
  })

  it('return stats filter', () => {
    const result = validateStatsFilter({ min_review_count: '4' })
    assertDeepEqual(result, {
      brewery: undefined,
      location: undefined,
      style: undefined,
      maxReviewAverage: 10,
      minReviewAverage: 4,
      maxReviewCount: Infinity,
      minReviewCount: 4,
      timeStart: undefined,
      timeEnd: undefined,
    })
  })

  it('throw id filter error for multiple stats filter ids', () => {
    expectThrow(
      () => validateStatsFilter({ location: 'a', style: 'b' }),
      invalidIdFilterError,
    )
  })

  it('return brewery stats order', () => {
    const result = validateBreweryStatsOrder({
      order: 'average',
      direction: 'desc',
    })
    assertDeepEqual(result, { property: 'average', direction: 'desc' })
  })

  it('throw brewery stats query error', () => {
    expectThrow(
      () => validateBreweryStatsOrder({ order: 'invalid' }),
      invalidBreweryStatsQueryError,
    )
  })

  it('return brewery country stats order', () => {
    const result = validateBreweryCountryStatsOrder({
      order: 'brewery_count',
      direction: 'desc',
    })
    assertDeepEqual(result, { property: 'brewery_count', direction: 'desc' })
  })

  it('throw brewery country stats query error', () => {
    expectThrow(
      () => validateBreweryCountryStatsOrder({ order: 'invalid' }),
      invalidBreweryCountryStatsQueryError,
    )
  })

  it('return location stats order', () => {
    const result = validateLocationStatsOrder({
      order: 'count',
      direction: 'asc',
    })
    assertDeepEqual(result, { property: 'count', direction: 'asc' })
  })

  it('throw location stats query error', () => {
    expectThrow(
      () => validateLocationStatsOrder({ order: 'invalid' }),
      invalidLocationStatsQueryError,
    )
  })

  it('return style stats order', () => {
    const result = validateStyleStatsOrder({
      order: 'std_dev',
      direction: 'desc',
    })
    assertDeepEqual(result, { property: 'std_dev', direction: 'desc' })
  })

  it('throw style stats query error', () => {
    expectThrow(
      () => validateStyleStatsOrder({ order: 'invalid' }),
      invalidStyleStatsQueryError,
    )
  })
})

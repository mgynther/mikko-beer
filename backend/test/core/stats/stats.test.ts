import { expect } from 'chai'

import {
  validateStatsBreweryStyleFilter,
  validateStatsFilter,
  type StatsFilter
} from '../../../src/core/stats/stats'
import {
  invalidBreweryAndStyleFilterError
} from '../../../src/core/errors'

const noFilter = {
  brewery: undefined,
  style: undefined
}

describe('stats brewery style filter unit tests', () => {
  it('validate undefined filter', () => {
    expect(validateStatsBreweryStyleFilter(undefined)).to.eql(noFilter)
  })

  it('validate empty filter', () => {
    expect(validateStatsBreweryStyleFilter({})).to.eql(noFilter)
  })

  it('validate brewery filter', () => {
    expect(
      validateStatsBreweryStyleFilter({ brewery: 'testing' })
    ).to.eql({ brewery: 'testing', style: undefined })
  })

  it('validate style filter', () => {
    expect(
      validateStatsBreweryStyleFilter({ style: 'testing' })
    ).to.eql({ brewery: undefined, style: 'testing' })
  })

  it('validate brewery and style filter', () => {
    expect(
      () =>
        validateStatsBreweryStyleFilter(
          { brewery: 'testing', style: 'testing' }
        )
    ).to.throw(invalidBreweryAndStyleFilterError)
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsBreweryStyleFilter({ brewery: 123 })).to.eql(noFilter)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsBreweryStyleFilter({ additional: 'testing' })).to.eql(noFilter)
  })
})

describe('stats filter unit tests', () => {
  const defaultFilter: StatsFilter = {
    brewery: undefined,
    style: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1
  }
  it('validate undefined filter', () => {
    expect(validateStatsFilter(undefined)).to.eql(defaultFilter)
  })

  it('validate empty filter', () => {
    expect(validateStatsFilter({})).to.eql(defaultFilter)
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
    ).to.eql({
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
    ).to.eql({ ...defaultFilter, brewery: 'testing' })
  })

  it('validate too small', () => {
    expect(
      validateStatsFilter({ brewery: 'testing', min_review_count: '-1' })
    ).to.eql({ ...defaultFilter, brewery: 'testing' })
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsFilter({ brewery: 123 })).to.eql(defaultFilter)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsFilter({ additional: 'testing' })).to.eql(defaultFilter)
  })
})

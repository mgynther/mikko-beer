import { expect } from 'chai'

import {
  validateStatsBreweryFilter,
  validateStatsFilter,
  type StatsFilter
} from '../../../src/core/stats/stats'

describe('stats brewery filter unit tests', () => {
  it('validate undefined filter', () => {
    expect(validateStatsBreweryFilter(undefined)).to.equal(undefined)
  })

  it('validate empty filter', () => {
    expect(validateStatsBreweryFilter({})).to.equal(undefined)
  })

  it('validate brewery filter', () => {
    expect(
      validateStatsBreweryFilter({ brewery: 'testing' })
    ).to.eql({ brewery: 'testing' })
  })

  it('validate invalid brewery filter', () => {
    expect(
      validateStatsBreweryFilter({ brewery: 123 })).to.equal(undefined)
  })

  it('validate unknown filter', () => {
    expect(
      validateStatsBreweryFilter({ additional: 'testing' })).to.equal(undefined)
  })
})

describe('stats filter unit tests', () => {
  const defaultFilter: StatsFilter = {
    brewery: undefined,
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

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import type { Pagination, PaginationRequest } from '../../src/core/pagination'
import { validatePagination } from '../../src/core/pagination'


import { invalidPaginationError } from '../../src/core/errors'
import { expectThrow } from './controller-error-helper'

describe('pagination unit tests', () => {
  function pass(input: PaginationRequest, output: Pagination) {
    assert.deepEqual(validatePagination(input), output)
  }
  function fail(input: PaginationRequest) {
    expectThrow(() => (validatePagination(input)), invalidPaginationError)
  }
  it('pass validation', () => {
    pass({ size: '30', skip: '8' }, { size: 30, skip: 8 })
  })
  it('pass validation with defaults', () => {
    pass({ size: undefined, skip: undefined }, { size: 10000, skip: 0 })
  })
  it('fail validation with only skip missing', () => {
    fail({ size: '10000', skip: undefined })
  })
  it('fail validation with only size missing', () => {
    fail({ size: undefined, skip: '2' })
  })
  it('fail validation with empty size', () => {
    fail({ size: '', skip: '2' })
  })
  it('fail validation with empty skip', () => {
    fail({ size: '1', skip: '' })
  })
  it('fail validation with zero size', () => {
    fail({ size: '0', skip: '5' })
  })
  it('fail validation with negative size', () => {
    fail({ size: '-1', skip: '5' })
  })
  it('fail validation with negative skip', () => {
    fail({ size: '10', skip: '-1' })
  })
  it('fail validation with too large size', () => {
    fail({ size: '100000', skip: '8' })
  })
  it('fail validation with non-number size', () => {
    fail({ size: '; DROP DATABASE mikko_beer ;', skip: '8' })
  })
  it('fail validation with non-number skip', () => {
    fail({ size: '100', skip: '; DROP DATABASE mikko_beer ;' })
  })
  it('fail floating point size with comma', () => {
    fail({ size: '10,123', skip: '8' })
  })
  it('fail floating point size with period', () => {
    fail({ size: '10.123', skip: '8' })
  })
  it('fail non-integer scientific size', () => {
    fail({ size: '10.123321e3', skip: '8' })
  })
  it('fail validation with non-number size after number', () => {
    fail({ size: '10 ; DROP DATABASE mikko_beer ;', skip: '8' })
  })
})

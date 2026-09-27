import { suite, test } from '../test.js'

import type {
  Pagination,
  PaginationQuery,
} from '../../src/validation/pagination.js'
import { validatePagination } from '../../src/validation/pagination.js'

import { assertDeepEqual, assertEqual } from '../assert.js'

suite('pagination validation unit tests', () => {
  function pass(input: PaginationQuery, output: Pagination) {
    const validationResult = validatePagination(input)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }
  function fail(input: PaginationQuery) {
    const validationResult = validatePagination(input)
    assertEqual(validationResult.errorCode, 'invalid-pagination')
    assertEqual(validationResult.result, undefined)
  }
  test('pass validation', () => {
    pass({ size: '30', skip: '8' }, { size: 30, skip: 8 })
  })
  test('pass validation with defaults', () => {
    pass({ size: undefined, skip: undefined }, { size: 10000, skip: 0 })
  })
  test('pass validation with zero skip', () => {
    pass({ size: '10', skip: '0' }, { size: 10, skip: 0 })
  })
  test('pass validation with maximum size', () => {
    pass({ size: '10000', skip: '0' }, { size: 10000, skip: 0 })
  })
  test('fail validation with only skip missing', () => {
    fail({ size: '10000', skip: undefined })
  })
  test('fail validation with only size missing', () => {
    fail({ size: undefined, skip: '2' })
  })
  test('fail validation with empty size', () => {
    fail({ size: '', skip: '2' })
  })
  test('fail validation with empty skip', () => {
    fail({ size: '1', skip: '' })
  })
  test('fail validation with zero size', () => {
    fail({ size: '0', skip: '5' })
  })
  test('fail validation with negative size', () => {
    fail({ size: '-1', skip: '5' })
  })
  test('fail validation with negative skip', () => {
    fail({ size: '10', skip: '-1' })
  })
  test('fail validation with too large size', () => {
    fail({ size: '100000', skip: '8' })
  })
  test('fail validation with non-number size', () => {
    fail({ size: '; DROP DATABASE mikko_beer ;', skip: '8' })
  })
  test('fail validation with non-number skip', () => {
    fail({ size: '100', skip: '; DROP DATABASE mikko_beer ;' })
  })
  test('fail floating point size with comma', () => {
    fail({ size: '10,123', skip: '8' })
  })
  test('fail floating point size with period', () => {
    fail({ size: '10.123', skip: '8' })
  })
  test('fail non-integer scientific size', () => {
    fail({ size: '10.123321e3', skip: '8' })
  })
  test('fail validation with non-number size after number', () => {
    fail({ size: '10 ; DROP DATABASE mikko_beer ;', skip: '8' })
  })
})

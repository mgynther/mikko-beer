import { suite, test } from '../../test.js'

import { round, formatInteger } from '../../../src/data/stats/format.js'
import { assertEqual } from '../../assert.js'

suite('round', () => {
  test('rounds to two decimals', () => {
    assertEqual(round(7.123), '7.12')
  })

  test('rounds half away from zero', () => {
    assertEqual(round(7.125), '7.13')
  })

  test('pads to two decimals', () => {
    assertEqual(round(7), '7.00')
  })

  test('handles negative values', () => {
    assertEqual(round(-1.234), '-1.23')
  })

  test('returns sentinel for null', () => {
    assertEqual(round(null), '-')
  })

  test('returns sentinel for NaN', () => {
    assertEqual(round(NaN), '-')
  })
})

suite('formatInteger', () => {
  test('returns integer string', () => {
    assertEqual(formatInteger(9), '9')
  })

  test('rounds non-integer input to nearest integer', () => {
    assertEqual(formatInteger(9.4), '9')
    assertEqual(formatInteger(9.6), '10')
  })

  test('handles zero', () => {
    assertEqual(formatInteger(0), '0')
  })

  test('handles negative values', () => {
    assertEqual(formatInteger(-3.2), '-3')
  })

  test('returns sentinel for null', () => {
    assertEqual(formatInteger(null), '-')
  })

  test('returns sentinel for NaN', () => {
    assertEqual(formatInteger(NaN), '-')
  })
})

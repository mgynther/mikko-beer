import { test } from '../../../test'
import { assertEqual } from '../../../assert'

import { flagEmoji } from '../../../../src/components/internal/common/flag-emoji'

test('converts Finnish country code', () => {
  assertEqual(flagEmoji('FI'), '\u{1F1EB}\u{1F1EE}')
})

test('converts Estonian country code', () => {
  assertEqual(flagEmoji('EE'), '\u{1F1EA}\u{1F1EA}')
})

test('converts British country code', () => {
  assertEqual(flagEmoji('GB'), '\u{1F1EC}\u{1F1E7}')
})

test('converts Swedish country code', () => {
  assertEqual(flagEmoji('SE'), '\u{1F1F8}\u{1F1EA}')
})

test('converts Belgian country code', () => {
  assertEqual(flagEmoji('BE'), '\u{1F1E7}\u{1F1EA}')
})

test('converts first country code', () => {
  assertEqual(flagEmoji('AA'), '\u{1F1E6}\u{1F1E6}')
})

test('converts last country code', () => {
  assertEqual(flagEmoji('ZZ'), '\u{1F1FF}\u{1F1FF}')
})

test('gives undefined for lower case country code', () => {
  assertEqual(flagEmoji('fi'), undefined)
})

test('gives undefined for mixed case country code', () => {
  assertEqual(flagEmoji('Fi'), undefined)
})

test('gives undefined without country code', () => {
  assertEqual(flagEmoji(undefined), undefined)
})

test('gives undefined for empty country code', () => {
  assertEqual(flagEmoji(''), undefined)
})

test('gives undefined for too short country code', () => {
  assertEqual(flagEmoji('F'), undefined)
})

test('gives undefined for too long country code', () => {
  assertEqual(flagEmoji('FIN'), undefined)
})

test('gives undefined for digit country code', () => {
  assertEqual(flagEmoji('12'), undefined)
})

test('gives undefined for non-latin country code', () => {
  assertEqual(flagEmoji('ÄÖ'), undefined)
})

test('gives undefined for whitespace country code', () => {
  assertEqual(flagEmoji('F '), undefined)
})

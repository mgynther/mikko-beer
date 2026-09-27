import { test } from '../../../test'
import { assertEqual } from '../../../assert'

import { nameWithFlag } from '../../../../src/components/internal/common/name-with-flag'

const name = 'Lehe pruulikoda'

test('combines name and flag', () => {
  assertEqual(nameWithFlag(name, 'EE'), `${name} \u{1F1EA}\u{1F1EA}`)
})

test('gives plain name for lower case country code', () => {
  assertEqual(nameWithFlag(name, 'ee'), name)
})

test('gives plain name without country code', () => {
  assertEqual(nameWithFlag(name, undefined), name)
})

test('gives plain name for empty country code', () => {
  assertEqual(nameWithFlag(name, ''), name)
})

test('gives plain name for too short country code', () => {
  assertEqual(nameWithFlag(name, 'E'), name)
})

test('gives plain name for too long country code', () => {
  assertEqual(nameWithFlag(name, 'EST'), name)
})

test('gives plain name for invalid country code', () => {
  assertEqual(nameWithFlag(name, '12'), name)
})

test('gives plain empty name', () => {
  assertEqual(nameWithFlag('', undefined), '')
})

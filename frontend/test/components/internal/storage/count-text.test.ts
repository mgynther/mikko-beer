import { expect, test } from 'vitest'

import { countText } from '../../../../src/components/internal/storage/count-text'
import { buildStorage } from '../../types/storage/builders'

test('format storage count text', () => {
  const storages = [
    buildStorage({ hasReview: true }),
    buildStorage({ hasReview: false }),
    buildStorage({ hasReview: false }),
  ]
  expect(countText(storages)).toEqual('2/3')
})

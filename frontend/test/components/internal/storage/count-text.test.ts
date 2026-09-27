import { test } from '../../../test'
import { assertEqual } from '../../../assert'

import { countText } from '../../../../src/components/internal/storage/count-text'
import { buildStorage } from '../../types/storage/builders'

test('format storage count text', () => {
  const storages = [
    buildStorage({ hasReview: true }),
    buildStorage({ hasReview: false }),
    buildStorage({ hasReview: false }),
  ]
  assertEqual(countText(storages), '2/3')
})

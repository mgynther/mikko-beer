import type { ReviewFilters } from '../../../../src/components/internal/review/filter-types'
import { dontCall } from '../../../dont-call'

// A valid ReviewFilters and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself. A setter that is not overridden must not be called.
export function buildReviewFilters(
  overrides: Partial<ReviewFilters> = {},
): ReviewFilters {
  const min = { year: 2017, month: 12 }
  const max = { year: 2024, month: 12 }
  return {
    minRating: { value: 4, setValue: dontCall },
    maxRating: { value: 10, setValue: dontCall },
    minTime: { min, max, value: min, setValue: dontCall },
    maxTime: { min, max, value: max, setValue: dontCall },
    ...overrides,
  }
}

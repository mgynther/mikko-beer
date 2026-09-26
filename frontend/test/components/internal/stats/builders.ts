import type { StatsFilters } from '../../../../src/components/internal/stats/filter-types'
import { dontCall } from '../../../dont-call'

// A valid StatsFilters and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself. A setter that is not overridden must not be called.
export function buildStatsFilters(
  overrides: Partial<StatsFilters> = {},
): StatsFilters {
  const min = { year: 2017, month: 12 }
  const max = { year: 2024, month: 12 }
  return {
    minReviewCount: { value: 1, setValue: dontCall },
    maxReviewCount: { value: Infinity, setValue: dontCall },
    minReviewAverage: { value: 4, setValue: dontCall },
    maxReviewAverage: { value: 10, setValue: dontCall },
    timeStart: { min, max, value: min, setValue: dontCall },
    timeEnd: { min, max, value: max, setValue: dontCall },
    ...overrides,
  }
}

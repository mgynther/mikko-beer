import type { YearMonth } from '../src/core/stats/types'

export interface Times {
  min: {
    yearMonth: YearMonth
    text: string
    utcTimestamp: number
  }
  max: {
    yearMonth: YearMonth
    text: string
    utcTimestamp: number
  }
}

const minTime: YearMonth = {
  year: 2017,
  month: 12,
}
const minTimeUtc = 1512086400000
const minTimeOffset =
  new Date(minTime.year, minTime.month - 1, 1).getTimezoneOffset() * 60000

const maxTime: YearMonth = {
  year: 2024,
  month: 12,
}
const maxTimeUtc = 1735689599000
const maxTimeOffset =
  new Date(maxTime.year, maxTime.month, 0).getTimezoneOffset() * 60000

// At the time of implementing Node does not support JS Temporal. This constant
// enables testing with known times at min equals first second of month and max
// last. Timezone offset is taken into account.
export const testTimes: Times = {
  min: {
    yearMonth: minTime,
    text: `${minTime.year}-${minTime.month}`,
    utcTimestamp: minTimeUtc + minTimeOffset,
  },
  max: {
    yearMonth: maxTime,
    text: `${maxTime.year}-${maxTime.month}`,
    utcTimestamp: maxTimeUtc + maxTimeOffset,
  },
}

import { describe, it } from 'node:test'

import {
  validateBreweryStatsOrder,
  validateLocationStatsOrder,
  validateStyleStatsOrder,
  validateStatsIdFilter,
  validateStatsFilter,
} from '../../src/validation/stats.js'
import type { StatsFilter } from '../../src/validation/stats.js'
import { assertDeepEqual, assertEqual } from '../assert.js'

const noFilter = {
  brewery: undefined,
  location: undefined,
  style: undefined,
}

describe('stats id filter validation unit tests', () => {
  function pass(query: Record<string, unknown> | undefined, output: object) {
    const validationResult = validateStatsIdFilter(query)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }

  function fail(query: Record<string, unknown>) {
    const validationResult = validateStatsIdFilter(query)
    assertEqual(validationResult.errorCode, 'invalid-id-filter')
    assertEqual(validationResult.result, undefined)
  }

  it('validate undefined filter', () => {
    pass(undefined, noFilter)
  })

  it('validate empty filter', () => {
    pass({}, noFilter)
  })

  it('validate brewery filter', () => {
    pass(
      { brewery: 'testing' },
      {
        brewery: 'testing',
        location: undefined,
        style: undefined,
      },
    )
  })

  it('validate location filter', () => {
    pass(
      { location: 'testing' },
      {
        brewery: undefined,
        location: 'testing',
        style: undefined,
      },
    )
  })

  it('validate style filter', () => {
    pass(
      { style: 'testing' },
      {
        brewery: undefined,
        location: undefined,
        style: 'testing',
      },
    )
  })

  interface MultipleIdFilters {
    brewery?: string
    location?: string
    style?: string
  }

  const multipleIdFilterCases: MultipleIdFilters[] = [
    { brewery: 'testing', location: 'testing', style: undefined },
    { brewery: 'testing', location: undefined, style: 'testing' },
    { brewery: undefined, location: 'testing', style: 'testing' },
    { brewery: 'testing', location: 'testing', style: 'testing' },
  ]

  multipleIdFilterCases.forEach((testCase) => {
    it(`validate multiple id filter cases brewery: ${
      testCase.brewery
    } location: ${testCase.location} style: ${testCase.style}`, () => {
      fail({ ...testCase })
    })
  })

  it('validate invalid brewery filter', () => {
    pass({ brewery: 123 }, noFilter)
  })

  it('validate empty brewery filter', () => {
    pass({ brewery: '' }, noFilter)
  })

  it('validate empty location filter', () => {
    pass({ location: '' }, noFilter)
  })

  it('validate empty style filter', () => {
    pass({ style: '' }, noFilter)
  })

  it('validate unknown filter', () => {
    pass({ additional: 'testing' }, noFilter)
  })
})

describe('stats filter validation unit tests', () => {
  const defaultFilter: StatsFilter = {
    brewery: undefined,
    location: undefined,
    style: undefined,
    maxReviewAverage: 10,
    minReviewAverage: 4,
    maxReviewCount: Infinity,
    minReviewCount: 1,
    timeStart: undefined,
    timeEnd: undefined,
  }

  function pass(query: Record<string, unknown> | undefined, output: object) {
    const validationResult = validateStatsFilter(query)
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, output)
  }

  it('validate undefined filter', () => {
    pass(undefined, defaultFilter)
  })

  it('validate empty filter', () => {
    pass({}, defaultFilter)
  })

  it('validate valid filter', () => {
    pass(
      {
        brewery: 'testing',
        max_review_average: '9.54',
        min_review_average: '5',
        max_review_count: '100',
        min_review_count: '4',
        time_start: '1665532800000',
        time_end: '1734652800000',
      },
      {
        ...defaultFilter,
        brewery: 'testing',
        maxReviewAverage: 9.54,
        minReviewAverage: 5,
        maxReviewCount: 100,
        minReviewCount: 4,
        timeStart: new Date(1665532800000),
        timeEnd: new Date(1734652800000),
      },
    )
  })

  it('fail with multiple id filters', () => {
    const validationResult = validateStatsFilter({
      brewery: 'testing',
      style: 'testing',
    })
    assertEqual(validationResult.errorCode, 'invalid-id-filter')
    assertEqual(validationResult.result, undefined)
  })

  it('validate invalid min review count', () => {
    pass(
      { brewery: 'testing', min_review_count: 'test' },
      {
        ...defaultFilter,
        brewery: 'testing',
      },
    )
  })

  it('validate too small min review count', () => {
    pass(
      { brewery: 'testing', min_review_count: '-1' },
      {
        ...defaultFilter,
        brewery: 'testing',
      },
    )
  })

  it('validate empty min review count', () => {
    pass({ min_review_count: '' }, defaultFilter)
  })

  it('validate too small min review average', () => {
    pass({ min_review_average: '3' }, defaultFilter)
  })

  it('validate too large max review average', () => {
    pass({ max_review_average: '11' }, defaultFilter)
  })

  it('validate invalid max review average', () => {
    pass({ max_review_average: 'test' }, defaultFilter)
  })

  it('validate non-string max review count', () => {
    pass({ max_review_count: 100 }, defaultFilter)
  })

  it('validate invalid brewery filter', () => {
    pass({ brewery: 123 }, defaultFilter)
  })

  it('validate invalid start time filter', () => {
    pass({ time_start: 'abc' }, defaultFilter)
  })

  it('validate invalid end time filter', () => {
    pass({ time_end: '-123' }, defaultFilter)
  })

  it('validate unknown filter', () => {
    pass({ additional: 'testing' }, defaultFilter)
  })
})

interface StatsOrderCase {
  title: string
  func: (query: Record<string, unknown>) => {
    errorCode: string | undefined
    result: { property: string; direction: string } | undefined
  }
  errorCode: string
  defaultProperty: string
  namedProperty: string
}

const statsOrderCases: StatsOrderCase[] = [
  {
    title: 'brewery',
    func: validateBreweryStatsOrder,
    errorCode: 'invalid-brewery-stats-query',
    defaultProperty: 'brewery_name',
    namedProperty: 'brewery_name',
  },
  {
    title: 'location',
    func: validateLocationStatsOrder,
    errorCode: 'invalid-location-stats-query',
    defaultProperty: 'location_name',
    namedProperty: 'location_name',
  },
  {
    title: 'style',
    func: validateStyleStatsOrder,
    errorCode: 'invalid-style-stats-query',
    defaultProperty: 'style_name',
    namedProperty: 'style_name',
  },
]

statsOrderCases.forEach((statsOrderCase) => {
  const { title, func, errorCode, defaultProperty, namedProperty } =
    statsOrderCase

  describe(`${title} stats order validation unit tests`, () => {
    function pass(query: Record<string, unknown>, output: object) {
      const validationResult = func(query)
      assertEqual(validationResult.errorCode, undefined)
      assertDeepEqual(validationResult.result, output)
    }

    function fail(query: Record<string, unknown>) {
      const validationResult = func(query)
      assertEqual(validationResult.errorCode, errorCode)
      assertEqual(validationResult.result, undefined)
    }

    it('validate empty order', () => {
      pass({}, { property: defaultProperty, direction: 'asc' })
    })

    it('validate empty string order and direction', () => {
      pass(
        { order: '', direction: '' },
        {
          property: defaultProperty,
          direction: 'asc',
        },
      )
    })

    it('validate average desc order', () => {
      pass(
        { order: 'average', direction: 'desc' },
        {
          property: 'average',
          direction: 'desc',
        },
      )
    })

    it('validate named property desc order', () => {
      pass(
        { order: namedProperty, direction: 'desc' },
        {
          property: namedProperty,
          direction: 'desc',
        },
      )
    })

    it('validate count asc order', () => {
      pass(
        { order: 'count', direction: 'asc' },
        {
          property: 'count',
          direction: 'asc',
        },
      )
    })

    it('validate std dev desc order', () => {
      pass(
        { order: 'std_dev', direction: 'desc' },
        {
          property: 'std_dev',
          direction: 'desc',
        },
      )
    })

    it('validate invalid order', () => {
      fail({ order: 'invalid', direction: 'asc' })
    })

    it('validate invalid direction', () => {
      fail({ order: 'average', direction: 'invalid' })
    })

    it('validate invalid order type', () => {
      fail({ order: 123, direction: 'asc' })
    })

    it('validate invalid direction type', () => {
      fail({ order: 'average', direction: [] })
    })
  })
})

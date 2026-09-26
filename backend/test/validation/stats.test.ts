import { suite, test } from '../test.js'

import {
  validateBreweryCountryStatsOrder,
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

suite('stats id filter validation unit tests', () => {
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

  test('validate undefined filter', () => {
    pass(undefined, noFilter)
  })

  test('validate empty filter', () => {
    pass({}, noFilter)
  })

  test('validate brewery filter', () => {
    pass(
      { brewery: 'testing' },
      {
        brewery: 'testing',
        location: undefined,
        style: undefined,
      },
    )
  })

  test('validate location filter', () => {
    pass(
      { location: 'testing' },
      {
        brewery: undefined,
        location: 'testing',
        style: undefined,
      },
    )
  })

  test('validate style filter', () => {
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
    test(`validate multiple id filter cases brewery: ${
      testCase.brewery
    } location: ${testCase.location} style: ${testCase.style}`, () => {
      fail({ ...testCase })
    })
  })

  test('validate invalid brewery filter', () => {
    pass({ brewery: 123 }, noFilter)
  })

  test('validate empty brewery filter', () => {
    pass({ brewery: '' }, noFilter)
  })

  test('validate empty location filter', () => {
    pass({ location: '' }, noFilter)
  })

  test('validate empty style filter', () => {
    pass({ style: '' }, noFilter)
  })

  test('validate unknown filter', () => {
    pass({ additional: 'testing' }, noFilter)
  })
})

suite('stats filter validation unit tests', () => {
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

  test('validate undefined filter', () => {
    pass(undefined, defaultFilter)
  })

  test('validate empty filter', () => {
    pass({}, defaultFilter)
  })

  test('validate valid filter', () => {
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

  test('fail with multiple id filters', () => {
    const validationResult = validateStatsFilter({
      brewery: 'testing',
      style: 'testing',
    })
    assertEqual(validationResult.errorCode, 'invalid-id-filter')
    assertEqual(validationResult.result, undefined)
  })

  test('validate invalid min review count', () => {
    pass(
      { brewery: 'testing', min_review_count: 'test' },
      {
        ...defaultFilter,
        brewery: 'testing',
      },
    )
  })

  test('validate too small min review count', () => {
    pass(
      { brewery: 'testing', min_review_count: '-1' },
      {
        ...defaultFilter,
        brewery: 'testing',
      },
    )
  })

  test('validate empty min review count', () => {
    pass({ min_review_count: '' }, defaultFilter)
  })

  test('validate too small min review average', () => {
    pass({ min_review_average: '3' }, defaultFilter)
  })

  test('validate too large max review average', () => {
    pass({ max_review_average: '11' }, defaultFilter)
  })

  test('validate invalid max review average', () => {
    pass({ max_review_average: 'test' }, defaultFilter)
  })

  test('validate non-string max review count', () => {
    pass({ max_review_count: 100 }, defaultFilter)
  })

  test('validate invalid brewery filter', () => {
    pass({ brewery: 123 }, defaultFilter)
  })

  test('validate invalid start time filter', () => {
    pass({ time_start: 'abc' }, defaultFilter)
  })

  test('validate invalid end time filter', () => {
    pass({ time_end: '-123' }, defaultFilter)
  })

  test('validate unknown filter', () => {
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
    title: 'brewery country',
    func: validateBreweryCountryStatsOrder,
    errorCode: 'invalid-brewery-country-stats-query',
    defaultProperty: 'country_code',
    namedProperty: 'country_code',
  },
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

  suite(`${title} stats order validation unit tests`, () => {
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

    test('validate empty order', () => {
      pass({}, { property: defaultProperty, direction: 'asc' })
    })

    test('validate empty string order and direction', () => {
      pass(
        { order: '', direction: '' },
        {
          property: defaultProperty,
          direction: 'asc',
        },
      )
    })

    test('validate average desc order', () => {
      pass(
        { order: 'average', direction: 'desc' },
        {
          property: 'average',
          direction: 'desc',
        },
      )
    })

    test('validate named property desc order', () => {
      pass(
        { order: namedProperty, direction: 'desc' },
        {
          property: namedProperty,
          direction: 'desc',
        },
      )
    })

    test('validate count asc order', () => {
      pass(
        { order: 'count', direction: 'asc' },
        {
          property: 'count',
          direction: 'asc',
        },
      )
    })

    test('validate std dev desc order', () => {
      pass(
        { order: 'std_dev', direction: 'desc' },
        {
          property: 'std_dev',
          direction: 'desc',
        },
      )
    })

    test('validate invalid order', () => {
      fail({ order: 'invalid', direction: 'asc' })
    })

    test('validate invalid direction', () => {
      fail({ order: 'average', direction: 'invalid' })
    })

    test('validate invalid order type', () => {
      fail({ order: 123, direction: 'asc' })
    })

    test('validate invalid direction type', () => {
      fail({ order: 'average', direction: [] })
    })
  })
})

// brewery_count is the one order property no other stats dimension has, so
// the shared cases above do not reach it.
suite('brewery country stats order validation unit tests', () => {
  test('validate brewery count asc order', () => {
    const validationResult = validateBreweryCountryStatsOrder({
      order: 'brewery_count',
      direction: 'asc',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'brewery_count',
      direction: 'asc',
    })
  })

  test('validate brewery count desc order', () => {
    const validationResult = validateBreweryCountryStatsOrder({
      order: 'brewery_count',
      direction: 'desc',
    })
    assertEqual(validationResult.errorCode, undefined)
    assertDeepEqual(validationResult.result, {
      property: 'brewery_count',
      direction: 'desc',
    })
  })

  test('do not validate a brewery name order', () => {
    const validationResult = validateBreweryCountryStatsOrder({
      order: 'brewery_name',
      direction: 'asc',
    })
    assertEqual(
      validationResult.errorCode,
      'invalid-brewery-country-stats-query',
    )
    assertEqual(validationResult.result, undefined)
  })
})

import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import { testTimes } from '../../../test-util/filter-time'
import Stats from './Stats'
import type {
  LocationStats,
  OneAnnualContainerStats,
  OneLocationStats,
  StatsIf,
  YearMonth,
} from '../../core/stats/types'
import LinkWrapper from '../LinkWrapper'
import type { ParamsIf } from '../util'
import type { UseDebounce } from '../../core/types'
import { openFilters } from './filters-test-util'

const getUseDebounce = function <T>(): UseDebounce<T> {
  return (value: T) => [value, false]
}

const emptyAnnualContainerStats = { annualContainer: [] }
const emptyBreweryStats = { brewery: [] }
const emptyLocationStats = { location: [] }

const minTime: YearMonth = testTimes.min.yearMonth
const maxTime: YearMonth = testTimes.max.yearMonth

const emptyStatsIf: StatsIf = {
  annual: {
    useStats: () => ({
      stats: {
        annual: [{ reviewAverage: '0.00', reviewCount: '0', year: '2020' }],
      },
      isLoading: false,
    }),
  },
  annualContainer: {
    useStats: () => ({
      query: async () => emptyAnnualContainerStats,
      stats: emptyAnnualContainerStats,
      isLoading: false,
    }),
    infiniteScroll: (cb: () => void) => {
      cb()
      return () => undefined
    },
  },
  brewery: {
    useStats: () => ({
      query: async () => emptyBreweryStats,
      stats: emptyBreweryStats,
      isLoading: false,
    }),
    infiniteScroll: (cb: () => void) => {
      cb()
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce,
  },
  container: {
    useStats: () => ({
      stats: {
        container: [
          {
            containerId: 'ea642716-f71a-4c45-be62-2963ab732122',
            containerSize: '0.33',
            containerType: 'bottle',
            reviewAverage: '0.00',
            reviewCount: '0',
          },
        ],
      },
      isLoading: false,
    }),
  },
  location: {
    useStats: () => ({
      query: async () => emptyLocationStats,
      stats: emptyLocationStats,
      isLoading: false,
    }),
    infiniteScroll: (cb: () => void) => {
      cb()
      return () => undefined
    },
    minTime,
    maxTime,
    getUseDebounce,
  },
  overall: {
    useStats: () => ({
      stats: {
        beerCount: '0',
        breweryCount: '0',
        containerCount: '0',
        locationCount: '0',
        reviewCount: '0',
        distinctBeerReviewCount: '0',
        reviewAverage: '0.00',
        reviewMedian: '0.00',
        reviewMode: '0',
        reviewStandardDeviation: '0.00',
        styleCount: '0',
      },
      isLoading: false,
    }),
  },
  rating: {
    useStats: () => ({
      stats: {
        rating: [{ rating: '4', count: '0' }],
      },
      isLoading: false,
    }),
  },
  style: {
    useStats: () => ({
      stats: {
        style: [],
      },
      isLoading: false,
    }),
    minTime,
    maxTime,
    getUseDebounce,
  },
  setSearch: async () => undefined,
}

const paramsIf: ParamsIf = {
  useParams: () => ({}),
  useSearch: () => ({
    get: () => undefined,
  }),
}

function getStatsParamsIf(
  stats: string,
  filters: Record<string, string> = {},
): ParamsIf {
  const params: Record<string, string> = { ...filters, stats }
  return {
    useParams: () => ({}),
    useSearch: () => ({
      get: (name: string) => params[name],
    }),
  }
}

interface OverallTestCase {
  paramsIf: ParamsIf
  description: string
}

const overallTestCases: OverallTestCase[] = [
  {
    paramsIf,
    description: 'by default',
  },
  {
    paramsIf: getStatsParamsIf('overall'),
    description: 'from search param',
  },
  {
    paramsIf: getStatsParamsIf('unknown'),
    description: 'from unknown search param',
  },
]

overallTestCases.forEach((testCase) => {
  test(`renders overall stats ${testCase.description}`, () => {
    const { getByText } = render(
      <Stats
        paramsIf={testCase.paramsIf}
        statsIf={{
          ...emptyStatsIf,
          overall: {
            useStats: () => ({
              stats: {
                beerCount: '123',
                breweryCount: '54',
                containerCount: '8',
                locationCount: '17',
                reviewCount: '112',
                distinctBeerReviewCount: '110',
                reviewAverage: '8.54',
                reviewMedian: '9.00',
                reviewMode: '9',
                reviewStandardDeviation: '1.13',
                styleCount: '29',
              },
              isLoading: false,
            }),
          },
        }}
        breweryId={'282844e4-f411-4c6a-95d6-9131b8c0491f'}
        locationId={'b2a53c67-8132-4f93-92eb-e7b0276e6c07'}
        styleId={'1d1bc37a-d5d0-4175-92b2-7d24f961bb20'}
      />,
    )
    getByText('123')
    getByText('54')
    getByText('8')
    getByText('17')
    getByText('112')
    getByText('110')
    getByText('8.54')
    getByText('9.00')
    getByText('9')
    getByText('1.13')
    getByText('29')
  })
})

test('renders annual stats', () => {
  const { getByText } = render(
    <Stats
      paramsIf={getStatsParamsIf('annual')}
      statsIf={{
        ...emptyStatsIf,
        annual: {
          useStats: () => ({
            stats: {
              annual: [
                { reviewAverage: '7.87', reviewCount: '10', year: '2020' },
                { reviewAverage: '8.23', reviewCount: '24', year: '2021' },
              ],
            },
            isLoading: false,
          }),
        },
      }}
      breweryId={'ed60c2f7-b799-4b47-834c-d123f92f6eac'}
      locationId={'138ce231-35ed-4dfc-b5e3-0fba1b439877'}
      styleId={'3004aece-d2c4-47ae-896c-f2762051a738'}
    />,
  )
  getByText('7.87')
  getByText('10')
  getByText('2020')
  getByText('8.23')
  getByText('24')
  getByText('2021')
})

test('renders annual container stats', async () => {
  const stats2020: OneAnnualContainerStats = {
    containerId: 'b049f5be-692b-4c81-a368-6cbad1a58d8a',
    containerSize: '0.33',
    containerType: 'bottle',
    reviewAverage: '7.87',
    reviewCount: '10',
    year: '2020',
  }
  const stats2021: OneAnnualContainerStats = {
    containerId: '830a5d16-a3dc-4737-a762-39f78269c490',
    containerSize: '0.44',
    containerType: 'can',
    reviewAverage: '8.23',
    reviewCount: '24',
    year: '2021',
  }
  const statsIf: StatsIf = {
    ...emptyStatsIf,
    annualContainer: {
      useStats: () => ({
        query: async (params) => ({
          annualContainer:
            params.pagination.skip === 0
              ? [{ ...stats2021 }, { ...stats2020 }]
              : [],
        }),
        stats: {
          annualContainer: [{ ...stats2021 }, { ...stats2020 }],
        },
        isLoading: false,
      }),
      infiniteScroll: (cb: () => void) => {
        cb()
        return () => undefined
      },
    },
  }
  const { getByText } = render(
    <Stats
      paramsIf={getStatsParamsIf('annual_container')}
      statsIf={statsIf}
      breweryId={'2bc301aa-1cbf-4764-879b-973346fdd2e3'}
      locationId={'1fc4acba-fc28-4629-b2d9-7b65669fb2a9'}
      styleId={'bc8aac76-e8dd-4239-8e24-32caa58eb1a9'}
    />,
  )
  await waitFor(() => getByText(stats2021.year))
  getByText(`${stats2021.containerType} ${stats2021.containerSize}`)
  getByText(stats2021.reviewAverage)
  getByText(stats2021.reviewCount)
  getByText(stats2020.year)
  getByText(stats2020.reviewAverage)
  getByText(stats2020.reviewCount)
})

test('renders brewery stats', async () => {
  const koskipanimo = {
    breweryId: '8981fe71-1a4d-48f3-8b4e-9b9b3ddf9d8a',
    breweryName: 'Koskipanimo',
    reviewAverage: '9.06',
    reviewCount: '63',
    reviewedBeerCount: '62',
  }
  const lehe = {
    breweryId: 'ba44d3d1-5071-41bc-8a05-65ec8914a13e',
    breweryName: 'Lehe pruulikoda',
    reviewAverage: '9.71',
    reviewCount: '24',
    reviewedBeerCount: '24',
  }
  const breweryStats = { brewery: [{ ...koskipanimo }, { ...lehe }] }
  const statsIf: StatsIf = {
    ...emptyStatsIf,
    brewery: {
      useStats: () => ({
        query: async () => breweryStats,
        stats: emptyBreweryStats,
        isLoading: false,
      }),
      infiniteScroll: (cb: () => void) => {
        cb()
        return () => undefined
      },
      minTime,
      maxTime,
      getUseDebounce,
    },
  }

  const { getByText } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('brewery')}
        statsIf={statsIf}
        breweryId={'a186917f-0d4c-40d0-bf67-e96227c55528'}
        locationId={'b533d497-8256-4525-8892-180a078060d5'}
        styleId={'4917d1c7-5439-4e78-a562-242200a236db'}
      />
    </LinkWrapper>,
  )
  await waitFor(() => getByText(koskipanimo.breweryName))
  getByText(koskipanimo.reviewAverage)
  getByText(`${koskipanimo.reviewCount} (${koskipanimo.reviewedBeerCount})`)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
})

test('sets state', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
  const statsIf: StatsIf = {
    ...emptyStatsIf,
    setSearch,
  }

  const { getByRole } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('brewery')}
        statsIf={statsIf}
        breweryId={undefined}
        locationId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>,
  )
  await openFilters(getByRole, user)
  expect(setSearch).toHaveBeenCalledTimes(1)
  const filtersOpen = setSearch.mock.calls[0][1].filters_open
  expect(filtersOpen).toEqual('1')
})

test('renders container stats', () => {
  const { getByText } = render(
    <Stats
      paramsIf={getStatsParamsIf('container')}
      statsIf={{
        ...emptyStatsIf,
        container: {
          useStats: () => ({
            stats: {
              container: [
                {
                  containerId: '751bf3bb-6277-42d3-ab7f-ec568e8059eb',
                  containerSize: '0.33',
                  containerType: 'bottle',
                  reviewAverage: '7.87',
                  reviewCount: '10',
                },
                {
                  containerId: 'dcd91b24-2116-49c5-b27d-ad85517b5407',
                  containerSize: '0.44',
                  containerType: 'can',
                  reviewAverage: '8.23',
                  reviewCount: '24',
                },
              ],
            },
            isLoading: false,
          }),
        },
      }}
      breweryId={'ed60c2f7-b799-4b47-834c-d123f92f6eac'}
      locationId={'632f4196-9738-41d8-b50d-76d839e11a74'}
      styleId={'3004aece-d2c4-47ae-896c-f2762051a738'}
    />,
  )
  getByText('7.87')
  getByText('10')
  getByText('bottle 0.33')
  getByText('8.23')
  getByText('24')
  getByText('can 0.44')
})

test('renders filtered container stats', () => {
  const { getByText, queryByText } = render(
    <Stats
      paramsIf={getStatsParamsIf('container', { min_review_count: '11' })}
      statsIf={{
        ...emptyStatsIf,
        container: {
          useStats: () => ({
            stats: {
              container: [
                {
                  containerId: '136d1f2c-46b0-4a6b-84ac-e282546f48ee',
                  containerSize: '0.33',
                  containerType: 'bottle',
                  reviewAverage: '7.87',
                  reviewCount: '10',
                },
                {
                  containerId: 'fb60b0b8-b6ea-4c43-a58b-f0a8b661cf9b',
                  containerSize: '0.44',
                  containerType: 'can',
                  reviewAverage: '8.23',
                  reviewCount: '24',
                },
              ],
            },
            isLoading: false,
          }),
        },
      }}
      breweryId={'c2b632e8-01fa-416b-bad3-873022a2afd9'}
      locationId={'e7f2c9bf-c0fb-4deb-a62d-61c5c8d04430'}
      styleId={'c5efc2ba-6b91-4284-8c29-563a872b13a0'}
    />,
  )
  expect(queryByText('7.87')).toEqual(null)
  expect(queryByText('10')).toEqual(null)
  expect(queryByText('bottle 0.33')).toEqual(null)
  getByText('8.23')
  getByText('24')
  getByText('can 0.44')
})

test('renders location stats', async () => {
  const oluthuone: OneLocationStats = {
    locationId: '3b8d95f2-a6a7-4f6b-b347-50328b689a10',
    locationName: 'Oluthuone Panimomestari',
    reviewAverage: '9.06',
    reviewCount: '35',
  }
  const kuja: OneLocationStats = {
    locationId: 'eb247a3c-0b80-4efa-954a-1582115dd0a0',
    locationName: 'Kuja Beer Shop & Bar',
    reviewAverage: '9.71',
    reviewCount: '24',
  }
  const locationStats: LocationStats = {
    location: [{ ...oluthuone }, { ...kuja }],
  }
  const statsIf: StatsIf = {
    ...emptyStatsIf,
    location: {
      useStats: () => ({
        query: async () => locationStats,
        stats: emptyLocationStats,
        isLoading: false,
      }),
      infiniteScroll: (cb: () => void) => {
        cb()
        return () => undefined
      },
      minTime,
      maxTime,
      getUseDebounce,
    },
  }

  const { getByText } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('location')}
        statsIf={statsIf}
        breweryId={'8e13fb83-6793-4c5b-a53a-9d867f07dfe4'}
        locationId={'e3da0a72-c0fc-43dc-95ca-2019406c40fb'}
        styleId={'6ad84abe-06e7-4a76-8c38-e57c072c7c2e'}
      />
    </LinkWrapper>,
  )
  await waitFor(() => getByText(oluthuone.locationName))
  getByText(oluthuone.reviewAverage)
  getByText(oluthuone.reviewCount)
  getByText(kuja.locationName)
  getByText(kuja.reviewAverage)
  getByText(kuja.reviewCount)
})

test('renders rating stats', () => {
  const { getByText } = render(
    <Stats
      paramsIf={getStatsParamsIf('rating')}
      statsIf={{
        ...emptyStatsIf,
        rating: {
          useStats: () => ({
            stats: {
              rating: [
                { rating: '7', count: '10' },
                { rating: '8', count: '11' },
              ],
            },
            isLoading: false,
          }),
        },
      }}
      breweryId={'a64a3770-7bc2-46a1-8be6-87d137d0d644'}
      locationId={'c945c251-9335-4da5-9a2d-11eeafcf71cb'}
      styleId={'c0d9f345-487f-41d0-bcfc-95058ca822fa'}
    />,
  )
  getByText('7')
  getByText('10')
  getByText('8')
  getByText('11')
})

test('renders style stats', () => {
  const pils = {
    styleId: 'e9929659-1d35-4ea4-be15-80b667686384',
    styleName: 'Pils',
    reviewAverage: '8.73',
    reviewCount: '72',
  }
  const ipa = {
    styleId: '5c27dff3-6053-4a4b-8fa5-e84939134056',
    styleName: 'IPA',
    reviewAverage: '8.91',
    reviewCount: '92',
  }
  const statsResult = {
    stats: {
      style: [ipa, pils],
    },
    isLoading: false,
  }

  const { getByText } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('style')}
        statsIf={{
          ...emptyStatsIf,
          style: {
            useStats: () => statsResult,
            minTime,
            maxTime,
            getUseDebounce,
          },
        }}
        breweryId={'482584a6-4ccb-44d6-be37-3458a5c21601'}
        locationId={'fef5fbb5-90ae-4c41-a1a7-e87821f620c8'}
        styleId={'449f632a-eb95-4ad1-a1ff-f4338c603584'}
      />
    </LinkWrapper>,
  )
  getByText(pils.styleName)
  getByText(pils.reviewAverage)
  getByText(pils.reviewCount)
  getByText(ipa.styleName)
  getByText(ipa.reviewAverage)
  getByText(ipa.reviewCount)
})

interface NavigationTest {
  originalSearch: string
  buttonText: string
  destinationSearch: string
}

const navigationTests: NavigationTest[] = [
  {
    destinationSearch: 'overall',
    originalSearch: 'annual',
    buttonText: 'Overall',
  },
  {
    destinationSearch: 'annual',
    originalSearch: 'overall',
    buttonText: 'Annual',
  },
  {
    destinationSearch: 'annual_container',
    originalSearch: 'overall',
    buttonText: 'Annual & Container',
  },
  {
    destinationSearch: 'brewery',
    originalSearch: 'overall',
    buttonText: 'Brewery',
  },
  {
    destinationSearch: 'container',
    originalSearch: 'overall',
    buttonText: 'Container',
  },
  {
    destinationSearch: 'rating',
    originalSearch: 'overall',
    buttonText: 'Rating',
  },
  {
    destinationSearch: 'style',
    originalSearch: 'overall',
    buttonText: 'Style',
  },
]

navigationTests.forEach((testCase) => {
  test(`navigates from ${testCase.originalSearch} stats to ${
    testCase.destinationSearch
  }`, async () => {
    const user = userEvent.setup()
    const setSearch = vitest.fn()
    const { getByRole } = render(
      <LinkWrapper>
        <Stats
          paramsIf={getStatsParamsIf(testCase.originalSearch)}
          statsIf={{
            ...emptyStatsIf,
            setSearch,
          }}
          breweryId={undefined}
          locationId={undefined}
          styleId={undefined}
        />
      </LinkWrapper>,
    )
    const naviButton = getByRole('button', { name: testCase.buttonText })
    await user.click(naviButton)
    expect(setSearch.mock.calls).toEqual([[testCase.destinationSearch, {}]])
  })
})

test('navigates from overall to overall', async () => {
  const user = userEvent.setup()
  const setSearch = vitest.fn()
  const { getByRole } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('overall')}
        statsIf={{
          ...emptyStatsIf,
          setSearch,
        }}
        breweryId={undefined}
        locationId={undefined}
        styleId={undefined}
      />
    </LinkWrapper>,
  )
  const naviButton = getByRole('button', { name: 'Overall' })
  await user.click(naviButton)
  expect(setSearch).not.toHaveBeenCalled()
})

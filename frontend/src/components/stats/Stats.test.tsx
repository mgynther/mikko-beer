import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import Stats from './Stats'
import type { StatsIf } from '../../core/stats/types'
import LinkWrapper from '../LinkWrapper'
import { openFilters } from './filters-test-util'
import type { ParamsIf } from '../util'

const emptyBreweryStats = { brewery: []}

const emptyStatsIf: StatsIf = {
  annual: {
    useStats: () => ({
        stats: {
          annual: [
            { reviewAverage: '0.00', reviewCount: '0', year: '2020' }
          ]
        },
        isLoading: false
      })
  },
  brewery: {
    useStats: () => ({
      query: async () => emptyBreweryStats,
      stats: emptyBreweryStats,
      isLoading: false
    }),
    infiniteScroll: (cb: () => void) => {
      cb()
      return () => undefined
    }
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
              reviewCount: '0'
            }
          ]
        },
        isLoading: false
      })
  },
  overall: {
    useStats: () => ({
        stats: {
          beerCount: '0',
          breweryCount: '0',
          containerCount: '0',
          reviewCount: '0',
          distinctBeerReviewCount: '0',
          reviewAverage: '0.00',
          styleCount: '0'
        },
        isLoading: false
      })
  },
  rating: {
    useStats: () => ({
        stats: {
          rating: [
            { rating: '4', count: '0' }
          ]
        },
        isLoading: false
      })
  },
  style: {
    useStats: () => ({
      stats: {
        style: []
      },
      isLoading: false
    })
  },
  setSearch: async () => undefined
}

const paramsIf: ParamsIf = {
  useParams: () => ({
  }),
  useSearch: () => ({
    get: () => undefined
  })
}

function getStatsParamsIf (
  stats: string,
  filters: Record<string, string> = {}
): ParamsIf {
  const params: Record<string, string> = { ...filters, stats }
  return {
    useParams: () => ({
    }),
    useSearch: () => ({
      get: (name: string) => params[name]
    })
  }
}

interface OverallTestCase {
  paramsIf: ParamsIf
  description: string
}

const overallTestCases: OverallTestCase[] = [
  {
    paramsIf,
    description: 'by default'
  },
  {
    paramsIf: getStatsParamsIf('overall'),
    description: 'from search param'
  }
]

overallTestCases.forEach(testCase => {
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
                  reviewCount: '112',
                  distinctBeerReviewCount: '110',
                  reviewAverage: '8.54',
                  styleCount: '29'
                },
                isLoading: false
              })
          }
        }}
        breweryId={'282844e4-f411-4c6a-95d6-9131b8c0491f'}
        styleId={'1d1bc37a-d5d0-4175-92b2-7d24f961bb20'}
      />
    )
    getByText('123')
    getByText('54')
    getByText('8')
    getByText('112')
    getByText('110')
    getByText('8.54')
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
                  { reviewAverage: '8.23', reviewCount: '24', year: '2021' }
                ]
              },
              isLoading: false
            })
        }
      }}
      breweryId={'ed60c2f7-b799-4b47-834c-d123f92f6eac'}
      styleId={'3004aece-d2c4-47ae-896c-f2762051a738'}
    />
  )
  getByText('7.87')
  getByText('10')
  getByText('2020')
  getByText('8.23')
  getByText('24')
  getByText('2021')
})

test('renders brewery stats', async () => {
  const user = userEvent.setup()
  const koskipanimo = {
    breweryId: '8981fe71-1a4d-48f3-8b4e-9b9b3ddf9d8a',
    breweryName: 'Koskipanimo',
    reviewAverage: '9.06',
    reviewCount: '63'
  }
  const lehe = {
    breweryId: 'ba44d3d1-5071-41bc-8a05-65ec8914a13e',
    breweryName: 'Lehe pruulikoda',
    reviewAverage: '9.71',
    reviewCount: '24'
  }
  const breweryStats = { brewery: [{ ...koskipanimo }, { ...lehe }]}

  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('brewery')}
        statsIf={{
          ...emptyStatsIf,
          brewery: {
            useStats: () => ({
              query: async () => breweryStats,
              stats: emptyBreweryStats,
              isLoading: false
            }),
            infiniteScroll: (cb: () => void) => {
              cb()
              return () => undefined
            }
          }
        }}
        breweryId={'a186917f-0d4c-40d0-bf67-e96227c55528'}
        styleId={'4917d1c7-5439-4e78-a562-242200a236db'}
      />
    </LinkWrapper>
  )
  // Need to do something to get breweries set.
  await openFilters(getByRole, user)
  getByText(koskipanimo.breweryName)
  getByText(koskipanimo.reviewAverage)
  getByText(koskipanimo.reviewCount)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
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
                    reviewCount: '10'
                  },
                  {
                    containerId: 'dcd91b24-2116-49c5-b27d-ad85517b5407',
                    containerSize: '0.44',
                    containerType: 'can',
                    reviewAverage: '8.23',
                    reviewCount: '24'
                  }
                ]
              },
              isLoading: false
            })
        },
      }}
      breweryId={'ed60c2f7-b799-4b47-834c-d123f92f6eac'}
      styleId={'3004aece-d2c4-47ae-896c-f2762051a738'}
    />
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
                    reviewCount: '10'
                  },
                  {
                    containerId: 'fb60b0b8-b6ea-4c43-a58b-f0a8b661cf9b',
                    containerSize: '0.44',
                    containerType: 'can',
                    reviewAverage: '8.23',
                    reviewCount: '24'
                  }
                ]
              },
              isLoading: false
            })
        },
      }}
      breweryId={'c2b632e8-01fa-416b-bad3-873022a2afd9'}
      styleId={'c5efc2ba-6b91-4284-8c29-563a872b13a0'}
    />
  )
  expect(queryByText('7.87')).toEqual(null)
  expect(queryByText('10')).toEqual(null)
  expect(queryByText('bottle 0.33')).toEqual(null)
  getByText('8.23')
  getByText('24')
  getByText('can 0.44')
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
                  { rating: '8', count: '11' }
                ]
              },
              isLoading: false
            })
        }
      }}
      breweryId={'a64a3770-7bc2-46a1-8be6-87d137d0d644'}
      styleId={'c0d9f345-487f-41d0-bcfc-95058ca822fa'}
    />
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
    reviewCount: '72'
  }
  const ipa = {
    styleId: '5c27dff3-6053-4a4b-8fa5-e84939134056',
    styleName: 'IPA',
    reviewAverage: '8.91',
    reviewCount: '92'
  }
  const statsResult = {
    stats: {
      style: [ipa, pils]
    },
    isLoading: false
  }

  const { getByText } = render(
    <LinkWrapper>
      <Stats
        paramsIf={getStatsParamsIf('style')}
        statsIf={{
          ...emptyStatsIf,
          style: {
            useStats: () => statsResult
          }
        }}
        breweryId={'482584a6-4ccb-44d6-be37-3458a5c21601'}
        styleId={'449f632a-eb95-4ad1-a1ff-f4338c603584'}
      />
    </LinkWrapper>
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
    buttonText: 'Overall'
  },
  {
    destinationSearch: 'annual',
    originalSearch: 'overall',
    buttonText: 'Annual'
  },
  {
    destinationSearch: 'brewery',
    originalSearch: 'overall',
    buttonText: 'Brewery'
  },
  {
    destinationSearch: 'container',
    originalSearch: 'overall',
    buttonText: 'Container'
  },
  {
    destinationSearch: 'rating',
    originalSearch: 'overall',
    buttonText: 'Rating'
  },
  {
    destinationSearch: 'style',
    originalSearch: 'overall',
    buttonText: 'Style'
  }
]

navigationTests.forEach(testCase => {
  test(`navigates from ${
    testCase.originalSearch
  } stats to ${
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
            setSearch
          }}
          breweryId={undefined}
          styleId={undefined}
        />
      </LinkWrapper>
    )
    const naviButton = getByRole('button', { name: testCase.buttonText })
    await user.click(naviButton)
    expect(setSearch.mock.calls).toEqual([[testCase.destinationSearch, {}]])
  }); }
)

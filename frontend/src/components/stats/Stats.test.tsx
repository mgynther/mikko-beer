import { act, render } from '@testing-library/react'
import { test } from 'vitest'
import Stats from './Stats'
import type { StatsIf } from '../../core/stats/types'
import LinkWrapper from '../LinkWrapper'

function openFilters(
  getByRole: (type: string, props: Record<string, string>) => HTMLElement
): void {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  act(() => { toggleButton.click(); })
}

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
  }
}

test('renders overall stats', () => {
  const { getByRole, getByText } = render(
    <Stats
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
  const annualButton = getByRole('button', { name: 'Annual' })
  act(() => { annualButton.click(); })
  const overallButton = getByRole('button', { name: 'Overall' })
  act(() => { overallButton.click(); })
  getByText('123')
  getByText('54')
  getByText('8')
  getByText('112')
  getByText('110')
  getByText('8.54')
  getByText('29')
})

test('renders annual stats', () => {
  const { getByRole, getByText } = render(
    <Stats
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
  const annualButton = getByRole('button', { name: 'Annual' })
  act(() => { annualButton.click(); })
  getByText('7.87')
  getByText('10')
  getByText('2020')
  getByText('8.23')
  getByText('24')
  getByText('2021')
})

test('renders brewery stats', async () => {
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
  const breweryButton = getByRole('button', { name: 'Brewery' })
  act(() => { breweryButton.click(); })
  // Need to do something to get breweries set.
  await act(async() => { openFilters(getByRole); })
  getByText(koskipanimo.breweryName)
  getByText(koskipanimo.reviewAverage)
  getByText(koskipanimo.reviewCount)
  getByText(lehe.breweryName)
  getByText(lehe.reviewAverage)
  getByText(lehe.reviewCount)
})

test('renders rating stats', () => {
  const { getByRole, getByText } = render(
    <Stats
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
  const ratingButton = getByRole('button', { name: 'Rating' })
  act(() => { ratingButton.click(); })
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

  const { getByRole, getByText } = render(
    <LinkWrapper>
      <Stats
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
  const styleButton = getByRole('button', { name: 'Style' })
  act(() => { styleButton.click(); })
  getByText(pils.styleName)
  getByText(pils.reviewAverage)
  getByText(pils.reviewCount)
  getByText(ipa.styleName)
  getByText(ipa.reviewAverage)
  getByText(ipa.reviewCount)
})

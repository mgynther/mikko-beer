import { render } from '@testing-library/react'
import { expect, test, vitest } from 'vitest'
import Overall from './Overall'
import type { IdParams, OverallStats } from '../../core/stats/types'

const breweryId = '927a5106-1c3a-470f-b5a4-c9cbea05c112'
const styleId = '1afa8a5b-186f-40fd-b92f-42b1874091ac'

const overallStats: OverallStats = {
  beerCount: '123',
  breweryCount: '54',
  containerCount: '8',
  locationCount: '5',
  reviewCount: '112',
  distinctBeerReviewCount: '110',
  reviewAverage: '8.54',
  reviewMedian: '8.50',
  reviewMode: '9',
  reviewStandardDeviation: '0.71',
  reviewWithLocationCount: '78',
  reviewWithoutLocationCount: '34',
  styleCount: '29',
}

function renderOverall(
  stats: (params: IdParams) => undefined,
  locationId: string | undefined,
): ReturnType<typeof render> {
  return render(
    <Overall
      getOverallStatsIf={{
        useStats: (params: IdParams) => {
          stats(params)
          return {
            stats: overallStats,
            isLoading: false,
          }
        },
      }}
      breweryId={breweryId}
      locationId={locationId}
      styleId={styleId}
    />,
  )
}

test('renders overall stats with location', () => {
  const stats = vitest.fn()
  const locationId = '22a1767b-e81c-42aa-b2d2-227e323d2a6c'
  const { getByText, queryByText } = renderOverall(stats, locationId)
  expect(stats.mock.calls).toEqual([
    [
      {
        breweryId,
        locationId: locationId,
        styleId,
      },
    ],
  ])
  getByText(overallStats.beerCount)
  getByText(overallStats.breweryCount)
  getByText(overallStats.containerCount)
  getByText(overallStats.reviewCount)
  getByText(overallStats.distinctBeerReviewCount)
  getByText(overallStats.reviewAverage)
  getByText(overallStats.reviewMedian)
  getByText(overallStats.reviewMode)
  getByText(overallStats.reviewStandardDeviation)
  getByText(overallStats.styleCount)
  expect(queryByText(overallStats.locationCount)).toEqual(null)
  expect(queryByText(overallStats.reviewWithLocationCount)).toEqual(null)
  expect(queryByText(overallStats.reviewWithoutLocationCount)).toEqual(null)
})

test('renders overall stats without location', () => {
  const stats = vitest.fn()
  const { getByText } = renderOverall(stats, undefined)
  expect(stats.mock.calls).toEqual([
    [
      {
        breweryId,
        locationId: undefined,
        styleId,
      },
    ],
  ])
  getByText(overallStats.beerCount)
  getByText(overallStats.breweryCount)
  getByText(overallStats.containerCount)
  getByText(overallStats.locationCount)
  getByText(overallStats.reviewCount)
  getByText(overallStats.distinctBeerReviewCount)
  getByText(overallStats.reviewAverage)
  getByText(overallStats.reviewMedian)
  getByText(overallStats.reviewMode)
  getByText(overallStats.reviewStandardDeviation)
  getByText(overallStats.reviewWithLocationCount)
  getByText(overallStats.reviewWithoutLocationCount)
  getByText(overallStats.styleCount)
})

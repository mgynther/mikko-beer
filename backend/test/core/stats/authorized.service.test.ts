import { expect } from 'earl'
import * as statsService from '../../../src/core/stats/authorized.service'

import type { AuthTokenPayload } from "../../../src/core/auth/auth-token"
import { Role } from "../../../src/core/user/user"
import { dummyLog as log } from '../dummy-log'
import type {
  AnnualStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StatsBreweryStyleFilter,
  StyleStats
} from '../../../src/core/stats/stats'

const adminAuthToken: AuthTokenPayload = {
  userId: '2238a6f3-6cc7-44a4-bb91-6369bd9adf56',
  role: Role.admin,
  refreshTokenId: '0d3e980c-7d2b-4c73-a439-c55ddaa7a682'
}

const viewerAuthToken: AuthTokenPayload = {
  userId: '57373ccd-a2ed-480c-beb4-90565da54e2d',
  role: Role.viewer,
  refreshTokenId: 'ddf43e29-7c7f-4246-9e39-88add3375bd6'
}

describe('stats authorized service unit tests', () => {
  [adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const statsFilter: StatsBreweryStyleFilter = {
      brewery: '94235104-ded1-44ec-a54c-ce972fe35420',
      style: undefined
    }

    it(`get overall stats as ${token.role}`, async () => {
      const overallStats: OverallStats = {
        beerCount: '123',
        breweryCount: '40',
        containerCount: '8',
        locationCount: '3',
        reviewCount: '120',
        distinctBeerReviewCount: '119',
        reviewAverage: '8.50',
        styleCount: '28'
      }
      const result = await statsService.getOverall(
        async () => ({ ...overallStats }),
        token,
        statsFilter,
        log
      )
      expect(result).toEqual({ ...overallStats })
    })

    it(`get annual stats as ${token.role}`, async () => {
      const annualStats: AnnualStats = [
        {
          reviewAverage: '8.23',
          reviewCount: '234',
          year: '2023'
        },
        {
          reviewAverage: '8.31',
          reviewCount: '215',
          year: '2024'
        }
      ]
      const result = await statsService.getAnnual(
        async () => ([ ...annualStats ]),
        token,
        statsFilter,
        log
      )
      expect(result).toEqual([ ...annualStats ])
    })

    it(`get brewery stats as ${token.role}`, async () => {
      const breweryStats: BreweryStats = [
        {
          reviewAverage: '9.08',
          reviewCount: '64',
          breweryId: 'c1c9948d-2a7a-4b54-9ada-0fbfedfe2121',
          breweryName: 'Koskipanimo'
        },
        {
          reviewAverage: '9.01',
          reviewCount: '55',
          breweryId: '1c0b32ed-a73a-422d-a14a-e70b0ea28e1d',
          breweryName: 'Mallaskoski'
        }
      ]
      const result = await statsService.getBrewery(
        async () => ([ ...breweryStats ]),
        token,
        { skip: 0, size: 20 },
        {
          ...statsFilter,
          maxReviewCount: 66,
          minReviewCount: 50,
          maxReviewAverage: 9.87,
          minReviewAverage: 5.23
        },
        {
          property: 'brewery_name',
          direction: 'desc'
        },
        log
      )
      expect(result).toEqual([ ...breweryStats ])
    })

    it(`get container stats as ${token.role}`, async () => {
      const containerStats: ContainerStats = [
        {
          reviewAverage: '8.43',
          reviewCount: '212',
          containerId: '95dbb5a8-c814-42ef-a9bf-d3aa220749a1',
          containerSize: '0.25',
          containerType: 'draft'
        },
        {
          reviewAverage: '8.11',
          reviewCount: '201',
          containerId: '87aa392e-b1af-44d2-8690-460687709f0c',
          containerSize: '0.33',
          containerType: 'bottle'
        }
      ]
      const result = await statsService.getContainer(
        async () => ([ ...containerStats ]),
        token,
        statsFilter,
        log
      )
      expect(result).toEqual([ ...containerStats ])
    })

    it(`get location stats as ${token.role}`, async () => {
      const locationStats: LocationStats = [
        {
          reviewAverage: '9.08',
          reviewCount: '64',
          locationId: '7deae235-e990-4ee7-b445-b19dd7fa5a1f',
          locationName: 'Kuja Beer Shop & Bar'
        },
        {
          reviewAverage: '9.01',
          reviewCount: '55',
          locationId: '8a44ffcd-a647-4903-ab8f-7d98c4c28189',
          locationName: 'Oluthuone Panimomestari'
        }
      ]
      const result = await statsService.getLocation(
        async () => ([ ...locationStats ]),
        token,
        { skip: 0, size: 20 },
        {
          ...statsFilter,
          maxReviewCount: 66,
          minReviewCount: 50,
          maxReviewAverage: 9.87,
          minReviewAverage: 5.23
        },
        {
          property: 'location_name',
          direction: 'desc'
        },
        log
      )
      expect(result).toEqual([ ...locationStats ])
    })

    it(`get rating stats as ${token.role}`, async () => {
      const ratingStats: RatingStats = [
        {
          rating: '9',
          count: '5'
        },
        {
          rating: '8',
          count: '15'
        }
      ]

      const result = await statsService.getRating(
        async () => ([ ...ratingStats ]),
        token,
        statsFilter,
        log
      )
      expect(result).toEqual([ ...ratingStats ])
    })

    it(`get style stats as ${token.role}`, async () => {
      const styleStats: StyleStats = [
        {
          reviewAverage: '9.12',
          reviewCount: '58',
          styleId: 'c1c9948d-2a7a-4b54-9ada-0fbfedfe2121',
          styleName: 'American IPA'
        },
        {
          reviewAverage: '9.69',
          reviewCount: '40',
          styleId: '2a0f8f10-297f-4bfa-81af-98c529b6dfbe',
          styleName: 'Imperial Stout'
        }
      ]
      const result = await statsService.getStyle(
        async () => ([ ...styleStats ]),
        token,
        {
          ...statsFilter,
          maxReviewCount: 62,
          minReviewCount: 39,
          maxReviewAverage: 9.87,
          minReviewAverage: 5.23
        },
        {
          property: 'average',
          direction: 'desc'
        },
        log
      )
      expect(result).toEqual([ ...styleStats ])
    })
  })
})

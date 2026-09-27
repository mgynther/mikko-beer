import { suite, test } from '../../test.js'

import * as statsService from '../../../src/logic/stats/authorized.service.js'

import type { AuthTokenPayload } from '../../../src/logic/auth/auth-token'
import { dummyLog as log } from '../dummy-log.js'
import { assertDeepEqual } from '../../assert.js'
import { buildAuthTokenPayload } from '../auth/builders.js'
import {
  buildAnnualContainerStatsRow,
  buildAnnualStatsRow,
  buildBreweryCountryStatsRow,
  buildBreweryStatsRow,
  buildContainerStatsRow,
  buildLocationStatsRow,
  buildOverallStats,
  buildRatingStatsRow,
  buildStatsFilter,
  buildStatsIdFilter,
  buildStyleStatsRow,
} from './builders.js'
import {
  defaultOrderedStatsQuery,
  defaultStatsIdFilterQuery,
  passAnnualContainerStatsValidation,
  passBreweryCountryStatsValidation,
  passBreweryStatsValidation,
  passLocationStatsValidation,
  passStatsIdFilterValidation,
  passStyleStatsValidation,
} from './stats-validation.js'

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

suite('stats authorized service unit tests', () => {
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const statsFilter = buildStatsIdFilter()

    test(`get overall stats as ${token.role}`, async () => {
      const overallStats = buildOverallStats()
      const result = await statsService.getOverall(
        async () => ({ ...overallStats }),
        passStatsIdFilterValidation(statsFilter),
        token,
        defaultStatsIdFilterQuery,
        log,
      )
      assertDeepEqual(result, { ...overallStats })
    })

    test(`get annual stats as ${token.role}`, async () => {
      const annualStats = [buildAnnualStatsRow()]
      const result = await statsService.getAnnual(
        async () => [...annualStats],
        passStatsIdFilterValidation(statsFilter),
        token,
        defaultStatsIdFilterQuery,
        log,
      )
      assertDeepEqual(result, [...annualStats])
    })

    test(`get annual container stats as ${token.role}`, async () => {
      const annualContainerStats = [buildAnnualContainerStatsRow()]
      const result = await statsService.getAnnualContainer(
        async () => [...annualContainerStats],
        passAnnualContainerStatsValidation({ skip: 0, size: 20 }, statsFilter),
        token,
        { skip: '0', size: '20' },
        defaultStatsIdFilterQuery,
        log,
      )
      assertDeepEqual(result, [...annualContainerStats])
    })

    test(`get brewery stats as ${token.role}`, async () => {
      const breweryStats = [buildBreweryStatsRow()]
      const result = await statsService.getBrewery(
        async () => [...breweryStats],
        passBreweryStatsValidation({ skip: 0, size: 20 }, buildStatsFilter(), {
          property: 'brewery_name',
          direction: 'desc',
        }),
        token,
        { skip: '0', size: '20' },
        defaultOrderedStatsQuery,
        log,
      )
      assertDeepEqual(result, [...breweryStats])
    })

    test(`get brewery country stats as ${token.role}`, async () => {
      const breweryCountryStats = [buildBreweryCountryStatsRow()]
      const result = await statsService.getBreweryCountry(
        async () => [...breweryCountryStats],
        passBreweryCountryStatsValidation(
          { skip: 0, size: 20 },
          buildStatsFilter(),
          {
            property: 'brewery_count',
            direction: 'desc',
          },
        ),
        token,
        { skip: '0', size: '20' },
        defaultOrderedStatsQuery,
        log,
      )
      assertDeepEqual(result, [...breweryCountryStats])
    })

    test(`get container stats as ${token.role}`, async () => {
      const containerStats = [buildContainerStatsRow()]
      const result = await statsService.getContainer(
        async () => [...containerStats],
        passStatsIdFilterValidation(statsFilter),
        token,
        defaultStatsIdFilterQuery,
        log,
      )
      assertDeepEqual(result, [...containerStats])
    })

    test(`get location stats as ${token.role}`, async () => {
      const locationStats = [buildLocationStatsRow()]
      const result = await statsService.getLocation(
        async () => [...locationStats],
        passLocationStatsValidation({ skip: 0, size: 20 }, buildStatsFilter(), {
          property: 'location_name',
          direction: 'desc',
        }),
        token,
        { skip: '0', size: '20' },
        defaultOrderedStatsQuery,
        log,
      )
      assertDeepEqual(result, [...locationStats])
    })

    test(`get rating stats as ${token.role}`, async () => {
      const ratingStats = [buildRatingStatsRow()]

      const result = await statsService.getRating(
        async () => [...ratingStats],
        passStatsIdFilterValidation(statsFilter),
        token,
        defaultStatsIdFilterQuery,
        log,
      )
      assertDeepEqual(result, [...ratingStats])
    })

    test(`get style stats as ${token.role}`, async () => {
      const styleStats = [buildStyleStatsRow()]
      const result = await statsService.getStyle(
        async () => [...styleStats],
        passStyleStatsValidation(buildStatsFilter(), {
          property: 'average',
          direction: 'desc',
        }),
        token,
        defaultOrderedStatsQuery,
        log,
      )
      assertDeepEqual(result, [...styleStats])
    })
  })
})

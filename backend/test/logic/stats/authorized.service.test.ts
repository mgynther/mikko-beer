import { describe, it } from 'node:test'

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

const adminAuthToken = buildAuthTokenPayload({ role: 'admin' })

const viewerAuthToken = buildAuthTokenPayload({ role: 'viewer' })

describe('stats authorized service unit tests', () => {
  ;[adminAuthToken, viewerAuthToken].forEach((token: AuthTokenPayload) => {
    const statsFilter = buildStatsIdFilter()

    it(`get overall stats as ${token.role}`, async () => {
      const overallStats = buildOverallStats()
      const result = await statsService.getOverall(
        async () => ({ ...overallStats }),
        token,
        statsFilter,
        log,
      )
      assertDeepEqual(result, { ...overallStats })
    })

    it(`get annual stats as ${token.role}`, async () => {
      const annualStats = [buildAnnualStatsRow()]
      const result = await statsService.getAnnual(
        async () => [...annualStats],
        token,
        statsFilter,
        log,
      )
      assertDeepEqual(result, [...annualStats])
    })

    it(`get annual container stats as ${token.role}`, async () => {
      const annualContainerStats = [buildAnnualContainerStatsRow()]
      const result = await statsService.getAnnualContainer(
        async () => [...annualContainerStats],
        token,
        { skip: 0, size: 20 },
        statsFilter,
        log,
      )
      assertDeepEqual(result, [...annualContainerStats])
    })

    it(`get brewery stats as ${token.role}`, async () => {
      const breweryStats = [buildBreweryStatsRow()]
      const result = await statsService.getBrewery(
        async () => [...breweryStats],
        token,
        { skip: 0, size: 20 },
        buildStatsFilter(),
        {
          property: 'brewery_name',
          direction: 'desc',
        },
        log,
      )
      assertDeepEqual(result, [...breweryStats])
    })

    it(`get brewery country stats as ${token.role}`, async () => {
      const breweryCountryStats = [buildBreweryCountryStatsRow()]
      const result = await statsService.getBreweryCountry(
        async () => [...breweryCountryStats],
        token,
        { skip: 0, size: 20 },
        buildStatsFilter(),
        {
          property: 'brewery_count',
          direction: 'desc',
        },
        log,
      )
      assertDeepEqual(result, [...breweryCountryStats])
    })

    it(`get container stats as ${token.role}`, async () => {
      const containerStats = [buildContainerStatsRow()]
      const result = await statsService.getContainer(
        async () => [...containerStats],
        token,
        statsFilter,
        log,
      )
      assertDeepEqual(result, [...containerStats])
    })

    it(`get location stats as ${token.role}`, async () => {
      const locationStats = [buildLocationStatsRow()]
      const result = await statsService.getLocation(
        async () => [...locationStats],
        token,
        { skip: 0, size: 20 },
        buildStatsFilter(),
        {
          property: 'location_name',
          direction: 'desc',
        },
        log,
      )
      assertDeepEqual(result, [...locationStats])
    })

    it(`get rating stats as ${token.role}`, async () => {
      const ratingStats = [buildRatingStatsRow()]

      const result = await statsService.getRating(
        async () => [...ratingStats],
        token,
        statsFilter,
        log,
      )
      assertDeepEqual(result, [...ratingStats])
    })

    it(`get style stats as ${token.role}`, async () => {
      const styleStats = [buildStyleStatsRow()]
      const result = await statsService.getStyle(
        async () => [...styleStats],
        token,
        buildStatsFilter(),
        {
          property: 'average',
          direction: 'desc',
        },
        log,
      )
      assertDeepEqual(result, [...styleStats])
    })
  })
})

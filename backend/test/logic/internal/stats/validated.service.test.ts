import { suite, test } from '../../../test.js'

import * as statsService from '../../../../src/logic/internal/stats/validated.service.js'

import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryCountryStats,
  BreweryCountryStatsOrder,
  BreweryStats,
  BreweryStatsOrder,
  ContainerStats,
  LocationStats,
  LocationStatsOrder,
  OverallStats,
  RatingStats,
  StatsFilter,
  StatsIdFilter,
  StyleStats,
  StyleStatsOrder,
} from '../../../../src/logic/stats/stats.js'
import type { Pagination } from '../../../../src/logic/pagination.js'
import {
  invalidBreweryCountryStatsQueryError,
  invalidBreweryStatsQueryError,
  invalidIdFilterError,
  invalidLocationStatsQueryError,
  invalidStyleStatsQueryError,
} from '../../../../src/logic/errors.js'
import { dummyLog as log } from '../../dummy-log.js'
import { expectReject } from '../../controller-error-helper.js'
import { assertDeepEqual } from '../../../assert.js'
import { mockFunction } from '../../../mock.js'
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
} from '../../stats/builders.js'
import {
  defaultOrderedStatsQuery,
  defaultStatsIdFilterQuery,
  passAnnualContainerStatsValidation,
  passBreweryCountryStatsValidation,
  passBreweryStatsValidation,
  passLocationStatsValidation,
  passStatsIdFilterValidation,
  passStyleStatsValidation,
} from '../../stats/stats-validation.js'

const pagination: Pagination = { size: 20, skip: 40 }

const idFilter = buildStatsIdFilter({
  brewery: '0e7d2a47-97d6-4c52-8b41-1a0a1b1f7d24',
})

const filter = buildStatsFilter({ minReviewCount: 3 })

function notCalled(): never {
  throw new Error('not to be called')
}

const failIdFilterValidation = (): {
  errorCode: 'invalid-id-filter'
  result: undefined
} => ({ errorCode: 'invalid-id-filter', result: undefined })

suite('stats validated service unit tests', () => {
  test('get overall stats with the id filter validated', async () => {
    const overall = buildOverallStats()
    const getOverall = mockFunction<
      [statsFilter: StatsIdFilter],
      Promise<OverallStats>
    >(async () => overall)
    const result = await statsService.getOverall(
      getOverall,
      passStatsIdFilterValidation(idFilter),
      defaultStatsIdFilterQuery,
      log,
    )
    assertDeepEqual(result, overall)
    assertDeepEqual(
      getOverall.mock.calls.map((call) => call.arguments),
      [[idFilter]],
    )
  })

  test('fail to get overall stats with invalid id filter', async () => {
    await expectReject(async () => {
      await statsService.getOverall(
        notCalled,
        failIdFilterValidation,
        defaultStatsIdFilterQuery,
        log,
      )
    }, invalidIdFilterError)
  })

  test('get annual stats with the id filter validated', async () => {
    const annual = [buildAnnualStatsRow()]
    const getAnnual = mockFunction<
      [statsFilter: StatsIdFilter],
      Promise<AnnualStats>
    >(async () => annual)
    const result = await statsService.getAnnual(
      getAnnual,
      passStatsIdFilterValidation(idFilter),
      defaultStatsIdFilterQuery,
      log,
    )
    assertDeepEqual(result, annual)
    assertDeepEqual(
      getAnnual.mock.calls.map((call) => call.arguments),
      [[idFilter]],
    )
  })

  test('get container stats with the id filter validated', async () => {
    const container = [buildContainerStatsRow()]
    const getContainer = mockFunction<
      [statsFilter: StatsIdFilter],
      Promise<ContainerStats>
    >(async () => container)
    const result = await statsService.getContainer(
      getContainer,
      passStatsIdFilterValidation(idFilter),
      defaultStatsIdFilterQuery,
      log,
    )
    assertDeepEqual(result, container)
    assertDeepEqual(
      getContainer.mock.calls.map((call) => call.arguments),
      [[idFilter]],
    )
  })

  test('get rating stats with the id filter validated', async () => {
    const rating = [buildRatingStatsRow()]
    const getRating = mockFunction<
      [statsFilter: StatsIdFilter],
      Promise<RatingStats>
    >(async () => rating)
    const result = await statsService.getRating(
      getRating,
      passStatsIdFilterValidation(idFilter),
      defaultStatsIdFilterQuery,
      log,
    )
    assertDeepEqual(result, rating)
    assertDeepEqual(
      getRating.mock.calls.map((call) => call.arguments),
      [[idFilter]],
    )
  })

  test('get annual container stats with the query validated', async () => {
    const annualContainer = [buildAnnualContainerStatsRow()]
    const getAnnualContainer = mockFunction<
      [pagination: Pagination, statsFilter: StatsIdFilter],
      Promise<AnnualContainerStats>
    >(async () => annualContainer)
    const result = await statsService.getAnnualContainer(
      getAnnualContainer,
      passAnnualContainerStatsValidation(pagination, idFilter),
      { size: '20', skip: '40' },
      defaultStatsIdFilterQuery,
      log,
    )
    assertDeepEqual(result, annualContainer)
    assertDeepEqual(
      getAnnualContainer.mock.calls.map((call) => call.arguments),
      [[pagination, idFilter]],
    )
  })

  test('fail to get annual container stats with invalid id filter', async () => {
    await expectReject(async () => {
      await statsService.getAnnualContainer(
        notCalled,
        {
          ...passAnnualContainerStatsValidation(pagination, idFilter),
          filter: failIdFilterValidation,
        },
        { size: '20', skip: '40' },
        defaultStatsIdFilterQuery,
        log,
      )
    }, invalidIdFilterError)
  })

  test('get brewery stats with the query validated', async () => {
    const order: BreweryStatsOrder = { property: 'average', direction: 'desc' }
    const brewery = [buildBreweryStatsRow()]
    const getBrewery = mockFunction<
      [pagination: Pagination, filter: StatsFilter, order: BreweryStatsOrder],
      Promise<BreweryStats>
    >(async () => brewery)
    const result = await statsService.getBrewery(
      getBrewery,
      passBreweryStatsValidation(pagination, filter, order),
      { size: '20', skip: '40' },
      defaultOrderedStatsQuery,
      log,
    )
    assertDeepEqual(result, brewery)
    assertDeepEqual(
      getBrewery.mock.calls.map((call) => call.arguments),
      [[pagination, filter, order]],
    )
  })

  test('fail to get brewery stats with invalid filter', async () => {
    await expectReject(async () => {
      await statsService.getBrewery(
        notCalled,
        {
          ...passBreweryStatsValidation(pagination, filter, {
            property: 'average',
            direction: 'desc',
          }),
          filter: failIdFilterValidation,
        },
        { size: '20', skip: '40' },
        defaultOrderedStatsQuery,
        log,
      )
    }, invalidIdFilterError)
  })

  test('fail to get brewery stats with invalid order', async () => {
    await expectReject(async () => {
      await statsService.getBrewery(
        notCalled,
        {
          ...passBreweryStatsValidation(pagination, filter, {
            property: 'average',
            direction: 'desc',
          }),
          order: () => ({
            errorCode: 'invalid-brewery-stats-query',
            result: undefined,
          }),
        },
        { size: '20', skip: '40' },
        defaultOrderedStatsQuery,
        log,
      )
    }, invalidBreweryStatsQueryError)
  })

  test('get brewery country stats with the query validated', async () => {
    const order: BreweryCountryStatsOrder = {
      property: 'brewery_count',
      direction: 'desc',
    }
    const breweryCountry = [buildBreweryCountryStatsRow()]
    const getBreweryCountry = mockFunction<
      [
        pagination: Pagination,
        filter: StatsFilter,
        order: BreweryCountryStatsOrder,
      ],
      Promise<BreweryCountryStats>
    >(async () => breweryCountry)
    const result = await statsService.getBreweryCountry(
      getBreweryCountry,
      passBreweryCountryStatsValidation(pagination, filter, order),
      { size: '20', skip: '40' },
      defaultOrderedStatsQuery,
      log,
    )
    assertDeepEqual(result, breweryCountry)
    assertDeepEqual(
      getBreweryCountry.mock.calls.map((call) => call.arguments),
      [[pagination, filter, order]],
    )
  })

  test('fail to get brewery country stats with invalid order', async () => {
    await expectReject(async () => {
      await statsService.getBreweryCountry(
        notCalled,
        {
          ...passBreweryCountryStatsValidation(pagination, filter, {
            property: 'brewery_count',
            direction: 'desc',
          }),
          order: () => ({
            errorCode: 'invalid-brewery-country-stats-query',
            result: undefined,
          }),
        },
        { size: '20', skip: '40' },
        defaultOrderedStatsQuery,
        log,
      )
    }, invalidBreweryCountryStatsQueryError)
  })

  test('get location stats with the query validated', async () => {
    const order: LocationStatsOrder = { property: 'count', direction: 'asc' }
    const location = [buildLocationStatsRow()]
    const getLocation = mockFunction<
      [pagination: Pagination, filter: StatsFilter, order: LocationStatsOrder],
      Promise<LocationStats>
    >(async () => location)
    const result = await statsService.getLocation(
      getLocation,
      passLocationStatsValidation(pagination, filter, order),
      { size: '20', skip: '40' },
      defaultOrderedStatsQuery,
      log,
    )
    assertDeepEqual(result, location)
    assertDeepEqual(
      getLocation.mock.calls.map((call) => call.arguments),
      [[pagination, filter, order]],
    )
  })

  test('fail to get location stats with invalid order', async () => {
    await expectReject(async () => {
      await statsService.getLocation(
        notCalled,
        {
          ...passLocationStatsValidation(pagination, filter, {
            property: 'count',
            direction: 'asc',
          }),
          order: () => ({
            errorCode: 'invalid-location-stats-query',
            result: undefined,
          }),
        },
        { size: '20', skip: '40' },
        defaultOrderedStatsQuery,
        log,
      )
    }, invalidLocationStatsQueryError)
  })

  test('get style stats with the query validated', async () => {
    const order: StyleStatsOrder = { property: 'std_dev', direction: 'desc' }
    const style = [buildStyleStatsRow()]
    const getStyle = mockFunction<
      [filter: StatsFilter, order: StyleStatsOrder],
      Promise<StyleStats>
    >(async () => style)
    const result = await statsService.getStyle(
      getStyle,
      passStyleStatsValidation(filter, order),
      defaultOrderedStatsQuery,
      log,
    )
    assertDeepEqual(result, style)
    assertDeepEqual(
      getStyle.mock.calls.map((call) => call.arguments),
      [[filter, order]],
    )
  })

  test('fail to get style stats with invalid order', async () => {
    await expectReject(async () => {
      await statsService.getStyle(
        notCalled,
        {
          ...passStyleStatsValidation(filter, {
            property: 'std_dev',
            direction: 'desc',
          }),
          order: () => ({
            errorCode: 'invalid-style-stats-query',
            result: undefined,
          }),
        },
        defaultOrderedStatsQuery,
        log,
      )
    }, invalidStyleStatsQueryError)
  })
})

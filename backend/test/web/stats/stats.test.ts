import { describe, it, before, beforeEach, after, afterEach } from 'node:test'

import { TestContext } from '../test-context'
import type { BeerWithBreweryAndStyleIds } from '../../../src/core/beer/beer'
import type { Brewery } from '../../../src/core/brewery/brewery'
import type { Location } from '../../../src/core/location/location'
import type {
  AnnualContainerStats,
  AnnualStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StyleStats
} from '../../../src/core/stats/stats'
import type { Style } from '../../../src/core/style/style'
import type { CreateReviewRequest } from '../../../src/core/review/review'
import { assertDeepEqual, assertEqual } from '../../assert'

interface ReviewRes {
  id: string
  additionalInfo: string
  beer: string
  container: string
  location: string
  rating: number
  time: string
  smell: string
  taste: string
}

// Math is hard. By both hard coding and calculating it is easier to spot an
// error when it happens.
describe('stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post<{ style: Style }>(`/api/v1/style`,
      { name: 'Kriek', parents: [] },
      adminAuthHeaders
    )
    assertEqual(styleRes.status, 201)

    const breweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    assertEqual(breweryRes.status, 201)

    const beerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'Lindemans Kriek',
        breweries: [ breweryRes.data.brewery.id ],
        styles: [styleRes.data.style.id]
      },
      adminAuthHeaders
    )
    assertEqual(beerRes.status, 201)

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )
    assertEqual(containerRes.status, 201)

    const locationRes = await ctx.request.post<{ location: Location }>(`/api/v1/location`,
      { name: 'Kuja' },
      adminAuthHeaders
    )
    assertEqual(locationRes.status, 201)

    const otherLocationRes = await ctx.request.post<
      { location: Location }
    >(`/api/v1/location`,
      { name: 'Oluthuone' },
      adminAuthHeaders
    )
    assertEqual(otherLocationRes.status, 201)

    const createRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: beerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 5,
      smell: 'Cherries',
      taste: 'Cherries, a little sour',
      time: '2021-03-07T18:31:33.123Z'
    }
    const reviewRes = await ctx.request.post<{ review: ReviewRes }>(`/api/v1/review`,
      createRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(reviewRes.status, 201)

    const otherStyleRes = await ctx.request.post<{ style: Style }>(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherStyleRes.status, 201)

    const otherBreweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherBreweryRes.status, 201)

    const otherBeerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'IPA',
        breweries: [otherBreweryRes.data.brewery.id],
        styles: [otherStyleRes.data.style.id]
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(otherBeerRes.status, 201)

    const createReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: otherBeerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: otherLocationRes.data.location.id,
      rating: 7,
      smell: 'Grapefruit',
      taste: 'Bitter',
      time: '2022-03-08T18:31:33.123Z'
    }
    const otherReviewRes = await ctx.request.post<{ review: ReviewRes }>(`/api/v1/review`,
      createReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(otherReviewRes.status, 201)

    const collabBeerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'Wild Kriek IPA',
        breweries: [
          breweryRes.data.brewery.id,
          otherBreweryRes.data.brewery.id
        ],
        styles: [
          styleRes.data.style.id,
          otherStyleRes.data.style.id
        ]
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(collabBeerRes.status, 201)

    const collabReviewRequest: CreateReviewRequest = {
      additionalInfo: '',
      beer: collabBeerRes.data.beer.id,
      container: containerRes.data.container.id,
      location: locationRes.data.location.id,
      rating: 8,
      smell: 'Grapefruit, cherries',
      taste: 'Bitter, sour',
      time: '2023-03-09T18:31:33.123Z'
    }
    const collabReviewRes = await ctx.request.post<{ review: ReviewRes }>(`/api/v1/review`,
      collabReviewRequest,
      ctx.adminAuthHeaders()
    )
    assertEqual(collabReviewRes.status, 201)

    const collabReview2Res = await ctx.request.post<{ review: ReviewRes }>(`/api/v1/review`,
      {
        additionalInfo: 'Another one was not quite as good',
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: otherLocationRes.data.location.id,
        rating: 7,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-10T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    assertEqual(collabReview2Res.status, 201)

    return {
      beers: [
        beerRes.data.beer,
        collabBeerRes.data.beer,
        otherBeerRes.data.beer
      ],
      breweries: [
        breweryRes,
        otherBreweryRes
      ],
      locations: [
        locationRes,
        otherLocationRes
      ],
      reviews: [
        collabReviewRes.data.review,
        collabReview2Res.data.review,
        reviewRes.data.review,
        otherReviewRes.data.review
      ],
      containers: [containerRes],
      styles: [
        styleRes,
        otherStyleRes
      ]
    }
  }

  function error() {
    return new Error('must not happen')
  }

  it('get overall stats', async () => {
    const {
      beers,
      breweries,
      reviews,
      containers,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ overall: OverallStats }>(
      '/api/v1/stats/overall',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    assertEqual(statsRes.data.overall.beerCount, `${beers.length}`)
    assertEqual(beers.length, 3)
    assertEqual(statsRes.data.overall.breweryCount, `${breweries.length}`)
    assertEqual(breweries.length, 2)
    assertEqual(statsRes.data.overall.containerCount, `${containers.length}`)
    assertEqual(containers.length, 1)
    assertEqual(statsRes.data.overall.reviewCount, `${reviews.length}`)
    assertEqual(reviews.length, 4)
    assertEqual(statsRes.data.overall.distinctBeerReviewCount, `${beers.length}`)
    const ratings = reviews
      .filter(r => r)
      .map(r => r.rating)
    const ratingSum = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / reviews.length
    assertEqual(statsRes.data.overall.reviewAverage, countedAverage.toFixed(2))
    assertEqual(countedAverage, 6.75)
    assertEqual(statsRes.data.overall.styleCount, `${styles.length}`)
    assertEqual(styles.length, 2)
  })

  it('get overall stats by brewery', async () => {
    const {
      beers,
      breweries,
      reviews,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ overall: OverallStats }>(
      `/api/v1/stats/overall?brewery=${breweryId}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    assertEqual(statsRes.data.overall.beerCount, '2')
    assertEqual(statsRes.data.overall.breweryCount, '2')
    assertEqual(statsRes.data.overall.containerCount, '1')
    assertEqual(statsRes.data.overall.reviewCount, '3')
    const ratings = reviews
      .filter((review: ReviewRes) => {
        const beerId = review.beer
        const beer = beers.find(beer => beer.id === beerId)
        if (beer === undefined) {
          return false
        }
        return beer.breweries.includes(breweryId)
      })
      .map(r => r.rating)
    const ratingSum = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / ratings.length
    assertEqual(statsRes.data.overall.reviewAverage, countedAverage.toFixed(2))
    assertEqual(countedAverage, 6 + 2/3)
    assertEqual(statsRes.data.overall.styleCount, '2')
    assertEqual(styles.length, 2)
  })

  function average(ratings: number[]): string {
    if (ratings.length === 0) {
      const zero = 0
      return zero.toFixed(2)
    }
    const sumReducer = (sum: number, rating: number) => sum + rating
    return (ratings.reduce(sumReducer, 0) / ratings.length).toFixed(2)
  }

  interface Annual {
    count: number,
    average: string
  }

  function checkAnnualStats (
    reviewRatingsByYear: (year: string) => number[],
    annualStats: AnnualStats,
    expectedAnnual: Annual[]
  ): void {
    const annual = ['2021', '2022', '2023'].map(year => {
      const ratings = reviewRatingsByYear(year)
      return {
        ratings,
        average: average(ratings),
        count: ratings.length,
        year
      }
    })

    function stat (count: number, average: string, year: string) {
      return {
        reviewCount: `${count}`,
        reviewAverage: average,
        year
      }
    }

    assertDeepEqual(annualStats, annual.filter(a => a.count > 0).map(
      annual => stat(annual.count, annual.average, annual.year)
    ))

    assertDeepEqual(annual.map(
      annual => ({ average: annual.average, count: annual.count })
    ), expectedAnnual)
  }

  it('get annual stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      '/api/v1/stats/annual',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviews.filter((review: ReviewRes) => {
        return review.time.startsWith(year)
      }).map((review: ReviewRes) => review.rating)
    }
    checkAnnualStats(reviewRatingsByYear, statsRes.data.annual, [
      {
        count: 1,
        average: '5.00'
      },
      {
        count: 1,
        average: '7.00'
      },
      {
        count: 2,
        average: '7.50'
      }
    ])
  })

  function reviewsByYear (reviews: ReviewRes[], year: string) {
    return reviews.filter((review: ReviewRes) => {
      return review.time.startsWith(year)
    })
  }

  function reviewsByBrewery (
    reviews: ReviewRes[],
    beers: BeerWithBreweryAndStyleIds[],
    breweryId: string
  ): ReviewRes[] {
    return reviews.filter((review: ReviewRes) => {
      const beerId = review.beer
      const beer = beers.find(beer => beer.id === beerId)
      if (beer === undefined) {
        return false
      }
      return beer.breweries.includes(breweryId)
    })
  }

  it('get annual stats by brewery', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      `/api/v1/stats/annual?brewery=${breweryId}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviewsByBrewery(reviewsByYear(reviews, year), beers, breweryId)
        .map((review: ReviewRes) => review.rating)
    }
    checkAnnualStats(reviewRatingsByYear, statsRes.data.annual, [
      {
        count: 1,
        average: '5.00'
      },
      {
        count: 0,
        average: '0.00'
      },
      {
        count: 2,
        average: '7.50'
      }
    ])
  })

  it('get annual container stats', async () => {
    const { containers, reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>(
      '/api/v1/stats/annual_container',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string) {
      return reviewsByYear(reviews, year).map((review: ReviewRes) => review.rating)
    }
    const container = containers[0].data.container
    const years = ['2023', '2022', '2021']
    assertDeepEqual(statsRes.data.annualContainer,
      years.map(year => {
        const ratings = reviewRatingsByYear(year)
        return {
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          reviewAverage: `${average(ratings)}`,
          reviewCount: `${ratings.length}`,
          year
        }
      })
    )
  })

  it('get annual container stats with pagination', async () => {
    const { containers, reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>(
      '/api/v1/stats/annual_container?size=1&skip=1',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string) {
      return reviewsByYear(reviews, year).map((review: ReviewRes) => review.rating)
    }
    const container = containers[0].data.container
    const years = ['2022']
    assertDeepEqual(statsRes.data.annualContainer,
      years.map(year => {
        const ratings = reviewRatingsByYear(year)
        return {
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          reviewAverage: `${average(ratings)}`,
          reviewCount: `${ratings.length}`,
          year
        }
      })
    )
  })

  it('get annual container stats by brewery', async () => {
    const {
      beers,
      breweries,
      containers,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())
    const brewery = breweries[0].data.brewery

    const statsRes = await ctx.request.get<{
      annualContainer: AnnualContainerStats
    }>(
      `/api/v1/stats/annual_container?brewery=${brewery.id}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    function reviewRatingsByYear(year: string): number[] {
      return reviewsByBrewery(reviewsByYear(reviews, year), beers, brewery.id)
        .map((review: ReviewRes) => review.rating)
    }
    const container = containers[0].data.container
    const years = ['2023', '2022', '2021']
    assertDeepEqual(statsRes.data.annualContainer,
      years.map(year => {
        const ratings = reviewRatingsByYear(year)
        return {
          containerId: container.id,
          containerSize: container.size,
          containerType: container.type,
          reviewAverage: `${average(ratings)}`,
          reviewCount: `${ratings.length}`,
          year
        }
      }).filter(stats => stats.reviewCount !== '0')
    )
  })

  it('get container stats', async () => {
    const { containers, reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ container: ContainerStats }>(
      '/api/v1/stats/container',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const container = containers[0].data.container
    assertDeepEqual(statsRes.data.container, [
      {
        reviewAverage: `${
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        }`,
        reviewCount: `${reviews.length}`,
        containerId: container.id,
        containerSize: container.size,
        containerType: container.type
      }
    ])
  })

  it('get container stats by brewery', async () => {
    const {
      breweries,
      beers,
      containers,
      reviews: allReviews
    } = await createDeps(ctx.adminAuthHeaders())
    const breweryId = breweries[0].data.brewery.id

    const statsRes = await ctx.request.get<{ container: ContainerStats }>(
      `/api/v1/stats/container?brewery=${breweryId}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const container = containers[0].data.container
    const breweryBeers = beers.filter(
      b => b.breweries.includes(breweryId)
    ).map(b => b.id)
    const reviews = allReviews.filter(r => breweryBeers.includes(r.beer))
    assertDeepEqual(statsRes.data.container, [
      {
        reviewAverage: (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(2),
        reviewCount: `${reviews.length}`,
        containerId: container.id,
        containerSize: container.size,
        containerType: container.type
      }
    ])
  })

  interface BreweryStatsData {
    brewery: Brewery,
    count: number,
    average: string
  }

  function checkBreweryStats (
    nokia: BreweryStatsData,
    lindemans: BreweryStatsData,
    reviewRatingsByBrewery: (id: string) => number[],
    breweryStats: BreweryStats
  ): void {
    const nokiaRatings = reviewRatingsByBrewery(nokia.brewery.id)
    const nokiaAverage = average(nokiaRatings)
    const lindemansRatings = reviewRatingsByBrewery(lindemans.brewery.id)
    const lindemansAverage = average(lindemansRatings)
    assertDeepEqual(breweryStats, [
      {
        reviewCount: `${nokiaRatings.length}`,
        reviewAverage: nokiaAverage,
        breweryId: nokia.brewery.id,
        breweryName: nokia.brewery.name
      },
      {
        reviewCount: `${lindemansRatings.length}`,
        reviewAverage: lindemansAverage,
        breweryId: lindemans.brewery.id,
        breweryName: lindemans.brewery.name
      }
    ])
    assertEqual(nokiaRatings.length, nokia.count)
    assertEqual(nokiaAverage, nokia.average)
    assertEqual(lindemansRatings.length, lindemans.count)
    assertEqual(lindemansAverage, lindemans.average)
  }

  function reviewRatingsByBrewery(
    breweryId: string,
    beers: BeerWithBreweryAndStyleIds[],
    reviews: ReviewRes[],
    filterBreweryId: string
  ): number[] {
    return reviews.filter(review => {
      const beer = beers.find(beer => beer.id === review.beer)
      if (beer === undefined) throw error()
      return beer.breweries.some(brewery => brewery === breweryId) &&
        beer.breweries.some(brewery => brewery === filterBreweryId)
    }).map(review => review.rating)
  }

  it('get brewery stats', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const skippedStatsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?size=30&skip=20',
      ctx.adminAuthHeaders()
    )
    assertEqual(skippedStatsRes.status, 200)
    assertDeepEqual(skippedStatsRes.data.brewery, [])

    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?order=average&direction=desc',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const lindemansBrewery = breweries[0].data.brewery
    assertEqual(lindemansBrewery.name, 'Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    assertEqual(nokiaBrewery.name, 'Nokian Panimo')
    function filter(breweryId: string): number[] {
      return reviewRatingsByBrewery(breweryId, beers, reviews, breweryId)
    }
    checkBreweryStats(
      { brewery: nokiaBrewery, count: 3, average: '7.33' },
      { brewery: lindemansBrewery, count: 3, average: '6.67' },
      filter,
      statsRes.data.brewery
    )
  })

  it('get brewery stats by brewery', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const filterBreweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      `/api/v1/stats/brewery?brewery=${filterBreweryId}${order}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const lindemansBrewery = breweries[0].data.brewery
    assertEqual(lindemansBrewery.name, 'Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    assertEqual(nokiaBrewery.name, 'Nokian Panimo')
    function filter(breweryId: string): number[] {
      return reviewRatingsByBrewery(breweryId, beers, reviews, filterBreweryId)
    }
    checkBreweryStats(
      { brewery: nokiaBrewery, count: 2, average: '7.50' },
      { brewery: lindemansBrewery, count: 3, average: '6.67' },
      filter,
      statsRes.data.brewery
    )
  })

  interface LocationStatsData {
    location: Location,
    count: number,
    average: string
  }

  function checkLocationStats (
    kuja: LocationStatsData,
    oluthuone: LocationStatsData,
    reviewRatingsByLocation: (id: string) => number[],
    locationStats: LocationStats
  ): void {
    const kujaRatings = reviewRatingsByLocation(kuja.location.id)
    const kujaAverage = average(kujaRatings)
    const oluthuoneRatings = reviewRatingsByLocation(oluthuone.location.id)
    const oluthuoneAverage = average(oluthuoneRatings)
    assertDeepEqual(locationStats, [
      {
        reviewCount: `${kujaRatings.length}`,
        reviewAverage: kujaAverage,
        locationId: kuja.location.id,
        locationName: kuja.location.name
      },
      {
        reviewCount: `${oluthuoneRatings.length}`,
        reviewAverage: oluthuoneAverage,
        locationId: oluthuone.location.id,
        locationName: oluthuone.location.name
      }
    ])
    assertEqual(kujaRatings.length, kuja.count)
    assertEqual(kujaAverage, kuja.average)
    assertEqual(oluthuoneRatings.length, oluthuone.count)
    assertEqual(oluthuoneAverage, oluthuone.average)
  }

  function reviewRatingsByLocation(
      locationId: string,
      beers: BeerWithBreweryAndStyleIds[],
      reviews: ReviewRes[],
      filterBreweryId: string | undefined
    ): number[] {
    return reviews.filter(review => {
      if (review.location !== locationId) {
        return false;
      }
      const beer = beers.find(beer => beer.id === review.beer)
      if (beer === undefined) throw error()
      return beer.breweries.some(
        brewery => filterBreweryId === undefined || brewery === filterBreweryId)
    }).map(review => review.rating)
  }

  it('get location stats', async () => {
    const {
      beers,
      locations,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const skippedStatsRes = await ctx.request.get<{ location: LocationStats }>(
      '/api/v1/stats/location?size=30&skip=20',
      ctx.adminAuthHeaders()
    )
    assertEqual(skippedStatsRes.status, 200)
    assertDeepEqual(skippedStatsRes.data.location, [])

    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      '/api/v1/stats/location?order=average&direction=asc',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const oluthuoneLocation = locations[1].data.location
    assertEqual(oluthuoneLocation.name, 'Oluthuone')
    function filter(locationId: string): number[] {
      return reviewRatingsByLocation(locationId, beers, reviews, undefined)
    }
    checkLocationStats(
      { location: kujaLocation, count: 2, average: '6.50' },
      { location: oluthuoneLocation, count: 2, average: '7.00' },
      filter,
      statsRes.data.location
    )
  })

  it('get location stats by brewery', async () => {
    const {
      beers,
      breweries,
      locations,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const filterBreweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=desc'
    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      `/api/v1/stats/location?brewery=${filterBreweryId}${order}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const oluthuoneLocation = locations[1].data.location
    assertEqual(oluthuoneLocation.name, 'Oluthuone')
    function filter(locationId: string): number[] {
      return reviewRatingsByLocation(locationId, beers, reviews, filterBreweryId)
    }
    checkLocationStats(
      { location: kujaLocation, count: 2, average: '6.50' },
      { location: oluthuoneLocation, count: 1, average: '7.00' },
      filter,
      statsRes.data.location
    )
  })

  it('get location stats by location', async () => {
    const {
      beers,
      locations,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const kujaLocation = locations[0].data.location
    assertEqual(kujaLocation.name, 'Kuja')
    const order = '&order=count&direction=desc'
    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      `/api/v1/stats/location?location=${kujaLocation.id}${order}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kujaRatings =
      reviewRatingsByLocation(kujaLocation.id, beers, reviews, undefined)
    const kujaAverage = average(kujaRatings)
    assertDeepEqual(statsRes.data.location, [
      {
        reviewCount: `${kujaRatings.length}`,
        reviewAverage: kujaAverage,
        locationId: kujaLocation.id,
        locationName: kujaLocation.name
      }
    ])
    assertEqual(kujaRatings.length, 2)
    assertEqual(kujaAverage, '6.50')
  })

  type TestRatingStats = Array<{ rating: number,  count: number }>

  function checkRatingStats (
    stats: TestRatingStats,
    actualStats: RatingStats,
    expectedStats: RatingStats
  ): void {
    stats.sort((a, b) => a.rating - b.rating)
    const convertedStats = stats.map(s => ({
      rating: `${s.rating}`,
      count: `${s.count}`
    }))
    assertDeepEqual(actualStats, convertedStats)
    assertDeepEqual(actualStats, expectedStats)
  }

  it('get rating stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      '/api/v1/stats/rating',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const stats = reviews
      .reduce((ratingStats: TestRatingStats, review) => {
      const rating = review.rating
      const existing = ratingStats.find(r => r.rating === rating)
      if (existing === undefined) {
        ratingStats.push({ rating, count: 1 })
        return ratingStats
      }
      existing.count++
      return ratingStats
    }, [])
    const expectedStats = [
      { rating: '5', count: '1' },
      { rating: '7', count: '2' },
      { rating: '8', count: '1' }
    ]
    checkRatingStats(stats, statsRes.data.rating, expectedStats)
  })

  it('get rating stats by brewery', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const breweryId = breweries[0].data.brewery.id
    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      `/api/v1/stats/rating?brewery=${breweryId}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const stats = reviews
      .reduce((ratingStats: Array<{ rating: number,  count: number }>, review) => {
      const beerId = review.beer
      const beerRes = beers.find(beer => beer.id === beerId)
      if (beerRes === undefined) {
        return ratingStats
      }
      if (!beerRes.breweries.includes(breweryId)) {
        return ratingStats
      }
      const rating = review.rating
      const existing = ratingStats.find(r => r.rating === rating)
      if (existing === undefined) {
        ratingStats.push({ rating, count: 1 })
        return ratingStats
      }
      existing.count++
      return ratingStats
    }, [])
    const expectedStats = [
      { rating: '5', count: '1' },
      { rating: '7', count: '1' },
      { rating: '8', count: '1' }
    ]
    checkRatingStats(stats, statsRes.data.rating, expectedStats)
  })

  interface StyleStatData {
    ratings: number[],
    style: Style,
    average: string,
    count: number
  }

  function checkStyleStats (
    ipa: StyleStatData,
    kriek: StyleStatData,
    styleStats: StyleStats
  ) {
    const ipaAverage = average(ipa.ratings)
    const kriekAverage = average(kriek.ratings)
    assertDeepEqual(styleStats, [
      {
        reviewCount: `${ipa.ratings.length}`,
        reviewAverage: ipa.average,
        styleId: ipa.style.id,
        styleName: ipa.style.name
      },
      {
        reviewCount: `${kriek.ratings.length}`,
        reviewAverage: kriek.average,
        styleId: kriek.style.id,
        styleName: kriek.style.name
      }
    ])
    assertEqual(ipa.ratings.length, ipa.count)
    assertEqual(ipaAverage, ipa.average)
    assertEqual(kriek.ratings.length, kriek.count)
    assertEqual(kriekAverage, kriek.average)
  }

  function reviewRatingsByStyle(
      styleId: string,
      beers: BeerWithBreweryAndStyleIds[],
      reviews: ReviewRes[],
      filterBreweryId: string | undefined
    ): number[] {
    return reviews.filter(review => {
      const beer = beers.find(beer => beer.id === review.beer)
      if (beer === undefined) throw error()
      return beer.styles.some(style => style === styleId) &&
        beer.breweries.some(
          brewery => filterBreweryId === undefined || brewery === filterBreweryId)
    }).map(review => review.rating)
  }

  it('get style stats', async () => {
    const {
      beers,
      reviews,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      '/api/v1/stats/style?order=average&direction=desc',
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')
    const ipaRatings = reviewRatingsByStyle(ipaStyle.id, beers, reviews, undefined)
    const kriekRatings = reviewRatingsByStyle(kriekStyle.id, beers, reviews, undefined)
    checkStyleStats(
      {
        ratings: ipaRatings,
        style: ipaStyle,
        average: '7.33',
        count: 3
      },
      {
        ratings: kriekRatings,
        style: kriekStyle,
        average: '6.67',
        count: 3
      },
      statsRes.data.style
    )
  })

  it('get style stats by brewery', async () => {
    const {
      beers,
      breweries,
      reviews,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const breweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?brewery=${breweryId}${order}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')
    const ipaRatings = reviewRatingsByStyle(
      ipaStyle.id,
      beers,
      reviews,breweryId
    )
    const kriekRatings = reviewRatingsByStyle(
      kriekStyle.id,
      beers,
      reviews,
      breweryId
    )
    checkStyleStats(
      {
        ratings: ipaRatings,
        style: ipaStyle,
        average: '7.50',
        count: 2
      },
      {
        ratings: kriekRatings,
        style: kriekStyle,
        average: '6.67',
        count: 3
      },
      statsRes.data.style
    )
  })

  it('get style stats by brewery and min review count', async () => {
    const {
      beers,
      breweries,
      reviews,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const breweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?brewery=${breweryId}${order}&min_review_count=3`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')

    const kriekRatings = reviewRatingsByStyle(kriekStyle.id, beers, reviews, breweryId)
    const kriekAverage = average(kriekRatings)
    assertDeepEqual(statsRes.data.style, [
      {
        reviewCount: '3',
        reviewAverage: kriekAverage,
        styleId: kriekStyle.id,
        styleName: kriekStyle.name
      }
    ])
    assertEqual(kriekRatings.length, 3)
    assertEqual(kriekAverage, '6.67')
  })

  it('get style stats by style', async () => {
    const { styles } = await createDeps(ctx.adminAuthHeaders())

    const styleId = styles[0].data.style.id
    const order = '&order=average&direction=desc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?style=${styleId}${order}`,
      ctx.adminAuthHeaders()
    )
    assertEqual(statsRes.status, 200)
    const kriekStyle = styles[0].data.style
    assertEqual(kriekStyle.name, 'Kriek')
    const ipaStyle = styles[1].data.style
    assertEqual(ipaStyle.name, 'IPA')

    assertDeepEqual(statsRes.data.style, [
      {
        // Collab reviews only.
        reviewCount: '2',
        reviewAverage: '7.50',
        styleId: ipaStyle.id,
        styleName: ipaStyle.name
      },
      {
        reviewCount: '3',
        reviewAverage: '6.67',
        styleId: kriekStyle.id,
        styleName: kriekStyle.name
      }
    ])
  })
})

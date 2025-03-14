import { expect } from 'earl'

import { TestContext } from '../test-context'
import type { BeerWithBreweryAndStyleIds } from '../../../src/core/beer/beer'
import type { Brewery } from '../../../src/core/brewery/brewery'
import type { Location } from '../../../src/core/location/location'
import type { Review } from '../../../src/core/review/review'
import type {
  AnnualStats,
  BreweryStats,
  ContainerStats,
  LocationStats,
  OverallStats,
  RatingStats,
  StyleStats
} from '../../../src/core/stats/stats'
import type { Style } from '../../../src/core/style/style'

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
    expect(styleRes.status).toEqual(201)

    const breweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).toEqual(201)

    const beerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'Lindemans Kriek',
        breweries: [ breweryRes.data.brewery.id ],
        styles: [styleRes.data.style.id]
      },
      adminAuthHeaders
    )
    expect(beerRes.status).toEqual(201)

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )
    expect(containerRes.status).toEqual(201)

    const locationRes = await ctx.request.post<{ location: Location }>(`/api/v1/location`,
      { name: 'Kuja' },
      adminAuthHeaders
    )
    expect(locationRes.status).toEqual(201)

    const otherLocationRes = await ctx.request.post<
      { location: Location }
    >(`/api/v1/location`,
      { name: 'Oluthuone' },
      adminAuthHeaders
    )
    expect(otherLocationRes.status).toEqual(201)

    const reviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: locationRes.data.location.id,
        rating: 5,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2021-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).toEqual(201)

    const otherStyleRes = await ctx.request.post<{ style: Style }>(`/api/v1/style`,
      { name: 'IPA', parents: [] },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).toEqual(201)

    const otherBreweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).toEqual(201)

    const otherBeerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'IPA',
        breweries: [otherBreweryRes.data.brewery.id],
        styles: [otherStyleRes.data.style.id]
      },
      ctx.adminAuthHeaders()
    )
    expect(otherBeerRes.status).toEqual(201)

    const otherReviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: otherBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: otherLocationRes.data.location.id,
        rating: 7,
        smell: 'Grapefruit',
        taste: 'Bitter',
        time: '2022-03-08T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(otherReviewRes.status).toEqual(201)

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
    expect(collabBeerRes.status).toEqual(201)

    const collabReviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        location: locationRes.data.location.id,
        rating: 8,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-09T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(collabReviewRes.status).toEqual(201)

    const collabReview2Res = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
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
    expect(collabReview2Res.status).toEqual(201)

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
    expect(statsRes.status).toEqual(200)
    expect(statsRes.data.overall.beerCount).toEqual(`${beers.length}`)
    expect(beers.length).toEqual(3)
    expect(statsRes.data.overall.breweryCount).toEqual(`${breweries.length}`)
    expect(breweries.length).toEqual(2)
    expect(statsRes.data.overall.containerCount).toEqual(`${containers.length}`)
    expect(containers.length).toEqual(1)
    expect(statsRes.data.overall.reviewCount).toEqual(`${reviews.length}`)
    expect(reviews.length).toEqual(4)
    expect(statsRes.data.overall.distinctBeerReviewCount)
      .toEqual(`${beers.length}`)
    const ratings = reviews
      .filter(r => r)
      .map(r => r.rating) as number[]
    const ratingSum = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / reviews.length
    expect(statsRes.data.overall.reviewAverage).toEqual(countedAverage.toFixed(2))
    expect(countedAverage).toEqual(6.75)
    expect(statsRes.data.overall.styleCount).toEqual(`${styles.length}`)
    expect(styles.length).toEqual(2)
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
    expect(statsRes.status).toEqual(200)
    expect(statsRes.data.overall.beerCount).toEqual('2')
    expect(statsRes.data.overall.breweryCount).toEqual('2')
    expect(statsRes.data.overall.containerCount).toEqual('1')
    expect(statsRes.data.overall.reviewCount).toEqual('3')
    const ratings = reviews
      .filter((review: Review) => {
        const beerId = review.beer
        const beer = beers.find(beer => beer.id === beerId)
        if (beer === undefined) {
          return false
        }
        return beer.breweries.includes(breweryId)
      })
      .map(r => r.rating) as number[]
    const ratingSum = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / ratings.length
    expect(statsRes.data.overall.reviewAverage).toEqual(countedAverage.toFixed(2))
    expect(countedAverage).toEqual(6 + 2/3)
    expect(statsRes.data.overall.styleCount).toEqual('2')
    expect(styles.length).toEqual(2)
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

    expect(annualStats).toEqual(annual.filter(a => a.count > 0).map(
      annual => stat(annual.count, annual.average, annual.year)
    ))

    expect(annual.map(
      annual => ({ average: annual.average, count: annual.count })
    )).toEqual(expectedAnnual)
  }

  it('get annual stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      '/api/v1/stats/annual',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    function reviewRatingsByYear(year: string): number[] {
      return reviews.filter((review: any) => {
        if (typeof review?.time !== 'string') throw error()
        return (review.time as unknown as string).startsWith(year)
      }).map((review: Review) => review.rating) as number[]
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
    expect(statsRes.status).toEqual(200)
    function reviewRatingsByYear(year: string): number[] {
      return reviews.filter((review: any) => {
        if (typeof review?.time !== 'string') throw error()
        return (review.time as unknown as string).startsWith(year)
      }).filter((review: Review) => {
        const beerId = review.beer
        const beer = beers.find(beer => beer.id === beerId)
        if (beer === undefined) {
          return false
        }
        return beer.breweries.includes(breweryId)
      }).map((review: Review) => review.rating) as number[]
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

  it('get container stats', async () => {
    const { containers, reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ container: ContainerStats }>(
      '/api/v1/stats/container',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const container = containers[0].data.container
    expect(statsRes.data.container).toEqual([
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
    expect(statsRes.status).toEqual(200)
    const container = containers[0].data.container
    const breweryBeers = beers.filter(
      b => b.breweries.includes(breweryId)
    ).map(b => b.id)
    const reviews = allReviews.filter(r => breweryBeers.includes(r.beer))
    expect(statsRes.data.container).toEqual([
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
    expect(breweryStats).toEqual([
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
    expect(nokiaRatings.length).toEqual(nokia.count)
    expect(nokiaAverage).toEqual(nokia.average)
    expect(lindemansRatings.length).toEqual(lindemans.count)
    expect(lindemansAverage).toEqual(lindemans.average)
  }

  function reviewRatingsByBrewery(
    breweryId: string,
    beers: BeerWithBreweryAndStyleIds[],
    reviews: Review[],
    filterBreweryId: string
  ): number[] {
    return reviews.filter(review => {
      const beer = beers.find(beer => beer.id === review.beer)
      if (beer === undefined) throw error()
      return beer.breweries.some(brewery => brewery === breweryId) &&
        beer.breweries.some(brewery => brewery === filterBreweryId)
    }).map(review => review.rating) as number[]
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
    expect(skippedStatsRes.status).toEqual(200)
    expect(skippedStatsRes.data.brewery).toEqual([])

    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?order=average&direction=desc',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).toEqual('Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    expect(nokiaBrewery.name).toEqual('Nokian Panimo')
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
    expect(statsRes.status).toEqual(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).toEqual('Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    expect(nokiaBrewery.name).toEqual('Nokian Panimo')
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
    expect(locationStats).toEqual([
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
    expect(kujaRatings.length).toEqual(kuja.count)
    expect(kujaAverage).toEqual(kuja.average)
    expect(oluthuoneRatings.length).toEqual(oluthuone.count)
    expect(oluthuoneAverage).toEqual(oluthuone.average)
  }

  function reviewRatingsByLocation(
      locationId: string,
      beers: BeerWithBreweryAndStyleIds[],
      reviews: Review[],
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
    }).map(review => review.rating) as number[]
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
    expect(skippedStatsRes.status).toEqual(200)
    expect(skippedStatsRes.data.location).toEqual([])

    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      '/api/v1/stats/location?order=average&direction=asc',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const kujaLocation = locations[0].data.location
    expect(kujaLocation.name).toEqual('Kuja')
    const oluthuoneLocation = locations[1].data.location
    expect(oluthuoneLocation.name).toEqual('Oluthuone')
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
    expect(statsRes.status).toEqual(200)
    const kujaLocation = locations[0].data.location
    expect(kujaLocation.name).toEqual('Kuja')
    const oluthuoneLocation = locations[1].data.location
    expect(oluthuoneLocation.name).toEqual('Oluthuone')
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
    expect(kujaLocation.name).toEqual('Kuja')
    const order = '&order=count&direction=desc'
    const statsRes = await ctx.request.get<{ location: LocationStats }>(
      `/api/v1/stats/location?location=${kujaLocation.id}${order}`,
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const kujaRatings =
      reviewRatingsByLocation(kujaLocation.id, beers, reviews, undefined)
    const kujaAverage = average(kujaRatings)
    expect(statsRes.data.location).toEqual([
      {
        reviewCount: `${kujaRatings.length}`,
        reviewAverage: kujaAverage,
        locationId: kujaLocation.id,
        locationName: kujaLocation.name
      }
    ])
    expect(kujaRatings.length).toEqual(2)
    expect(kujaAverage).toEqual('6.50')
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
    expect(actualStats).toEqual(convertedStats)
    expect(actualStats).toEqual(expectedStats)
  }

  it('get rating stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      '/api/v1/stats/rating',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const stats = reviews
      .reduce((ratingStats: TestRatingStats, review) => {
      const rating = review.rating as unknown as number
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
    expect(statsRes.status).toEqual(200)
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
      const rating = review.rating as unknown as number
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
    expect(styleStats).toEqual([
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
    expect(ipa.ratings.length).toEqual(ipa.count)
    expect(ipaAverage).toEqual(ipa.average)
    expect(kriek.ratings.length).toEqual(kriek.count)
    expect(kriekAverage).toEqual(kriek.average)
  }

  function reviewRatingsByStyle(
      styleId: string,
      beers: BeerWithBreweryAndStyleIds[],
      reviews: Review[],
      filterBreweryId: string | undefined
    ): number[] {
    return reviews.filter(review => {
      const beer = beers.find(beer => beer.id === review.beer)
      if (beer === undefined) throw error()
      return beer.styles.some(style => style === styleId) &&
        beer.breweries.some(
          brewery => filterBreweryId === undefined || brewery === filterBreweryId)
    }).map(review => review.rating) as number[]
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
    expect(statsRes.status).toEqual(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).toEqual('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).toEqual('IPA')
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
    expect(statsRes.status).toEqual(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).toEqual('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).toEqual('IPA')
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
    expect(statsRes.status).toEqual(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).toEqual('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).toEqual('IPA')

    const kriekRatings = reviewRatingsByStyle(kriekStyle.id, beers, reviews, breweryId)
    const kriekAverage = average(kriekRatings)
    expect(statsRes.data.style).toEqual([
      {
        reviewCount: '3',
        reviewAverage: kriekAverage,
        styleId: kriekStyle.id,
        styleName: kriekStyle.name
      }
    ])
    expect(kriekRatings.length).toEqual(3)
    expect(kriekAverage).toEqual('6.67')
  })

  it('get style stats by style', async () => {
    const { styles } = await createDeps(ctx.adminAuthHeaders())

    const styleId = styles[0].data.style.id
    const order = '&order=average&direction=desc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?style=${styleId}${order}`,
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).toEqual(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).toEqual('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).toEqual('IPA')

    expect(statsRes.data.style).toEqual([
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

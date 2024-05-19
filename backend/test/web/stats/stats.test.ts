import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type BeerWithBreweryAndStyleIds } from '../../../src/core/beer/beer'
import { type Brewery } from '../../../src/core/brewery/brewery'
import { type Review } from '../../../src/core/review/review'
import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type RatingStats,
  type StyleStats
} from '../../../src/core/stats/stats'
import { type Style } from '../../../src/core/style/style'

// Math is hard. By both hard coding and calculating it should be easier to spot
// an error when it happens.
describe('stats tests', () => {
  const ctx = new TestContext()

  before(ctx.before)
  beforeEach(ctx.beforeEach)

  after(ctx.after)
  afterEach(ctx.afterEach)

  async function createDeps(adminAuthHeaders: Record<string, unknown>) {
    const styleRes = await ctx.request.post<{ style: Style }>(`/api/v1/style`,
      { name: 'Kriek' },
      adminAuthHeaders
    )
    expect(styleRes.status).to.equal(201)

    const breweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Lindemans' },
      adminAuthHeaders
    )
    expect(breweryRes.status).to.equal(201)

    const beerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'Lindemans Kriek',
        breweries: [ breweryRes.data.brewery.id ],
        styles: [styleRes.data.style.id]
      },
      adminAuthHeaders
    )
    expect(beerRes.status).to.equal(201)

    const containerRes = await ctx.request.post(`/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders
    )
    expect(containerRes.status).to.equal(201)

    const reviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: beerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 5,
        smell: 'Cherries',
        taste: 'Cherries, a little sour',
        time: '2021-03-07T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(reviewRes.status).to.equal(201)

    const otherStyleRes = await ctx.request.post<{ style: Style }>(`/api/v1/style`,
      { name: 'IPA' },
      ctx.adminAuthHeaders()
    )
    expect(otherStyleRes.status).to.equal(201)

    const otherBreweryRes = await ctx.request.post<{ brewery: Brewery }>(`/api/v1/brewery`,
      { name: 'Nokian Panimo' },
      ctx.adminAuthHeaders()
    )
    expect(otherBreweryRes.status).to.equal(201)

    const otherBeerRes = await ctx.request.post<{ beer: BeerWithBreweryAndStyleIds }>(`/api/v1/beer`,
      {
        name: 'IPA',
        breweries: [otherBreweryRes.data.brewery.id],
        styles: [otherStyleRes.data.style.id]
      },
      ctx.adminAuthHeaders()
    )
    expect(otherBeerRes.status).to.equal(201)

    const otherReviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: otherBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 7,
        smell: 'Grapefruit',
        taste: 'Bitter',
        time: '2022-03-08T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(otherReviewRes.status).to.equal(201)

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
    expect(collabBeerRes.status).to.equal(201)

    const collabReviewRes = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 8,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-09T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(collabReviewRes.status).to.equal(201)

    const collabReview2Res = await ctx.request.post<{ review: Review }>(`/api/v1/review`,
      {
        additionalInfo: 'Another one was not quite as good',
        beer: collabBeerRes.data.beer.id,
        container: containerRes.data.container.id,
        rating: 7,
        smell: 'Grapefruit, cherries',
        taste: 'Bitter, sour',
        time: '2023-03-10T18:31:33.123Z'
      },
      ctx.adminAuthHeaders()
    )
    expect(collabReview2Res.status).to.equal(201)

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

  it('should get overall stats', async () => {
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
    expect(statsRes.status).to.equal(200)
    expect(statsRes.data.overall.beerCount).to.equal(`${beers.length}`)
    expect(beers.length).to.equal(3)
    expect(statsRes.data.overall.breweryCount).to.equal(`${breweries.length}`)
    expect(breweries.length).to.equal(2)
    expect(statsRes.data.overall.containerCount).to.equal(`${containers.length}`)
    expect(containers.length).to.equal(1)
    expect(statsRes.data.overall.reviewCount).to.equal(`${reviews.length}`)
    expect(reviews.length).to.equal(4)
    expect(statsRes.data.overall.distinctBeerReviewCount)
      .to.equal(`${beers.length}`)
    const ratings = reviews
      .filter(r => r)
      .map(r => r.rating) as number[]
    const ratingSum = ratings.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / reviews.length
    expect(statsRes.data.overall.reviewAverage).to.equal(countedAverage.toFixed(2))
    expect(countedAverage).to.equal(6.75)
    expect(statsRes.data.overall.styleCount).to.equal(`${styles.length}`)
    expect(styles.length).to.equal(2)
  })

  it('should get overall stats by brewery', async () => {
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
    expect(statsRes.status).to.equal(200)
    expect(statsRes.data.overall.beerCount).to.equal('2')
    expect(statsRes.data.overall.breweryCount).to.equal('2')
    expect(statsRes.data.overall.containerCount).to.equal('1')
    expect(statsRes.data.overall.reviewCount).to.equal('3')
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
    expect(statsRes.data.overall.reviewAverage).to.equal(countedAverage.toFixed(2))
    expect(countedAverage).to.equal(6 + 2/3)
    expect(statsRes.data.overall.styleCount).to.equal('2')
    expect(styles.length).to.equal(2)
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
      if (count <= 0) return undefined
      return {
        reviewCount: `${count}`,
        reviewAverage: average,
        year
      }
    }

    expect(annualStats).to.eql(annual.map(
      annual => stat(annual.count, annual.average, annual.year)
    ).filter(stat => stat))

    expect(annual.map(
      annual => ({ average: annual.average, count: annual.count })
    )).eql(expectedAnnual)
  }

  it('should get annual stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      '/api/v1/stats/annual',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
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

  it('should get annual stats by brewery', async () => {
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
    expect(statsRes.status).to.equal(200)
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
    expect(breweryStats).to.eql([
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
    expect(nokiaRatings.length).to.equal(nokia.count)
    expect(nokiaAverage).to.equal(nokia.average)
    expect(lindemansRatings.length).to.equal(lindemans.count)
    expect(lindemansAverage).to.equal(lindemans.average)
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

  it('should get brewery stats', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const skippedStatsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?size=30&skip=20',
      ctx.adminAuthHeaders()
    )
    expect(skippedStatsRes.status).to.equal(200)
    expect(skippedStatsRes.data.brewery).to.eql([])

    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery?order=average&direction=desc',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).to.equal('Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    expect(nokiaBrewery.name).to.equal('Nokian Panimo')
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

  it('should get brewery stats by brewery', async () => {
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
    expect(statsRes.status).to.equal(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).to.equal('Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    expect(nokiaBrewery.name).to.equal('Nokian Panimo')
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

  it('should get brewery stats by brewery and min review count', async () => {
    const {
      beers,
      breweries,
      reviews
    } = await createDeps(ctx.adminAuthHeaders())

    const filterBreweryId = breweries[0].data.brewery.id
    const order = '&order=count&direction=asc'
    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      `/api/v1/stats/brewery?brewery=${
        filterBreweryId
      }${order}&min_review_count=3`,
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).to.equal('Lindemans')
    const lindemansRatings = reviewRatingsByBrewery(
      lindemansBrewery.id,
      beers,
      reviews,
      filterBreweryId
    )
    const lindemansAverage = average(lindemansRatings)
    expect(statsRes.data.brewery).to.eql([
      {
        reviewCount: `${lindemansRatings.length}`,
        reviewAverage: lindemansAverage,
        breweryId: lindemansBrewery.id,
        breweryName: lindemansBrewery.name
      }
    ])
    expect(lindemansRatings.length).to.equal(3)
    expect(lindemansAverage).to.equal('6.67')
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
    expect(actualStats).to.eql(convertedStats)
    expect(actualStats).to.eql(expectedStats)
  }

  it('should get rating stats', async () => {
    const { reviews } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ rating: RatingStats }>(
      '/api/v1/stats/rating',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
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

  it('should get rating stats by brewery', async () => {
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
    expect(statsRes.status).to.equal(200)
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
    expect(styleStats).to.eql([
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
    expect(ipa.ratings.length).to.equal(ipa.count)
    expect(ipaAverage).to.equal(ipa.average)
    expect(kriek.ratings.length).to.equal(kriek.count)
    expect(kriekAverage).to.equal(kriek.average)
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

  it('should get style stats', async () => {
    const {
      beers,
      reviews,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      '/api/v1/stats/style?order=average&direction=desc',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).to.equal('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).to.equal('IPA')
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

  it('should get style stats by brewery', async () => {
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
    expect(statsRes.status).to.equal(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).to.equal('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).to.equal('IPA')
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

  it('should get style stats by brewery and min review count', async () => {
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
    expect(statsRes.status).to.equal(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).to.equal('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).to.equal('IPA')

    const kriekRatings = reviewRatingsByStyle(kriekStyle.id, beers, reviews, breweryId)
    const kriekAverage = average(kriekRatings)
    expect(statsRes.data.style).to.eql([
      {
        reviewCount: '3',
        reviewAverage: kriekAverage,
        styleId: kriekStyle.id,
        styleName: kriekStyle.name
      }
    ])
    expect(kriekRatings.length).to.equal(3)
    expect(kriekAverage).to.equal('6.67')
  })

  it('should get style stats by style', async () => {
    const { styles } = await createDeps(ctx.adminAuthHeaders())

    const styleId = styles[0].data.style.id
    const order = '&order=average&direction=desc'
    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      `/api/v1/stats/style?style=${styleId}${order}`,
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).to.equal('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).to.equal('IPA')

    expect(statsRes.data.style).to.eql([
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

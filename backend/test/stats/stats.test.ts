import { expect } from 'chai'

import { TestContext } from '../test-context'
import { type BeerWithBreweryAndStyleIds } from '../../src/beer/beer'
import { type Brewery } from '../../src/brewery/brewery'
import { type Review } from '../../src/review/review'
import {
  type AnnualStats,
  type BreweryStats,
  type OverallStats,
  type StyleStats
} from '../../src/stats/stats'
import { type Style } from '../../src/style/style'
import { AxiosResponse } from 'axios'

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
        beerRes,
        collabBeerRes,
        otherBeerRes
      ],
      breweries: [
        breweryRes,
        otherBreweryRes
      ],
      reviews: [
        collabReviewRes,
        collabReview2Res,
        reviewRes,
        otherReviewRes
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
    expect(statsRes.data.overall.containerCount).to.equal(`${containers.length}`)
    expect(containers.length).to.equal(1)
    expect(statsRes.data.overall.reviewCount).to.equal(`${reviews.length}`)
    expect(reviews.length).to.equal(4)
    const ratings = reviews
      ?.map(r => {
        const value = r?.data?.review?.rating
        if (value === undefined || value === null) throw error()
        return value
      })
    if (ratings === null || ratings === undefined) {
      throw error()
    }
    const ratingSum = ratings?.reduce((sum: number, rating: number) => sum + rating, 0)
    const countedAverage = ratingSum / reviews.length
    expect(statsRes.data.overall.reviewAverage).to.equal(countedAverage.toFixed(2))
    expect(countedAverage).to.equal(6.75)
    expect(statsRes.data.overall.styleCount).to.equal(`${styles.length}`)
    expect(styles.length).to.equal(2)
  })

  function reviewData(reviewRes: any): Review {
    if (reviewRes?.data?.review === undefined) throw error()
    return reviewRes.data.review
  }
  function average(ratings: number[]): string {
    const sumReducer = (sum: number, rating: number) => sum + rating
    return (ratings.reduce(sumReducer, 0) / ratings.length).toFixed(2)
  }

  it('should get annual stats', async () => {
    const {
      beers,
      breweries,
      reviews,
      containers,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ annual: AnnualStats }>(
      '/api/v1/stats/annual',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    function reviewRatingsByYear(year: string): number[] {
      return reviews.map(reviewData).filter((review: any) => {
        if (typeof review?.time !== 'string') throw error()
        return (review.time as unknown as string).startsWith(year)
      }).map((review: Review) => review.rating) as number[]
    }
    const year2021Ratings = reviewRatingsByYear('2021');
    const count2021 = year2021Ratings.length
    const average2021 = average(year2021Ratings)
    const year2022Ratings = reviewRatingsByYear('2022');
    const count2022 = year2022Ratings.length
    const average2022 = average(year2022Ratings)
    const year2023Ratings = reviewRatingsByYear('2023');
    const count2023 = year2023Ratings.length
    const average2023 = average(year2023Ratings)

    expect(statsRes.data.annual).to.eql([
      { reviewCount: `${count2021}`, reviewAverage: average2021, year: '2021' },
      { reviewCount: `${count2022}`, reviewAverage: average2022, year: '2022' },
      { reviewCount: `${count2023}`, reviewAverage: average2023, year: '2023' }
    ])
    expect(count2021).to.eql(1)
    expect(average2021).to.eql('5.00')
    expect(count2022).to.eql(1)
    expect(average2022).to.eql('7.00')
    expect(count2023).to.eql(2)
    expect(average2023).to.eql('7.50')
  })

  it('should get brewery stats', async () => {
    const {
      beers,
      breweries,
      reviews,
      containers,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ brewery: BreweryStats }>(
      '/api/v1/stats/brewery',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const lindemansBrewery = breweries[0].data.brewery
    expect(lindemansBrewery.name).to.equal('Lindemans')
    const nokiaBrewery = breweries[1].data.brewery
    expect(nokiaBrewery.name).to.equal('Nokian Panimo')
    function reviewRatingsByBrewery(breweryId: string): number[] {
      return reviews.map(reviewData).filter(review => {
        const beer = beers.find(
          beer => beer.data.beer.id === review.beer
        )?.data?.beer
        if (beer === undefined) throw error()
        return beer.breweries.some(brewery => brewery === breweryId)
      }).map(review => review.rating) as number[]
    }
    const nokiaRatings = reviewRatingsByBrewery(nokiaBrewery.id)
    const nokiaAverage = average(nokiaRatings)
    const lindemansRatings = reviewRatingsByBrewery(lindemansBrewery.id)
    const lindemansAverage = average(lindemansRatings)
    expect(statsRes.data.brewery).to.eql([
      {
        reviewCount: `${lindemansRatings.length}`,
        reviewAverage: lindemansAverage,
        breweryId: lindemansBrewery.id,
        breweryName: lindemansBrewery.name
      },
      {
        reviewCount: `${nokiaRatings.length}`,
        reviewAverage: nokiaAverage,
        breweryId: nokiaBrewery.id,
        breweryName: nokiaBrewery.name
      }
    ])
    expect(nokiaRatings.length).to.equal(3)
    expect(nokiaAverage).to.equal('7.33')
    expect(lindemansRatings.length).to.equal(3)
    expect(lindemansAverage).to.equal('6.67')
  })

  it('should get style stats', async () => {
    const {
      beers,
      breweries,
      reviews,
      containers,
      styles
    } = await createDeps(ctx.adminAuthHeaders())

    const statsRes = await ctx.request.get<{ style: StyleStats }>(
      '/api/v1/stats/style',
      ctx.adminAuthHeaders()
    )
    expect(statsRes.status).to.equal(200)
    const kriekStyle = styles[0].data.style
    expect(kriekStyle.name).to.equal('Kriek')
    const ipaStyle = styles[1].data.style
    expect(ipaStyle.name).to.equal('IPA')
    function reviewRatingsByStyle(styleId: string): number[] {
      return reviews.map(reviewData).filter(review => {
        const beer = beers.find(
          beer => beer.data.beer.id === review.beer
        )?.data?.beer
        if (beer === undefined) throw error()
        return beer.styles.some(style => style === styleId)
      }).map(review => review.rating) as number[]
    }
    const ipaRatings = reviewRatingsByStyle(ipaStyle.id)
    const ipaAverage = average(ipaRatings)
    const kriekRatings = reviewRatingsByStyle(kriekStyle.id)
    const kriekAverage = average(kriekRatings)
    expect(statsRes.data.style).to.eql([
      {
        reviewCount: `${ipaRatings.length}`,
        reviewAverage: ipaAverage,
        styleId: ipaStyle.id,
        styleName: ipaStyle.name
      },
      {
        reviewCount: `${kriekRatings.length}`,
        reviewAverage: kriekAverage,
        styleId: kriekStyle.id,
        styleName: kriekStyle.name
      }
    ])
    expect(ipaRatings.length).to.equal(3)
    expect(ipaAverage).to.equal('7.33')
    expect(kriekRatings.length).to.equal(3)
    expect(kriekAverage).to.equal('6.67')
  })
})

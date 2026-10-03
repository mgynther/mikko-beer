import type { CreateReviewRequest } from '../../../src/logic/review/review.js'
import type { CreatedOrUpdatedBeer } from '../../../src/web/beer/beer.js'
import type { CreatedOrUpdatedBrewery } from '../../../src/web/brewery/brewery.js'
import type { CreatedOrUpdatedContainer } from '../../../src/web/container/container.js'
import type { CreatedOrUpdatedLocation } from '../../../src/web/location/location.js'
import type { CreatedOrUpdatedReview } from '../../../src/web/review/review.js'
import type { CreatedOrUpdatedStyle } from '../../../src/web/style/style.js'
import type { Client, RequestHeaders } from '../../client.js'
import { assertEqual } from '../../assert.js'

interface StatsData {
  beers: CreatedOrUpdatedBeer[]
  breweries: Array<{ data: { brewery: CreatedOrUpdatedBrewery } }>
  locations: Array<{ data: { location: CreatedOrUpdatedLocation } }>
  reviews: CreatedOrUpdatedReview[]
  containers: Array<{ data: { container: CreatedOrUpdatedContainer } }>
  styles: Array<{ data: { style: CreatedOrUpdatedStyle } }>
}

export async function createStatsData(
  request: Client,
  adminAuthHeaders: RequestHeaders,
): Promise<StatsData> {
  const [
    styleRes,
    otherStyleRes,
    breweryRes,
    otherBreweryRes,
    containerRes,
    locationRes,
    otherLocationRes,
  ] = await Promise.all([
    request.post<{ style: CreatedOrUpdatedStyle }>(
      `/api/v1/style`,
      { name: 'Kriek', parents: [] },
      adminAuthHeaders,
    ),
    request.post<{ style: CreatedOrUpdatedStyle }>(
      `/api/v1/style`,
      { name: 'IPA', parents: [] },
      adminAuthHeaders,
    ),
    request.post<{ brewery: CreatedOrUpdatedBrewery }>(
      `/api/v1/brewery`,
      { name: 'Lindemans', country: 'BE' },
      adminAuthHeaders,
    ),
    request.post<{ brewery: CreatedOrUpdatedBrewery }>(
      `/api/v1/brewery`,
      { name: 'Nokian Panimo', country: 'FI' },
      adminAuthHeaders,
    ),
    request.post<{ container: CreatedOrUpdatedContainer }>(
      `/api/v1/container`,
      { type: 'Bottle', size: '0.25' },
      adminAuthHeaders,
    ),
    request.post<{ location: CreatedOrUpdatedLocation }>(
      `/api/v1/location`,
      { name: 'Kuja' },
      adminAuthHeaders,
    ),
    request.post<{ location: CreatedOrUpdatedLocation }>(
      `/api/v1/location`,
      { name: 'Oluthuone' },
      adminAuthHeaders,
    ),
  ])
  assertEqual(styleRes.status, 201)
  assertEqual(otherStyleRes.status, 201)
  assertEqual(breweryRes.status, 201)
  assertEqual(otherBreweryRes.status, 201)
  assertEqual(containerRes.status, 201)
  assertEqual(locationRes.status, 201)
  assertEqual(otherLocationRes.status, 201)

  const [beerRes, otherBeerRes, collabBeerRes] = await Promise.all([
    request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: 'Lindemans Kriek',
        breweries: [breweryRes.data.brewery.id],
        styles: [styleRes.data.style.id],
      },
      adminAuthHeaders,
    ),
    request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: 'IPA',
        breweries: [otherBreweryRes.data.brewery.id],
        styles: [otherStyleRes.data.style.id],
      },
      adminAuthHeaders,
    ),
    request.post<{ beer: CreatedOrUpdatedBeer }>(
      `/api/v1/beer`,
      {
        name: 'Wild Kriek IPA',
        breweries: [
          breweryRes.data.brewery.id,
          otherBreweryRes.data.brewery.id,
        ],
        styles: [styleRes.data.style.id, otherStyleRes.data.style.id],
      },
      adminAuthHeaders,
    ),
  ])
  assertEqual(beerRes.status, 201)
  assertEqual(otherBeerRes.status, 201)
  assertEqual(collabBeerRes.status, 201)

  const createRequest: CreateReviewRequest = {
    additionalInfo: '',
    beer: beerRes.data.beer.id,
    container: containerRes.data.container.id,
    location: locationRes.data.location.id,
    rating: 5,
    smell: 'Cherries',
    taste: 'Cherries, a little sour',
    time: '2021-03-07T18:31:33.123Z',
  }
  const otherReviewRequest: CreateReviewRequest = {
    additionalInfo: '',
    beer: otherBeerRes.data.beer.id,
    container: containerRes.data.container.id,
    location: otherLocationRes.data.location.id,
    rating: 7,
    smell: 'Grapefruit',
    taste: 'Bitter',
    time: '2022-03-08T18:31:33.123Z',
  }
  const collabReviewRequest: CreateReviewRequest = {
    additionalInfo: '',
    beer: collabBeerRes.data.beer.id,
    container: containerRes.data.container.id,
    location: locationRes.data.location.id,
    rating: 8,
    smell: 'Grapefruit, cherries',
    taste: 'Bitter, sour',
    time: '2023-03-09T18:31:33.123Z',
  }
  const collabReview2Request: CreateReviewRequest = {
    additionalInfo: 'Another one was not quite as good',
    beer: collabBeerRes.data.beer.id,
    container: containerRes.data.container.id,
    location: otherLocationRes.data.location.id,
    rating: 7,
    smell: 'Grapefruit, cherries',
    taste: 'Bitter, sour',
    time: '2023-03-10T18:31:33.123Z',
  }
  const [reviewRes, otherReviewRes, collabReviewRes, collabReview2Res] =
    await Promise.all(
      [
        createRequest,
        otherReviewRequest,
        collabReviewRequest,
        collabReview2Request,
      ].map((reviewRequest) =>
        request.post<{ review: CreatedOrUpdatedReview }>(
          `/api/v1/review`,
          reviewRequest,
          adminAuthHeaders,
        ),
      ),
    )
  assertEqual(reviewRes.status, 201)
  assertEqual(otherReviewRes.status, 201)
  assertEqual(collabReviewRes.status, 201)
  assertEqual(collabReview2Res.status, 201)

  return {
    beers: [beerRes.data.beer, collabBeerRes.data.beer, otherBeerRes.data.beer],
    breweries: [breweryRes, otherBreweryRes],
    locations: [locationRes, otherLocationRes],
    reviews: [
      collabReviewRes.data.review,
      collabReview2Res.data.review,
      reviewRes.data.review,
      otherReviewRes.data.review,
    ],
    containers: [containerRes],
    styles: [styleRes, otherStyleRes],
  }
}

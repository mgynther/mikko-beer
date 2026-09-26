import type {
  CreateReviewRequest,
  JoinedReview,
  Review,
  ReviewListFilter,
  UpdateReviewRequest,
} from '../../../src/logic/review/review.js'
import { buildContainer } from '../container/builders.js'

// A valid Review and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: '858b0cb8-7f5a-4aff-a961-16a57cf80215',
    additionalInfo: 'Additional info',
    beer: '45da3365-f6fe-437b-83f9-dac632edd23f',
    container: '32d7c2db-08ec-4727-8b97-e48fe0fb719a',
    location: '685dc553-4dcf-4292-9a12-29f76db430cd',
    rating: 7,
    time: new Date('2025-01-01T00:00:00.000Z'),
    smell: 'Smell',
    taste: 'Taste',
    ...overrides,
  }
}

// A valid JoinedReview and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildJoinedReview(
  overrides: Partial<JoinedReview> = {},
): JoinedReview {
  return {
    id: '96ba51e8-bea9-4949-a476-a21839c9c044',
    additionalInfo: 'Additional info',
    beerId: '8c8ee839-d914-4be4-8f05-de3025a14d84',
    beerName: 'Beer',
    breweries: [],
    container: buildContainer(),
    location: undefined,
    rating: 6,
    styles: [],
    time: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

// A valid CreateReviewRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildCreateReviewRequest(
  overrides: Partial<CreateReviewRequest> = {},
): CreateReviewRequest {
  return {
    additionalInfo: 'Additional info',
    beer: '7cb2591c-2e7b-4a4a-9612-d426fef8ea33',
    container: '6ed55d23-e450-48bb-a780-2ed5473000a1',
    location: '18fef606-9239-45eb-b151-1f3ffc04bb1d',
    rating: 7,
    smell: 'Smell',
    taste: 'Taste',
    time: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// A valid UpdateReviewRequest and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildUpdateReviewRequest(
  overrides: Partial<UpdateReviewRequest> = {},
): UpdateReviewRequest {
  return {
    additionalInfo: 'Additional info',
    beer: '82374f85-4119-460e-9820-c8da3faf3b7f',
    container: '79e8645d-24b9-4efd-b5bf-a7b5f367f6b1',
    location: '93c2ecac-376f-47c9-a34a-60c03dcf49c7',
    rating: 7,
    smell: 'Smell',
    taste: 'Taste',
    time: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// A valid ReviewListFilter and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildReviewListFilter(
  overrides: Partial<ReviewListFilter> = {},
): ReviewListFilter {
  return {
    minRating: 4,
    maxRating: 10,
    minTime: new Date('2020-01-01T00:00:00.000Z'),
    maxTime: new Date('2030-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

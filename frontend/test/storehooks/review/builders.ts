import type { JoinedReview, Review } from '../../../src/storehooks/review/types'
import { buildContainer } from '../container/builders'

// A valid Review and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: '9f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a',
    additionalInfo: 'Additional info',
    beer: '1f2e3d4c-5b6a-4798-8071-2f3e4d5c6b7a',
    container: '2e3d4c5b-6a79-4881-9062-3e4d5c6b7a89',
    location: '3d4c5b6a-7988-4172-8053-4d5c6b7a8998',
    rating: 7,
    smell: 'Smell',
    taste: 'Taste',
    time: '2025-01-01T00:00:00.000Z',
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
    id: '6a5b4c3d-2e1f-4098-8776-5e4d3c2b1a09',
    additionalInfo: 'Additional info',
    beerId: '7b6c5d4e-3f20-4189-8877-6f5e4d3c2b1a',
    beerName: 'Beer',
    breweries: [],
    container: buildContainer(),
    location: undefined,
    rating: 6,
    styles: [],
    time: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

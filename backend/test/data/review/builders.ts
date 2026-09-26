import type { NewReview } from '../../../src/data/review/review.repository.js'

// A valid NewReview and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildNewReview(overrides: Partial<NewReview> = {}): NewReview {
  return {
    additionalInfo: 'Additional info',
    beer: '26a788ac-c8c5-4198-80f5-f17ef85ebfbc',
    container: '16672b6e-244e-4139-bdef-6a6f87025373',
    location: '4b5a19ec-c32d-4034-be69-827420faef28',
    rating: 7,
    time: new Date('2025-01-01T00:00:00.000Z'),
    smell: 'Smell',
    taste: 'Taste',
    ...overrides,
  }
}

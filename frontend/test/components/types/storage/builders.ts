import type { Storage } from '../../../../src/components/types/storage/types'
import { buildContainer } from '../container/builders'

// A valid Storage and nothing more.
// Neither its values nor how they relate to those of any other result may
// be assumed: a test that depends on a property sets it in the overrides
// itself.
export function buildStorage(overrides: Partial<Storage> = {}): Storage {
  return {
    id: 'c3d4e5f6-0718-4293-a4b5-c6d7e8f90112',
    beerId: 'd4e5f607-1829-43a4-b5c6-d7e8f9011223',
    beerName: 'Beer',
    bestBefore: '2026-01-01T00:00:00.000Z',
    breweries: [],
    container: buildContainer(),
    createdAt: '2025-01-01T00:00:00.000Z',
    hasReview: false,
    styles: [],
    ...overrides,
  }
}

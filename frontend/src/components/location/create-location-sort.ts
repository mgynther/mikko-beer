import type { Location } from '../../core/location/types'

export const createId = 'create-new'

export function createLocationSort(a: Location, b: Location): number {
  if (a.id === createId) return 1
  if (b.id === createId) return -1
  return 0
}

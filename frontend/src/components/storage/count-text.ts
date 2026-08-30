import type { Storage } from '../../types/storage/types'

export function countText(storages: Storage[]): string {
  const newCount = storages.filter((storage) => !storage.hasReview).length
  const totalCount = storages.length
  return `${newCount}/${totalCount}`
}

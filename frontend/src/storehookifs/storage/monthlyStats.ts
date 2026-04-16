import type { GetMonthlyStorageStatsIf } from '../../core/storage/types'
import { useGetMonthlyStorageStatsQuery } from '../../store/storage/api'
// prettier-ignore
import {
  validateMonthlyStorageStatsOrUndefined
} from '../../validation/storage'

const getMonthlyStorageStats: () => GetMonthlyStorageStatsIf = () => {
  const getMonthlyStorageStatsIf: GetMonthlyStorageStatsIf = {
    useMonthlyStats: () => {
      const { data, isLoading } = useGetMonthlyStorageStatsQuery()
      return {
        stats: validateMonthlyStorageStatsOrUndefined(data),
        isLoading,
      }
    },
  }
  return getMonthlyStorageStatsIf
}

export default getMonthlyStorageStats

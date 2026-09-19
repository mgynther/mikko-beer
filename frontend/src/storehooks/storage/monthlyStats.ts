import type {
  GetMonthlyStorageStatsHookIf,
  UseGetStorageStats,
  ValidateMonthlyStatsOrUndefined,
} from './types'

const getMonthlyStorageStats: (
  useStats: UseGetStorageStats,
  validateStats: ValidateMonthlyStatsOrUndefined,
) => GetMonthlyStorageStatsHookIf = (useStats, validateStats) => {
  const getMonthlyStorageStatsIf: GetMonthlyStorageStatsHookIf = {
    useMonthlyStats: () => {
      const { data, isLoading } = useStats()
      return {
        stats: validateStats(data),
        isLoading,
      }
    },
  }
  return getMonthlyStorageStatsIf
}

export default getMonthlyStorageStats

import type {
  GetAnnualStorageStatsHookIf,
  UseGetStorageStats,
  ValidateAnnualStatsOrUndefined,
} from './types'

const getAnnualStorageStats: (
  useStats: UseGetStorageStats,
  validateStats: ValidateAnnualStatsOrUndefined,
) => GetAnnualStorageStatsHookIf = (useStats, validateStats) => {
  const getAnnualStorageStatsIf: GetAnnualStorageStatsHookIf = {
    useAnnualStats: () => {
      const { data, isLoading } = useStats()
      return {
        stats: validateStats(data),
        isLoading,
      }
    },
  }
  return getAnnualStorageStatsIf
}

export default getAnnualStorageStats

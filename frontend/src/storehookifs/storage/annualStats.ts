import type { GetAnnualStorageStatsIf } from "../../core/storage/types"
import { useGetAnnualStorageStatsQuery } from "../../store/storage/api"
import { validateAnnualStorageStatsOrUndefined } from "../../validation/storage"

const getAnnualStorageStats: () => GetAnnualStorageStatsIf = () => {
  const getAnnualStorageStatsIf: GetAnnualStorageStatsIf = {
    useAnnualStats: () => {
      const { data, isLoading } = useGetAnnualStorageStatsQuery()
      return {
        stats: validateAnnualStorageStatsOrUndefined(data),
        isLoading
      }
    },
  }
  return getAnnualStorageStatsIf
}

export default getAnnualStorageStats

import React, { useEffect } from 'react'

import type {
  GetAnnualContainerStatsIf,
  OneAnnualContainerStats
} from '../../core/stats/types'

import AnnualContainerStatsTable from './AnnualContainerStatsTable'

interface Props {
  getAnnualContainerStatsIf: GetAnnualContainerStatsIf
  loadedAnnualContainers: OneAnnualContainerStats[] | undefined
  setLoadedAnnualContainers: (
    locations: OneAnnualContainerStats[] | undefined
  ) => void
}

function AnnualContainerInfiniteScroll (props: Props): React.JSX.Element {
  const { loadedAnnualContainers, setLoadedAnnualContainers } = props
  const { query, stats, isLoading } = props.getAnnualContainerStatsIf.useStats()

  const lastPageArray = stats?.annualContainer === undefined
    ? []
    : [...stats.annualContainer]
  const hasMore =
    lastPageArray.length > 0 || loadedAnnualContainers === undefined

  useEffect(() => {
    const loadMore = async (): Promise<void> => {
      const result = await query({
        breweryId: undefined,
        locationId: undefined,
        styleId: undefined,
        pagination: {
          skip: loadedAnnualContainers?.length ?? 0,
          size: 30
        }
      })
      if (result === undefined) return
      const newAnnualContainers = [
        ...(loadedAnnualContainers ?? []),
        ...result.annualContainer
      ]
      setLoadedAnnualContainers(newAnnualContainers)
    }
    function checkLoad (): void {
      if (!isLoading && hasMore) {
        void loadMore()
      }
    }
    return props.getAnnualContainerStatsIf.infiniteScroll(checkLoad)
  }, [
    loadedAnnualContainers,
    setLoadedAnnualContainers,
    isLoading,
    hasMore,
    query
  ])

  return (
    <>
      <AnnualContainerStatsTable
        annualContainers={loadedAnnualContainers ?? []}
        isLoading={isLoading}
      />
    </>
  )
}

export default AnnualContainerInfiniteScroll

import React, { useEffect } from 'react'

import type {
  GetAnnualContainerStatsIf,
  OneAnnualContainerStats,
} from '../../types/stats/types'

import { useLoadMore } from '../common/use-load-more'

import AnnualContainerStatsTable from './AnnualContainerStatsTable'

const pageSize = 30

interface Props {
  getAnnualContainerStatsIf: GetAnnualContainerStatsIf
  loadedAnnualContainers: OneAnnualContainerStats[] | undefined
  setLoadedAnnualContainers: (
    update: (
      current: OneAnnualContainerStats[] | undefined,
    ) => OneAnnualContainerStats[] | undefined,
  ) => void
}

function AnnualContainerInfiniteScroll(props: Props): React.JSX.Element {
  const { loadedAnnualContainers, setLoadedAnnualContainers } = props
  const { query, stats, isLoading } = props.getAnnualContainerStatsIf.useStats()

  const lastPageArray =
    stats?.annualContainer === undefined ? [] : [...stats.annualContainer]
  const hasMore =
    lastPageArray.length > 0 || loadedAnnualContainers === undefined

  const checkLoad = useLoadMore({
    hasMore,
    isLoading,
    items: loadedAnnualContainers,
    loadPage: async (skip: number) =>
      (
        await query({
          breweryId: undefined,
          locationId: undefined,
          styleId: undefined,
          pagination: { skip, size: pageSize },
        })
      ).annualContainer,
    setItems: setLoadedAnnualContainers,
  })

  // Observing the end of the content reports whether it is in view, so
  // subscribing again once a page has arrived is what loads the next one
  // while the list is still shorter than the window.
  useEffect(
    () => props.getAnnualContainerStatsIf.infiniteScroll(checkLoad),
    [checkLoad, loadedAnnualContainers, isLoading, hasMore],
  )

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

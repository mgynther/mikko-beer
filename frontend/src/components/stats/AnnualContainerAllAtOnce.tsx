import React, { useEffect } from 'react'

import type {
  GetAnnualContainerStatsIf,
  OneAnnualContainerStats
} from '../../core/stats/types'

import AnnualContainerStatsTable from './AnnualContainerStatsTable'

interface Props {
  getAnnualContainerStatsIf: GetAnnualContainerStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  loadedAnnualContainers: OneAnnualContainerStats[] | undefined
  setLoadedAnnualContainers: (
    locations: OneAnnualContainerStats[] | undefined
  ) => void
}

const giantPage = {
  skip: 0,
  size: 10000
}

function AnnualContainerAllAtOnce (props: Props): React.JSX.Element {
  const {
    loadedAnnualContainers,
    setLoadedAnnualContainers
  } = props
  const { query, isLoading } = props.getAnnualContainerStatsIf.useStats()
  const { breweryId, locationId, styleId } = props

  useEffect(() => {
    setLoadedAnnualContainers(undefined)
  }, [breweryId])

  useEffect(() => {
    setLoadedAnnualContainers(undefined)
  }, [styleId])

  useEffect(() => {
    async function loadAll (): Promise<void> {
      const result = await query({
        breweryId,
        locationId,
        styleId,
        pagination: giantPage
      })
      if (result === undefined) return
      setLoadedAnnualContainers([...result.annualContainer])
    }
    void loadAll()
  }, [
    breweryId,
    locationId,
    styleId
  ])

  return (
    <AnnualContainerStatsTable
      annualContainers={loadedAnnualContainers ?? []}
      isLoading={isLoading}
    />
  )
}

export default AnnualContainerAllAtOnce

import React, { useState } from 'react'

import type {
  GetAnnualContainerStatsIf,
  OneAnnualContainerStats
} from '../../core/stats/types'

import AnnualContainerAllAtOnce from './AnnualContainerAllAtOnce'
import AnnualContainerInfiniteScroll from './AnnualContainerInfiniteScroll'

interface Props {
  getAnnualContainerStatsIf: GetAnnualContainerStatsIf
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
}

function AnnualContainer (props: Props): React.JSX.Element {
  const isAllAtOnce = props.breweryId !== undefined
    || props.locationId !== undefined
    || props.styleId !== undefined

  const [loadedAnnualContainers, setLoadedAnnualContainers] =
    useState<OneAnnualContainerStats[] | undefined>(undefined)

  return (
    <>
      {isAllAtOnce && (
        <AnnualContainerAllAtOnce
          getAnnualContainerStatsIf={props.getAnnualContainerStatsIf}
          loadedAnnualContainers={loadedAnnualContainers}
          setLoadedAnnualContainers={setLoadedAnnualContainers}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      )}
      {!isAllAtOnce && (
        <AnnualContainerInfiniteScroll
          getAnnualContainerStatsIf={props.getAnnualContainerStatsIf}
          loadedAnnualContainers={loadedAnnualContainers}
          setLoadedAnnualContainers={setLoadedAnnualContainers}
        />
      )}
    </>
  )
}

export default AnnualContainer

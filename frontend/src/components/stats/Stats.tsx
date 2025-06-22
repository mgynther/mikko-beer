import React from 'react'

import Annual from './Annual'
import AnnualContainerInfiniteScroll from './AnnualContainer'
import Brewery from './Brewery'
import Location from './Location'
import Overall from './Overall'
import Rating from './Rating'
import Style from './Style'

import TabButton from '../common/TabButton'
import type { StatsIf } from '../../core/stats/types'
import Container from './Container'
import type { ParamsIf } from '../util'

import './StatsModeContainer.css'

enum Mode {
  Annual = 'annual',
  AnnualContainer = 'annual_container',
  Brewery = 'brewery',
  Container = 'container',
  Location = 'location',
  Overall = 'overall',
  Rating = 'rating',
  Style = 'style',
}

interface Props {
  statsIf: StatsIf
  breweryId: string | undefined
  locationId: string | undefined
  styleId: string | undefined
  paramsIf: ParamsIf
}

interface ModeButton {
  mode: Mode
  title: string
}

const buttons: ModeButton[] = [
  {
    mode: Mode.Overall,
    title: 'Overall'
  },
  {
    mode: Mode.Annual,
    title: 'Annual'
  },
  {
    mode: Mode.AnnualContainer,
    title: 'Annual & Container'
  },
  {
    mode: Mode.Brewery,
    title: 'Brewery'
  },
  {
    mode: Mode.Container,
    title: 'Container'
  },
  {
    mode: Mode.Location,
    title: 'Location'
  },
  {
    mode: Mode.Rating,
    title: 'Rating'
  },
  {
    mode: Mode.Style,
    title: 'Style'
  }
]

function getStatsMode (stats: string | undefined): Mode {
  const defaultValue = Mode.Overall
  if (stats === undefined) {
    return defaultValue
  }
  switch (stats) {
    case Mode.Overall as string:
      return Mode.Overall
    case Mode.Annual as string:
      return Mode.Annual
    case Mode.AnnualContainer as string:
      return Mode.AnnualContainer
    case Mode.Brewery as string:
      return Mode.Brewery
    case Mode.Container as string:
      return Mode.Container
    case Mode.Location as string:
      return Mode.Location
    case Mode.Rating as string:
      return Mode.Rating
    case Mode.Style as string:
      return Mode.Style
  }
  return defaultValue
}

function Stats (props: Props): React.JSX.Element | null {
  const search = props.paramsIf.useSearch()
  const stats = search.get('stats') ?? undefined
  const showFull = props.breweryId === undefined && props.styleId === undefined
  const mode = getStatsMode(stats)

  function setMode (newMode: Mode): void {
    if (mode === newMode) {
      return
    }
    void props.statsIf.setSearch(newMode, {})
  }

  function setState (state: Record<string, string>): void {
    void props.statsIf.setSearch(mode, state)
  }

  return (
    <div>
      {!showFull && <h4>Statistics</h4>}
      {showFull && <h3>Statistics</h3>}
      <div className='StatsModeContainer'>
        {buttons.map(model => (
          <TabButton
            key={model.title}
            isCompact={false}
            isSelected={mode === model.mode}
            onClick={() => { setMode(model.mode) }}
            title={model.title}
          />
        ))}
      </div>
      {mode === Mode.Annual &&
        <Annual
          getAnnualStatsIf={props.statsIf.annual}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.AnnualContainer &&
        <AnnualContainerInfiniteScroll
          getAnnualContainerStatsIf={props.statsIf.annualContainer}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Brewery &&
        <Brewery
          getBreweryStatsIf={props.statsIf.brewery}
          breweryId={props.breweryId}
          locationId={props.locationId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Container &&
        <Container
          getContainerStatsIf={props.statsIf.container}
          breweryId={props.breweryId}
          locationId={props.locationId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Location &&
        <Location
          getLocationStatsIf={props.statsIf.location}
          breweryId={props.breweryId}
          locationId={props.locationId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Overall &&
        <Overall
          getOverallStatsIf={props.statsIf.overall}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Rating &&
        <Rating
          getRatingStatsIf={props.statsIf.rating}
          breweryId={props.breweryId}
          locationId={props.locationId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Style &&
        <Style
          getStyleStatsIf={props.statsIf.style}
          breweryId={props.breweryId}
          locationId={props.locationId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
    </div>
  )
}

export default Stats

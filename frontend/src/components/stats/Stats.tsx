import React from 'react'

import Annual from './Annual'
import Brewery from './Brewery'
import Location from './Location'
import Overall from './Overall'
import Rating from './Rating'
import Style from './Style'

import TabButton from '../common/TabButton'
import type { StatsIf } from '../../core/stats/types'
import Container from './Container'
import type { ParamsIf } from '../util'

enum Mode {
  Annual = 'annual',
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
    case Mode.Overall.toString():
      return Mode.Overall
    case Mode.Annual.toString():
      return Mode.Annual
    case Mode.Brewery.toString():
      return Mode.Brewery
    case Mode.Container.toString():
      return Mode.Container
    case Mode.Location.toString():
      return Mode.Location
    case Mode.Rating.toString():
      return Mode.Rating
    case Mode.Style.toString():
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
          styleId={props.styleId}
        />
      }
      {mode === Mode.Brewery &&
        <Brewery
          getBreweryStatsIf={props.statsIf.brewery}
          breweryId={props.breweryId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Container &&
        <Container
          getContainerStatsIf={props.statsIf.container}
          breweryId={props.breweryId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Location &&
        <Location
          getLocationStatsIf={props.statsIf.location}
          breweryId={props.breweryId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Overall &&
        <Overall
          getOverallStatsIf={props.statsIf.overall}
          breweryId={props.breweryId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Rating &&
        <Rating
          getRatingStatsIf={props.statsIf.rating}
          breweryId={props.breweryId}
          styleId={props.styleId}
        />
      }
      {mode === Mode.Style &&
        <Style
          getStyleStatsIf={props.statsIf.style}
          breweryId={props.breweryId}
          search={search}
          setState={setState}
          styleId={props.styleId}
        />
      }
    </div>
  )
}

export default Stats

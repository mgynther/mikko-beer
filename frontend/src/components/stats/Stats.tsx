import { useState } from 'react'

import Annual from './Annual'
import Brewery from './Brewery'
import Overall from './Overall'
import Rating from './Rating'
import Style from './Style'

import TabButton from '../common/TabButton'
import type { StatsIf } from '../../core/stats/types'

enum Mode {
  Annual = 'Annual',
  Brewery = 'Brewery',
  Overall = 'Overall',
  Rating = 'Rating',
  Style = 'Style',
}

interface Props {
  statsIf: StatsIf
  breweryId: string | undefined
  styleId: string | undefined
}

interface ModeButton {
  mode: Mode
  title: string
}

function Stats (props: Props): JSX.Element {
  const showFull = props.breweryId === undefined && props.styleId === undefined
  const [mode, setMode] = useState(Mode.Overall)

  const buttons = [
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
      mode: Mode.Rating,
      title: 'Rating'
    },
    {
      mode: Mode.Style,
      title: 'Style'
    }
  ].filter(button => button) as ModeButton[]

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
        <Brewery breweryId={props.breweryId} styleId={props.styleId} />
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
          styleId={props.styleId}
        />
      }
    </div>
  )
}

export default Stats

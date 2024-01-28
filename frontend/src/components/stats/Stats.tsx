import { useState } from 'react'

import Annual from './Annual'
import Brewery from './Brewery'
import Overall from './Overall'
import Rating from './Rating'
import Style from './Style'

import TabButton from '../common/TabButton'

enum Mode {
  Annual = 'Annual',
  Brewery = 'Brewery',
  Overall = 'Overall',
  Rating = 'Rating',
  Style = 'Style',
}

interface Props {
  breweryId: string | undefined
}

interface ModeButton {
  mode: Mode
  title: string
}

function Stats (props: Props): JSX.Element {
  const showOnlyBrewery = props.breweryId !== undefined
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
      {showOnlyBrewery && <h4>Statistics</h4>}
      {!showOnlyBrewery && <h3>Statistics</h3>}
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
      {mode === Mode.Annual && <Annual breweryId={props.breweryId} />}
      {mode === Mode.Brewery && <Brewery breweryId={props.breweryId} />}
      {mode === Mode.Overall && <Overall breweryId={props.breweryId} />}
      {mode === Mode.Rating && <Rating breweryId={props.breweryId} />}
      {mode === Mode.Style && <Style breweryId={props.breweryId} />}
    </div>
  )
}

export default Stats

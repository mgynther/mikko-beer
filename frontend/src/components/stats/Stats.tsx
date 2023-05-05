import { useState } from 'react'

import Annual from './Annual'
import Brewery from './Brewery'
import Overall from './Overall'
import Style from './Style'

import TabButton from '../TabButton'

enum Mode {
  Annual = 'Annual',
  Brewery = 'Brewery',
  Overall = 'Overall',
  Style = 'Style',
}

function Stats (): JSX.Element {
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
      mode: Mode.Style,
      title: 'Style'
    }
  ]

  return (
    <div>
      <h3>Statistics</h3>
      <div className='StatsModeContainer'>
        {buttons.map(model => (
          <TabButton
            key={model.title}
            isSelected={mode === model.mode}
            onClick={() => { setMode(model.mode) }}
            title={model.title}
          />
        ))}
      </div>
      {mode === Mode.Annual && <Annual />}
      {mode === Mode.Brewery && <Brewery />}
      {mode === Mode.Overall && <Overall />}
      {mode === Mode.Style && <Style />}
    </div>
  )
}

export default Stats
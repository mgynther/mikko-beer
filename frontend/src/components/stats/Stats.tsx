import { useState } from 'react'

import Annual from './Annual'
import Overall from './Overall'
import Style from './Style'

import TabButton from '../TabButton'

enum Mode {
  Annual = 'Annual',
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
            isSelected={mode === model.mode}
            onClick={() => { setMode(model.mode) }}
            title={model.title}
          />
        ))}
      </div>
      {mode === Mode.Annual && <Annual />}
      {mode === Mode.Overall && <Overall />}
      {mode === Mode.Style && <Style />}
    </div>
  )
}

export default Stats

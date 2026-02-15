import React from 'react'
import type { StorageStatsIf } from '../../core/storage/types'
import type { ParamsIf } from '../util'
import TabButton from '../common/TabButton'
import AnnualStats from './AnnualStats'
import MonthlyStats from './MonthlyStats'

enum Mode {
  Annual = 'annual',
  Monthly = 'monthly'
}

interface Props {
  statsIf: StorageStatsIf
  paramsIf: ParamsIf
}

interface ModeButton {
  mode: Mode
  title: string
}

const buttons: ModeButton[] = [
  {
    mode: Mode.Annual,
    title: 'Annual'
  },
  {
    mode: Mode.Monthly,
    title: 'Monthly'
  }
]

function getStatsMode (stats: string | undefined): Mode {
  const defaultValue = Mode.Annual
  if (stats === undefined) {
    return defaultValue
  }
  switch (stats) {
    case Mode.Annual as string:
      return Mode.Annual
    case Mode.Monthly as string:
      return Mode.Monthly
  }
  return defaultValue
}

function Stats (props: Props): React.JSX.Element | null {
  const search = props.paramsIf.useSearch()
  const stats = search.get('stats') ?? undefined
  const mode = getStatsMode(stats)

  function setMode (newMode: Mode): void {
    if (mode === newMode) {
      return
    }
    void props.statsIf.setSearch(newMode, {})
  }

  return (
    <div>
      <h3>Statistics</h3>
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
        <AnnualStats
          annualStatsIf={props.statsIf.annual}
        />
      }
      {mode === Mode.Monthly &&
        <MonthlyStats
          monthlyStatsIf={props.statsIf.monthly}
        />
      }
    </div>
  )
}

export default Stats

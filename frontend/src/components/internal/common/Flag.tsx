import React from 'react'

import { flagEmoji } from './flag-emoji'

interface Props {
  country: string | undefined
}

export function Flag(props: Props): React.JSX.Element | null {
  const flag = flagEmoji(props.country)
  if (flag === undefined) {
    return null
  }
  return <span>{flag}</span>
}

export default Flag

import React from 'react'

import { Link } from '../common/Link'

import type { Location } from '../../core/location/types'

interface Props {
  location: Location
}

export function locationLinkFormatter (id: string): string {
  return `/locations/${id}`
}

export function LocationLink (props: Props): React.JSX.Element {
  return (
    <Link
      text={props.location.name}
      to={locationLinkFormatter(props.location.id)}
    />
  )
}

export default LocationLink

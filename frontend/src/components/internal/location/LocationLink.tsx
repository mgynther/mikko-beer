import React from 'react'

import type { LinkComponent } from '../../common/link'

import type { Location } from '../../types/location/types'

interface Props {
  location: Location
  linkComponent: LinkComponent
}

export function locationLinkFormatter(id: string): string {
  return `/locations/${id}`
}

export function LocationLink(props: Props): React.JSX.Element {
  const Link = props.linkComponent
  return (
    <Link
      text={props.location.name}
      to={locationLinkFormatter(props.location.id)}
    />
  )
}

export default LocationLink

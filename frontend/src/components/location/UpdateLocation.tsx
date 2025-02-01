import React, { useState } from 'react'

import type {
  UpdateLocationIf,
  Location
} from '../../core/location/types'

import EditActions from '../common/EditActions'

import LocationEditor from './LocationEditor'

interface Props {
  updateLocationIf: UpdateLocationIf
  initialLocation: Location
  onCancel: () => void
  onSaved: () => void
}

function UpdateLocation (props: Props): React.JSX.Element {
  const [newLocation, setNewLocation] =
    useState<Location | undefined>(undefined)
  const { update, isLoading } = props.updateLocationIf.useUpdate()
  async function doUpdate (): Promise<void> {
    if (newLocation === undefined) {
      throw new Error('location must not be undefined when updating')
    }
    try {
      await update({ ...newLocation })
      props.onSaved()
    } catch (e) {
      console.warn('Failed to update location', e)
    }
  }
  return (
    <>
      <LocationEditor
        location={props.initialLocation}
        placeholder='New name'
        onChange={(location: Location | undefined) => {
          setNewLocation(location)
        }}
      />
      <EditActions
        isSaveDisabled={newLocation === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewLocation(undefined)
          props.onCancel()
        }}
        onSave={() => { void doUpdate() }}
      />
    </>
  )
}

export default UpdateLocation

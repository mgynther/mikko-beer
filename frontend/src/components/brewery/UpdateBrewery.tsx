import { useState } from 'react'

import type {
  UpdateBreweryIf,
  Brewery
} from '../../core/brewery/types'

import EditActions from '../common/EditActions'

import BreweryEditor from './BreweryEditor'

interface Props {
  updateBreweryIf: UpdateBreweryIf
  initialBrewery: Brewery
  onCancel: () => void
  onSaved: () => void
}

function UpdateBrewery (props: Props): JSX.Element {
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const { update, isLoading } = props.updateBreweryIf.useUpdate()
  async function doUpdate (): Promise<void> {
    if (newBrewery === undefined) {
      throw new Error('brewery must not be undefined when updating')
    }
    try {
      await update({ ...newBrewery })
      props.onSaved()
    } catch (e) {
      console.warn('Failed to update brewery', e)
    }
  }
  return (
    <>
      <BreweryEditor
        brewery={props.initialBrewery}
        placeholder='New name'
        onChange={(brewery: Brewery | undefined) => {
          setNewBrewery(brewery)
        }}
      />
      <EditActions
        isSaveDisabled={newBrewery === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewBrewery(undefined)
          props.onCancel()
        }}
        onSave={() => { void doUpdate() }}
      />
    </>
  )
}

export default UpdateBrewery

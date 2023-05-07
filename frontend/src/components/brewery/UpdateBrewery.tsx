import { useState } from 'react'

import { useUpdateBreweryMutation } from '../../store/brewery/api'
import { type Brewery } from '../../store/brewery/types'

import EditActions from '../EditActions'

import BreweryEditor from './BreweryEditor'

interface Props {
  initialBrewery: Brewery
  onCancel: () => void
  onSaved: () => void
}

function UpdateBrewery (props: Props): JSX.Element {
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const [updateBrewery, { isLoading }] =
    useUpdateBreweryMutation()
  async function update (): Promise<void> {
    if (newBrewery === undefined) {
      throw new Error('brewery must not be undefined when updating')
    }
    try {
      await updateBrewery({ ...newBrewery })
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
        onSave={() => { void update() }}
      />
    </>
  )
}

export default UpdateBrewery

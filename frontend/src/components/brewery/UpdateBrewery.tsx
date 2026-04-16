import React, { useState } from 'react'

import type { UpdateBreweryIf, Brewery } from '../../core/brewery/types'

import EditActions from '../common/EditActions'

import BreweryEditor from './BreweryEditor'

interface Props {
  updateBreweryIf: UpdateBreweryIf
  initialBrewery: Brewery
  onCancel: () => void
  onSaved: () => void
}

function UpdateBrewery(props: Props): React.JSX.Element {
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const { update, isLoading } = props.updateBreweryIf.useUpdate()
  async function doUpdate(newBrewery: Brewery): Promise<void> {
    await update({ ...newBrewery })
    props.onSaved()
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
        onSave={
          newBrewery
            ? (): void => {
                void doUpdate(newBrewery)
              }
            : undefined
        }
      />
    </>
  )
}

export default UpdateBrewery

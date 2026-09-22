import React, { useState } from 'react'

import type { Beer, BeerWithIds, UpdateBeerIf } from '../../types/beer/types'

import EditActions from '../common/EditActions'

import BeerEditor from './BeerEditor'
import { createErrorLogger } from '../error-logger'

interface Props {
  updateBeerIf: UpdateBeerIf
  initialBeer: Beer
  onCancel: () => void
  onSaved: () => void
}

function UpdateBeer(props: Props): React.JSX.Element {
  const [newBeer, setNewBeer] = useState<BeerWithIds | undefined>(undefined)
  const { update, isLoading } = props.updateBeerIf.useUpdate()
  async function doUpdate(newBeer: BeerWithIds): Promise<void> {
    await update({ ...newBeer })
    props.onSaved()
  }
  return (
    <>
      <BeerEditor
        editBeerIf={props.updateBeerIf.editBeerIf}
        initialBeer={props.initialBeer}
        onChange={(beer: BeerWithIds | undefined) => {
          setNewBeer(beer)
        }}
      />
      <EditActions
        isSaveDisabled={newBeer === undefined}
        isSaving={isLoading}
        onCancel={() => {
          setNewBeer(undefined)
          props.onCancel()
        }}
        onSave={
          newBeer
            ? (): void => {
                doUpdate(newBeer).catch(
                  createErrorLogger('doUpdate failed', console.error),
                )
              }
            : undefined
        }
      />
    </>
  )
}

export default UpdateBeer

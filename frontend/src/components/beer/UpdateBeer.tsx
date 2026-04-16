import React, { useState } from 'react'

import type { Beer, BeerWithIds, UpdateBeerIf } from '../../core/beer/types'
import type { SearchIf } from '../../core/search/types'

import EditActions from '../common/EditActions'

import BeerEditor from './BeerEditor'

interface Props {
  searchIf: SearchIf
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
        searchIf={props.searchIf}
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
                void doUpdate(newBeer)
              }
            : undefined
        }
      />
    </>
  )
}

export default UpdateBeer

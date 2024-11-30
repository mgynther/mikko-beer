import React, { useState } from 'react'

import type {
  Brewery,
  CreateBreweryIf
} from '../../core/brewery/types'

import LoadingIndicator from '../common/LoadingIndicator'

import BreweryEditor from './BreweryEditor'

import '../common/FlexRow.css'

export interface Props {
  createBreweryIf: CreateBreweryIf
  select: (brewery: Brewery) => void
}

function CreateBrewery (props: Props): React.JSX.Element {
  const [initialBrewery] = useState<Brewery>({
    id: 'newbrewery',
    name: ''
  })
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const { create, isLoading } = props.createBreweryIf.useCreate()

  async function doCreate (): Promise<void> {
    if (newBrewery === undefined) {
      throw new Error('brewery must not be undefined when creating')
    }
    try {
      const result = await create({
        name: newBrewery.name
      })
      props.select(result)
    } catch (e) {
      console.warn('Failed to create brewery', e)
    }
  }

  return (
    <>
      <div className='FlexRow'>
        <BreweryEditor
          brewery={initialBrewery}
          placeholder='Create brewery'
          onChange={(brewery: Brewery | undefined) => {
            setNewBrewery(brewery)
          }}
        />
        <div>
          <button
            disabled={newBrewery === undefined}
            onClick={() => { void doCreate() }}
          >
            Create
          </button>
        </div>
      </div>
      {isLoading && <LoadingIndicator isLoading={isLoading} />}
    </>
  )
}

export default CreateBrewery

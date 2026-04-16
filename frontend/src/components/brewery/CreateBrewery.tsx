import React, { useState } from 'react'

import type { Brewery, CreateBreweryIf } from '../../core/brewery/types'

import Button from '../common/Button'
import LoadingIndicator from '../common/LoadingIndicator'

import BreweryEditor from './BreweryEditor'

import '../common/FlexRow.css'

export interface Props {
  createBreweryIf: CreateBreweryIf
  select: (brewery: Brewery) => void
}

function CreateBrewery(props: Props): React.JSX.Element {
  const [initialBrewery] = useState<Brewery>({
    id: 'newbrewery',
    name: '',
  })
  const [newBrewery, setNewBrewery] = useState<Brewery | undefined>(undefined)
  const { create, isLoading } = props.createBreweryIf.useCreate()

  async function doCreate(newBrewery: Brewery): Promise<void> {
    const result = await create({
      name: newBrewery.name,
    })
    props.select(result)
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
          <Button
            disabled={newBrewery === undefined}
            onClick={
              newBrewery
                ? (): void => {
                    void doCreate(newBrewery)
                  }
                : undefined
            }
            text='Create'
          />
        </div>
      </div>
      {isLoading && <LoadingIndicator isLoading={isLoading} />}
    </>
  )
}

export default CreateBrewery

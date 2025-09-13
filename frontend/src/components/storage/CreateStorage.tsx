import React, { type FormEvent, useState } from 'react'

import type {
  BeerWithIds,
  SelectBeerIf
} from '../../core/beer/types'
import type { Container } from '../../core/container/types'
import type { ReviewContainerIf } from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'
import type { CreateStorageIf } from '../../core/storage/types'

import Button from '../common/Button'
import LoadingIndicator from '../common/LoadingIndicator'
import SelectBeer from '../beer/SelectBeer'
import SelectContainer from '../container/SelectContainer'

import './CreateStorage.css'
import ContainerInfo from '../container/ContainerInfo'

interface Props {
  searchIf: SearchIf
  selectBeerIf: SelectBeerIf
  createStorageIf: CreateStorageIf
  reviewContainerIf: ReviewContainerIf
}

function CreateStorage (props: Props): React.JSX.Element {
  const { create, hasError, isLoading } = props.createStorageIf.useCreate()

  const [beer, setBeer] = useState<BeerWithIds | undefined>(undefined)
  const [container, setContainer] = useState<Container | undefined>(
    undefined
  )
  const [bestBefore, setBestBefore] = useState('')

  // Very crude validation may let garbage pass but assuming date
  // implementations set invalid or missing input to an empty string or
  // similar it should be fine.
  const isBestBeforeValid = /^\d{4}-\d{2}-\d{2}$/.test(bestBefore)

  const isValid = beer !== undefined &&
    container !== undefined &&
    isBestBeforeValid

  async function doChange (event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!isValid) return
    const bb = new Date(`${bestBefore}T12:00:00.000`).toISOString()
    await create({
      beer: beer.id,
      bestBefore: bb,
      container: container.id
    })
    setBeer(undefined)
    setContainer(undefined)
    setBestBefore('')
  }

  return (
    <div>
      <h4>Create storage beer</h4>
      <form
        className="CreateStorageForm"
        onSubmit={(e) => { void doChange(e) }}>
        <h5>Beer</h5>
        <div className='CreateStorageContent'>
          {beer === undefined
            ? <SelectBeer
                searchIf={props.searchIf}
                selectBeerIf={props.selectBeerIf}
                select={(beer: BeerWithIds) => {
                  setBeer(beer)
                }}
              />
            : (<div className='FlexRow'>
                  <div>{beer.name}</div>
                  <div>
                    <Button
                      onClick={() => { setBeer(undefined) }}
                      text='Change'
                    />
                </div>
              </div>)
          }
        </div>
        <div>
          <h5>Container</h5>
          <div className='ReviewContent'>
            {container === undefined
              ? <SelectContainer
                  reviewContainerIf={props.reviewContainerIf}
                  select={(container: Container) => {
                    setContainer(container)
                  }} />
              : (<div className='FlexRow'>
                  <ContainerInfo container={container} />
                  <div>
                    <Button
                      onClick={() => { setContainer(undefined) }}
                      text='Change'
                    />
                  </div>
                </div>)
            }
          </div>
        </div>
        <div className='CreateStorageContent'>
          <div>
            <label className='bestBefore' htmlFor='time'>Best before</label>
            <input
              type='date'
              id='time'
              value={bestBefore}
              onChange={e => { setBestBefore(e.target.value) }}
            />
          </div>
        </div>
        <div>
          <input type='submit'
            value='Create'
            disabled={isLoading || !isValid}
          />
        </div>
        <div>
          <LoadingIndicator isLoading={isLoading} />
          {!isLoading && hasError &&
            'Creating failed. Please check data.' }
        </div>
      </form>
    </div>
  )
}

export default CreateStorage

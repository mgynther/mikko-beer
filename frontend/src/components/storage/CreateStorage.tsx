import { useState } from 'react'

import { type BeerWithIds } from '../../store/beer/types'
import {
  type Container,
  type CreateContainerIf,
  type ListContainersIf
} from '../../core/container/types'
import { useCreateStorageMutation } from '../../store/storage/api'

import LoadingIndicator from '../common/LoadingIndicator'
import SelectBeer from '../beer/SelectBeer'
import SelectContainer from '../container/SelectContainer'

import './CreateStorage.css'

interface Props {
  createContainerIf: CreateContainerIf
  listContainersIf: ListContainersIf
}

function CreateStorage (props: Props): JSX.Element {
  const [createStorage, { error, isLoading }] = useCreateStorageMutation()

  const [beer, setBeer] = useState<BeerWithIds | undefined>(undefined)
  const [container, setContainer] = useState<Container | undefined>(
    undefined
  )
  const [bestBefore, setBestBefore] = useState('')

  async function doChange (event: any): Promise<void> {
    event.preventDefault()
    if (beer === undefined || container === undefined) return
    const bb = new Date(`${bestBefore}T12:00:00.000`).toISOString()
    await createStorage({
      beer: beer.id,
      bestBefore: bb,
      container: container.id
    })
    event.target.reset()
    setBeer(undefined)
    setContainer(undefined)
    setBestBefore('')
  }
  // Very crude validation may let garbage pass but assuming date
  // implementations set invalid or missing input to an empty string or
  // similar it should be fine.
  const isBestBeforeValid = /^\d{4}-\d{2}-\d{2}$/.test(bestBefore)

  const isValid = beer !== undefined &&
    container !== undefined &&
    isBestBeforeValid

  return (
    <div>
      <h4>Create storage beer</h4>
      <form
        className="CreateStorageForm"
        onSubmit={(e) => { void doChange(e) }}>
        <h5>Beer</h5>
        <div className='CreateStorageContent'>
          {beer === undefined
            ? <SelectBeer select={(beer: BeerWithIds) => {
              setBeer(beer)
            }} />
            : (<div className='FlexRow'>
                  <div>{beer.name}</div>
                  <div>
                    <button
                      onClick={() => { setBeer(undefined) }}>
                      Change
                    </button>
                </div>
              </div>)
          }
        </div>
        <div>
          <h5>Container</h5>
          <div className='ReviewContent'>
            {container === undefined
              ? <SelectContainer
                  createContainerIf={props.createContainerIf}
                  listContainersIf={props.listContainersIf}
                  select={(container: Container) => {
                    setContainer(container)
                  }} />
              : (<div className='FlexRow'>
                  <div>
                    {`${container.type} ${container.size}`}
                  </div>
                  <div>
                    <button
                      onClick={() => { setContainer(undefined) }}>
                      Change
                    </button>
                  </div>
                </div>)
            }
          </div>
        </div>
        <div className='CreateStorageContent'>
          <div>
            <h5>Best before</h5>
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
          {!isLoading && error !== undefined &&
            'Creating failed. Please check data.' }
        </div>
      </form>
    </div>
  )
}

export default CreateStorage

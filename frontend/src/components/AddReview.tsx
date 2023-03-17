import { useState } from 'react'

import { type Beer } from '../store/beer/types'
import { type Container } from '../store/container/types'
import { useCreateReviewMutation } from '../store/review/api'

import LoadingIndicator from './LoadingIndicator'
import SelectBeer from './SelectBeer'
import SelectContainer from './SelectContainer'

import './AddReview.css'

function AddReview (): JSX.Element {
  const [beer, setBeer] = useState<Beer | undefined>(undefined)
  const [container, setContainer] = useState<Container | undefined>(undefined)
  const [rating, doSetRating] = useState<number>(7)
  const [smell, setSmell] = useState('')
  const [taste, setTaste] = useState('')
  const [
    createReview,
    { isLoading: isCreating, data: createResult }
  ] = useCreateReviewMutation()
  function setRating (rating: number): void {
    if (rating < 4) rating = 4
    if (rating > 10) rating = 10
    doSetRating(rating)
  }
  // TODO add a date picker.
  const [time, setTime] = useState(new Date().toISOString())

  const isMissingData =
    beer === undefined ||
    container === undefined ||
    smell.length === 0 ||
    taste.length === 0

  async function doAddReview (event: any): Promise<void> {
    event.preventDefault()
    if (isMissingData) return
    const review = {
      additionalInfo: event.target.additionalInfo.value.trim(),
      beer: beer.id,
      container: container.id,
      location: event.target.location.value.trim(),
      rating,
      smell: smell.trim(),
      taste: taste.trim(),
      time
    }
    void createReview(review)
  }
  return (
    <div>
      <form onSubmit={(e) => { void doAddReview(e) }}>
        <h3>Add review</h3>
        <div>
          {beer === undefined
            ? <SelectBeer select={(beer: Beer) => {
              setBeer(beer)
            }} />
            : (<div onClick={() => { setBeer(undefined) }}>
                  {`Beer: ${beer.name}`}
              </div>)
          }
        </div>
        <div className="ContainerContent">
          {container === undefined
            ? <SelectContainer select={(container: Container) => {
              setContainer(container)
            }} />
            : (<div onClick={() => { setContainer(undefined) }}>
                {`Container: ${container.type} ${container.size}`}
              </div>)
          }
        </div>
        <div>
          <label>Smell:</label>{' '}
          <textarea
            value={smell}
            onChange={e => { setSmell(e.target.value) }}
          />
        </div>
        <div>
          <label>Taste:</label>{' '}
          <textarea
            value={taste}
            onChange={e => { setTaste(e.target.value) }}
          />
        </div>
        <div>
          <label htmlFor='taste'>Rating:</label>{' '}
          <input
            type='number'
            id='rating'
            min={4}
            max={10}
            value={rating}
            onChange={e => { setRating(parseInt(e.target.value)) }}
          />
        </div>
        <div>
          <label htmlFor='location'>Location:</label>{' '}
          <input type='text' id='location' />
        </div>
        <div>
          <label htmlFor='additionalInfo'>Additional info:</label>{' '}
          <input type='text' id='additionalInfo' />
        </div>
        <div>
          <label htmlFor='time'>Time:</label>{' '}
          <input
            type='text'
            id='time'
            value={time}
            onChange={e => { setTime(e.target.value) }}
          />
        </div>

        <br />

        <div>
          <input type='submit'
            value='Add'
            disabled={
              isCreating ||
              createResult !== undefined ||
              isMissingData
            }
          />
          <LoadingIndicator isLoading={isCreating} />
        </div>
        {createResult !== undefined && (
          <div>{'Created!'}</div>
        )}
      </form>
    </div>
  )
}

export default AddReview

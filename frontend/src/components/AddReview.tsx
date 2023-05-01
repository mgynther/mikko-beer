import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { type BeerWithIds } from '../store/beer/types'
import { type Container } from '../store/container/types'
import { useCreateReviewMutation } from '../store/review/api'

import LoadingIndicator from './LoadingIndicator'
import SelectBeer from './SelectBeer'
import SelectContainer from './SelectContainer'

import './AddReview.css'

function AddReview (): JSX.Element {
  const navigate = useNavigate()
  const [beer, setBeer] = useState<BeerWithIds | undefined>(undefined)
  const [container, setContainer] = useState<Container | undefined>(undefined)
  const [rating, doSetRating] = useState<number>(7)
  const [smell, setSmell] = useState('')
  const [taste, setTaste] = useState('')
  const [
    createReview,
    { isLoading: isCreating, isSuccess, data: createResult }
  ] = useCreateReviewMutation()

  useEffect(() => {
    if (isSuccess && beer !== undefined) {
      // TODO rather navigate to beer when there is a view.
      navigate(`/breweries/${beer.breweries[0]}`)
    }
  }, [isSuccess, beer])

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
            ? <SelectBeer select={(beer: BeerWithIds) => {
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
          <div><label>Smell:</label>{' '}</div>
          <textarea
            className="ReviewArea"
            value={smell}
            onChange={e => { setSmell(e.target.value) }}
          />
        </div>
        <div>
          <div><label>Taste:</label>{' '}</div>
          <textarea
            className="ReviewArea"
            value={taste}
            onChange={e => { setTaste(e.target.value) }}
          />
        </div>
        <div>
          <div>
            <label htmlFor='taste'>Rating:</label>{' '}
          </div>
          <div>{ `${rating}` }</div>
          <input
            className="RatingSlider"
            type='range'
            id='rating'
            min={4}
            max={10}
            value={rating}
            onChange={e => { setRating(parseInt(e.target.value)) }}
          />
        </div>
        <div>
          <input type='text' placeholder='Location' id='location' />
        </div>
        <div>
          <input
            type='text'
            placeholder='Additional info'
            id='additionalInfo'
          />
        </div>
        <div>
          <input
            type='text'
            placeholder='Time'
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
      </form>
    </div>
  )
}

export default AddReview

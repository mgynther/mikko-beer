import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { type BeerWithIds } from '../../store/beer/types'
import { type Container } from '../../store/container/types'
import { useCreateReviewMutation } from '../../store/review/api'

import LoadingIndicator from '../common/LoadingIndicator'
import SelectBeer from '../beer/SelectBeer'
import SelectContainer from '../container/SelectContainer'

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
      navigate(`/beers/${beer.id}`)
    }
  }, [isSuccess, beer])

  function setRating (rating: number): void {
    if (rating < 4) rating = 4
    if (rating > 10) rating = 10
    doSetRating(rating)
  }
  function localDateTime (): string {
    function str (num: number): string {
      if (num < 10) {
        return `0${num}`
      }
      return `${num}`
    }
    const date = new Date()
    const y = date.getFullYear()
    const mo = date.getMonth() + 1
    const d = date.getDate()
    const h = date.getHours()
    const mi = date.getMinutes()
    return `${str(y)}-${str(mo)}-${str(d)}T${str(h)}:${str(mi)}`
  }
  const [time, setTime] = useState(localDateTime())
  // Very crude validation may let garbage pass but assuming datetime-local
  // implementations set invalid or missing input to an empty string or
  // similar it should be fine.
  const isTimeValid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(time)

  const isMissingData =
    beer === undefined ||
    container === undefined ||
    smell.length === 0 ||
    taste.length === 0 ||
    !isTimeValid

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
      time: new Date(time).toISOString()
    }
    void createReview(review)
  }
  return (
    <div>
      <form onSubmit={(e) => { void doAddReview(e) }}>
        <h3>Add review</h3>
        <div>
          <h5>Beer</h5>
          <div className='AddReviewContent'>
            {beer === undefined
              ? <SelectBeer select={(beer: BeerWithIds) => {
                setBeer(beer)
              }} />
              : (<div onClick={() => { setBeer(undefined) }}>
                    {beer.name}
                </div>)
            }
          </div>
        </div>
        <div>
          <h5>Container</h5>
          <div className='AddReviewContent'>
            {container === undefined
              ? <SelectContainer select={(container: Container) => {
                setContainer(container)
              }} />
              : (<div onClick={() => { setContainer(undefined) }}>
                  {`${container.type} ${container.size}`}
                </div>)
            }
          </div>
        </div>
        <div>
          <h5>Smell</h5>
          <div className='AddReviewContent'>
            <textarea
              className='ReviewArea'
              value={smell}
              onChange={e => { setSmell(e.target.value) }}
            />
          </div>
        </div>
        <div>
          <h5>Taste</h5>
          <div className='AddReviewContent'>
            <textarea
              className='ReviewArea'
              value={taste}
              onChange={e => { setTaste(e.target.value) }}
            />
          </div>
        </div>
        <div>
          <h5>Rating</h5>
          <div className='AddReviewContent'>
            <div className='RatingNumber'>{ `${rating}` }</div>
            <input
              className='RatingSlider'
              type='range'
              id='rating'
              min={4}
              max={10}
              value={rating}
              onChange={e => { setRating(parseInt(e.target.value)) }}
            />
          </div>
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
            type='datetime-local'
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

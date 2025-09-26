import React, { useEffect, useState } from 'react'

import type {
  BeerWithIds,
  SelectBeerIf
} from '../../core/beer/types'
import type { Container } from '../../core/container/types'
import type { Location, SearchLocationIf } from '../../core/location/types'
import type {
  ReviewContainerIf,
  JoinedReview,
  ReviewRequest
} from '../../core/review/types'
import type { SearchIf } from '../../core/search/types'

import SelectBeer from '../beer/SelectBeer'
import SelectContainer from '../container/SelectContainer'
import SearchLocation from '../location/SearchLocation'

import { pad } from '../util'

import ContainerInfo from '../container/ContainerInfo'
import Slider from '../common/Slider'

import '../common/FlexRow.css'

import './ReviewEditor.css'

import Button from '../common/Button'

export interface InitialReview {
  joined: JoinedReview
  review: ReviewRequest
}

interface Props {
  searchIf: SearchIf
  selectBeerIf: SelectBeerIf
  reviewContainerIf: ReviewContainerIf
  searchLocationIf: SearchLocationIf
  currentDate: Date
  initialReview: InitialReview | undefined
  isFromStorage: boolean
  onChange: (review: ReviewRequest | undefined) => void
}

function ReviewEditor (props: Props): React.JSX.Element {
  function getInitialBeer (): BeerWithIds | undefined {
    if (props.initialReview === undefined) return undefined
    return {
      id: props.initialReview.joined.beerId,
      name: props.initialReview.joined.beerName,
      breweries: props.initialReview.joined.breweries.map(
        brewery => brewery.id
      ),
      styles: props.initialReview.joined.styles.map(style => style.id)
    }
  }

  function getInitialContainer (): Container | undefined {
    if (props.initialReview === undefined) return undefined
    return {
      ...props.initialReview.joined.container
    }
  }

  function getInitialLocation (): Location | undefined {
    if (props.initialReview === undefined) return undefined
    if (props.initialReview.joined.location === undefined) return undefined
    return {
      ...props.initialReview.joined.location
    }
  }

  const [beer, setBeer] = useState<BeerWithIds | undefined>(getInitialBeer())
  const [container, setContainer] = useState<Container | undefined>(
    getInitialContainer()
  )
  const [rating, doSetRating] = useState<number>(
    props.initialReview?.review.rating ?? 7
  )
  const [smell, setSmell] = useState(props.initialReview?.review.smell ?? '')
  const [taste, setTaste] = useState(props.initialReview?.review.taste ?? '')
  const [additionalInfo, setAdditionalInfo] = useState(
    props.initialReview?.review.additionalInfo ?? ''
  )
  const [location, setLocation] = useState<Location | undefined>(
    getInitialLocation()
  )

  function setRating (rating: number): void {
    let result = rating
    if (result < 4) result = 4
    if (result > 10) result = 10
    doSetRating(result)
  }

  function localDateTime (): string {
    const date = props.initialReview === undefined
      ? props.currentDate
      : new Date(props.initialReview.review.time)
    const y = date.getFullYear()
    const mo = date.getMonth() + 1
    const d = date.getDate()
    const h = date.getHours()
    const mi = date.getMinutes()
    return `${pad(y)}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`
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

  useEffect(() => {
    if (isMissingData) {
      props.onChange(undefined)
      return
    }
    props.onChange({
      additionalInfo,
      beer: beer.id,
      container: container.id,
      location: location?.id ?? '',
      rating,
      smell,
      taste,
      time: new Date(time).toISOString()
    })
  }, [
    isMissingData,
    additionalInfo,
    beer,
    container,
    location,
    rating,
    smell,
    taste,
    time
  ])

  return (
    <div>
      <div>
        <h5>Beer</h5>
        <div className='ReviewContent'>
          {beer === undefined
            ? <SelectBeer
                searchIf={props.searchIf}
                select={(beer: BeerWithIds) => {
                  setBeer(beer)
                }}
                selectBeerIf={props.selectBeerIf}
              />
            : (<div className='FlexRow'>
                  <div>{beer.name}</div>
                  {!props.isFromStorage && (
                    <div>
                      <Button
                        onClick={() => { setBeer(undefined) }}
                        text='Change'
                      />
                    </div>
                  )}
              </div>)
          }
        </div>
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
                {!props.isFromStorage && (
                  <div>
                    <Button
                      onClick={() => { setContainer(undefined) }}
                      text='Change'
                    />
                  </div>
                )}
              </div>)
          }
        </div>
      </div>
      <div>
        <h5>Other info</h5>
        <div className='ReviewContent'>
          <div>
            <input
              type='text'
              placeholder='Additional info'
              value={additionalInfo}
              onChange={(e) => { setAdditionalInfo(e.target.value) }}
            />
          </div>
          <div>
            {location === undefined ?
              <SearchLocation
                getConfirm={() => confirm}
                isCreateEnabled={true}
                placeholderText={'Location'}
                searchLocationIf={props.searchLocationIf}
                searchIf={props.searchIf}
                select={setLocation}
              />
            : (
              <div className='FlexRow'>
                <div>{location.name}</div>
                <Button
                  onClick={() => { setLocation(undefined); }}
                  text='Remove'
                />
              </div>
            )}
          </div>
          <div>
            <input
              type='datetime-local'
              id='time'
              value={time}
              onChange={e => { setTime(e.target.value) }}
            />
          </div>
        </div>
      </div>
      <div>
        <h5>Smell</h5>
        <div className='ReviewContent'>
          <textarea
            className='ReviewArea'
            placeholder='Smell'
            value={smell}
            onChange={e => { setSmell(e.target.value) }}
          />
        </div>
      </div>
      <div>
        <h5>Taste</h5>
        <div className='ReviewContent'>
          <textarea
            className='ReviewArea'
            placeholder='Taste'
            value={taste}
            onChange={e => { setTaste(e.target.value) }}
          />
        </div>
      </div>
      <div>
        <h5>Rating</h5>
        <div className='ReviewContent'>
          <div className='RatingNumber'>{ `${rating}` }</div>
          <Slider
            className='RatingSlider'
            min={4}
            max={10}
            step={1}
            value={rating}
            setValue={(value: number) => { setRating(value); } }
          />
        </div>
      </div>
    </div>
  )
}

export default ReviewEditor

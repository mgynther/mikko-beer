import React from 'react'

import { useParams } from 'react-router-dom'

import { useGetBeerQuery } from '../store/beer/api'

import { joinSortedNames } from './util'

import LoadingIndicator from './LoadingIndicator'

import './Beer.css'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

function Beer (): JSX.Element {
  const { beerId } = useParams()
  if (beerId === undefined) {
    throw new Error('Beer component without beerId. Should not happen.')
  }
  const { data: beerData, isLoading } = useGetBeerQuery(beerId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (beerData?.beer === undefined) return <NotFound />
  const beer = beerData.beer
  return (
    <div>
      <h3>{ beer.name }</h3>
      <div className='BeerInfo'>
        <h5>Breweries</h5>
        <div>{joinSortedNames(beer.breweries)}</div>
      </div>
      <div className='BeerInfo'>
        <h5>Styles</h5>
        <div>{joinSortedNames(beer.styles)}</div>
      </div>
    </div>
  )
}

export default Beer

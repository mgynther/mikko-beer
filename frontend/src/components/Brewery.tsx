import React from 'react'

import { useParams } from 'react-router-dom'

import { useGetBreweryQuery } from '../store/brewery/api'

import LoadingIndicator from './LoadingIndicator'

function NotFound (): JSX.Element {
  return <div>Not found</div>
}

function Brewery (): JSX.Element {
  const { breweryId } = useParams()
  if (breweryId === undefined) {
    throw new Error('Brewery component without breweryId. Should not happen.')
  }
  const { data: breweryData, isLoading } = useGetBreweryQuery(breweryId)
  if (isLoading) return <LoadingIndicator isLoading={true} />
  if (breweryData?.brewery === undefined) return <NotFound />
  const brewery = breweryData.brewery
  return <h3>{ brewery.name }</h3>
}

export default Brewery

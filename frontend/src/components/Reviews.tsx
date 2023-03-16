import { useListBeersQuery } from '../store/beer/api'
import { type Beer } from '../store/beer/types'
import { useListBreweriesQuery } from '../store/brewery/api'
import { useListContainersQuery } from '../store/container/api'
import { useListStylesQuery } from '../store/style/api'
import { useListReviewsQuery } from '../store/review/api'
import { toBeerMap } from '../store/beer/util'
import { toBreweryMap } from '../store/brewery/util'
import { toContainerMap } from '../store/container/util'
import { toStyleMap } from '../store/style/util'
import { type Review } from '../store/review/types'
import { toString } from './util'

function Reviews (): JSX.Element {
  const { data: beerData, isLoading: areBeersLoading } = useListBeersQuery()
  const beerMap = toBeerMap(beerData)
  const { data: breweryData, isLoading: areBreweriesLoading } =
    useListBreweriesQuery()
  const breweryMap = toBreweryMap(breweryData)
  const { data: containerData, isLoading: areContainersLoading } =
    useListContainersQuery()
  const containerMap = toContainerMap(containerData)
  const { data: styleData, isLoading: areStylesLoading } =
    useListStylesQuery()
  const styleMap = toStyleMap(styleData)
  const { data: reviewData, isLoading: areReviewsLoading } =
    useListReviewsQuery()
  const isLoading = areBeersLoading ||
    areBreweriesLoading ||
    areContainersLoading ||
    areReviewsLoading ||
    areStylesLoading

  function formatDate (date: Date): string {
    return date.toISOString().substring(0, 10)
  }
  return (
    <div>
      <h3>Reviews</h3>
      {isLoading && (<div>Loading...</div>)}
      <table className="Review-table">
        <thead>
          <tr>
            <th>Breweries</th>
            <th>Name</th>
            <th>Styles</th>
            <th>Smell</th>
            <th>Taste</th>
            <th>Rating</th>
            <th>Time</th>
            <th>Container</th>
            <th>Location</th>
            <th>Additional info</th>
          </tr>
        </thead>
        <tbody>
          {reviewData?.reviews.map((review: Review) => {
            const beer: Beer = beerMap[review.beer]
            const container = containerMap[review.container]
            return (
              <tr key={review.id}>
                <td>
                  {toString(beer.breweries.map(b => breweryMap[b].name))}
                </td>
                <td>{beer.name}</td>
                <td>
                  {toString(beer.styles.map(s => styleMap[s].name))}
                </td>
                <td>{review.smell}</td>
                <td>{review.taste}</td>
                <td>{review.rating}</td>
                <td>{formatDate(new Date(review.time))}</td>
                <td>{container.type} {container.size}</td>
                <td>{review.location}</td>
                <td>{review.additionalInfo}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Reviews

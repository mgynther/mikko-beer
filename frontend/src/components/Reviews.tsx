import { useListReviewsQuery } from '../store/review/api'
import { Review } from '../store/review/types'

function Reviews() {
  const { data: reviewData, isLoading } = useListReviewsQuery();
  return (
    <div>
      <h3>Reviews</h3>
      {isLoading && (<div>Loading...</div>)}
      <table>
        <tr>
          <th>Smell</th>
          <th>Taste</th>
        </tr>
        {reviewData?.reviews.map((review: Review) => (
          <tr key={review.id}>
            <td>{review.smell}</td>
            <td>{review.taste}</td>
          </tr>
        ))}
      </table>
    </div>
  )
}

export default Reviews;

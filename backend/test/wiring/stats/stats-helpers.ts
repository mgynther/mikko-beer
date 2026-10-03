interface ReviewSummary {
  reviewAverage: string
  reviewCount: string
  reviewStandardDeviation: string
  reviewMedian: string
  reviewMode: string
}

// What a single review sums up to, as the stats answer it.
export function oneReview(rating: number): ReviewSummary {
  return {
    reviewAverage: `${rating}.00`,
    reviewCount: '1',
    reviewStandardDeviation: '0.00',
    reviewMedian: `${rating}.00`,
    reviewMode: `${rating}`,
  }
}

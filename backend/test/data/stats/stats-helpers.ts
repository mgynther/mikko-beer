import type { Review } from '../../../src/core/review/review.js'
import { formatInteger, round } from '../../../src/data/stats/format.js'

function ratingsOf(reviews: Review[]): number[] {
  return reviews.map((r) => r.rating)
}

function meanValue(ratings: number[]): number {
  if (ratings.length === 0) return NaN
  const sum = ratings.reduce((s, r) => s + r, 0)
  return sum / ratings.length
}

export function avg(reviews: Review[]): string {
  return avgRatings(ratingsOf(reviews))
}

export function avgRatings(ratings: number[]): string {
  return round(meanValue(ratings))
}

export function stdDev(reviews: Review[]): string {
  const ratings = ratingsOf(reviews)
  return stdDevRatings(ratings)
}

export function stdDevRatings(ratings: number[]): string {
  if (ratings.length === 0) return round(null)
  const mean = meanValue(ratings)
  const variance =
    ratings.reduce((s, r) => s + (r - mean) ** 2, 0) / ratings.length
  return round(Math.sqrt(variance))
}

export function median(reviews: Review[]): string {
  const ratings = ratingsOf(reviews)
  return medianRatings(ratings)
}

export function medianRatings(ratings: number[]): string {
  if (ratings.length === 0) return round(null)
  const sortedRatings = [...ratings].sort((a, b) => a - b)
  const mid = sortedRatings.length / 2
  if (Number.isInteger(mid)) {
    return round((sortedRatings[mid - 1] + sortedRatings[mid]) / 2)
  }
  return round(sortedRatings[Math.floor(mid)])
}

// Mirrors Postgres MODE() WITHIN GROUP (ORDER BY rating ASC):
// on ties, returns the lowest tied rating.
export function mode(reviews: Review[]): string {
  const ratings = ratingsOf(reviews)
  return modeRatings(ratings)
}

export function modeRatings(ratings: number[]): string {
  if (ratings.length === 0) {
    return formatInteger(null)
  }
  const counts = new Map<number, number>()
  ratings.forEach((rating) => {
    const currentCount = counts.get(rating) ?? 0
    counts.set(rating, currentCount + 1)
  })
  let best = ratings[0]
  let bestCount = 0
  for (const [value, count] of counts) {
    if (count > bestCount || (count === bestCount && value < best)) {
      best = value
      bestCount = count
    }
  }
  return formatInteger(best)
}

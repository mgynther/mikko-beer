export enum StatsTags {
  Annual = 'Annual',
  AnnualContainer = 'AnnualContainer',
  Brewery = 'Brewery',
  Container = 'Container',
  Location = 'Location',
  Overall = 'Overall',
  Rating = 'Rating',
  Style = 'Style'
}

export function allStatsTagTypes (): string[] {
  return [
    StatsTags.Annual,
    StatsTags.AnnualContainer,
    StatsTags.Brewery,
    StatsTags.Container,
    StatsTags.Location,
    StatsTags.Overall,
    StatsTags.Rating,
    StatsTags.Style
  ]
}

export function beerStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Brewery, StatsTags.Style]
}

export function breweryStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Brewery]
}

export function containerStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Container]
}

export function locationStatsTagTypes (): string[] {
  return [StatsTags.Location, StatsTags.Overall]
}

export function reviewStatsTagTypes (): string[] {
  return allStatsTagTypes()
}

export function styleStatsTagTypes (): string[] {
  return [StatsTags.Overall, StatsTags.Style]
}

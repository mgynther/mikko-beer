import type { BeerHandlers } from './beer/beer.js'
import type { BreweryHandlers } from './brewery/brewery.js'
import type { ContainerHandlers } from './container/container.js'
import type { LocationHandlers } from './location/location.js'
import type { ReviewHandlers } from './review/review.js'
import type { StatsHandlers } from './stats/stats.js'
import type { StorageHandlers } from './storage/storage.js'
import type { StyleHandlers } from './style/style.js'
import type { SignInMethodHandlers } from './user/sign-in-method.js'
import type { UserHandlers } from './user/user.js'

export interface Api {
  beer: BeerHandlers
  brewery: BreweryHandlers
  container: ContainerHandlers
  location: LocationHandlers
  review: ReviewHandlers
  signInMethod: SignInMethodHandlers
  stats: StatsHandlers
  storage: StorageHandlers
  style: StyleHandlers
  user: UserHandlers
}

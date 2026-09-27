import type { Api } from '../api.js'
import type { Router } from './router.js'
import { beerRoutes } from './beer/routes.js'
import { breweryRoutes } from './brewery/routes.js'
import { containerRoutes } from './container/routes.js'
import { locationRoutes } from './location/routes.js'
import { reviewRoutes } from './review/routes.js'
import { statsRoutes } from './stats/routes.js'
import { storageRoutes } from './storage/routes.js'
import { styleRoutes } from './style/routes.js'
import { signInMethodRoutes } from './user/sign-in-method-routes.js'
import { userRoutes } from './user/routes.js'

export function registerRoutes(router: Router, api: Api): void {
  beerRoutes(router, api.beer)
  breweryRoutes(router, api.brewery)
  containerRoutes(router, api.container)
  locationRoutes(router, api.location)
  reviewRoutes(router, api.review)
  statsRoutes(router, api.stats)
  storageRoutes(router, api.storage)
  styleRoutes(router, api.style)
  userRoutes(router, api.user)
  signInMethodRoutes(router, api.signInMethod)
}

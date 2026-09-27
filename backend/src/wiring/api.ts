import type { Api } from '../web/api.js'

import { createBeerHandlers } from './beer/beer.handlers.js'
import { createBreweryHandlers } from './brewery/brewery.handlers.js'
import { createContainerHandlers } from './container/container.handlers.js'
import { createLocationHandlers } from './location/location.handlers.js'
import { createReviewHandlers } from './review/review.handlers.js'
import { createStatsHandlers } from './stats/stats.handlers.js'
import { createStorageHandlers } from './storage/storage.handlers.js'
import { createStyleHandlers } from './style/style.handlers.js'
import { createSignInMethodHandlers } from './user/sign-in-method/sign-in-method.handlers.js'
import { createUserHandlers } from './user/user.handlers.js'
import type { Context } from './context.js'

export function createApi(context: Context): Api {
  return {
    beer: createBeerHandlers(context),
    brewery: createBreweryHandlers(context),
    container: createContainerHandlers(context),
    location: createLocationHandlers(context),
    review: createReviewHandlers(context),
    signInMethod: createSignInMethodHandlers(context),
    stats: createStatsHandlers(context),
    storage: createStorageHandlers(context),
    style: createStyleHandlers(context),
    user: createUserHandlers(context),
  }
}

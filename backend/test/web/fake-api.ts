import type { Api } from '../../src/web/api.js'

export type ApiOverrides = {
  [Entity in keyof Api]?: Partial<Api[Entity]>
}

// Stands in for a handler a test does not expect to be called, and fails
// the request with a message naming it if it is.
function unexpected(name: string): () => Promise<never> {
  return (): Promise<never> =>
    Promise.reject(new Error(`unexpected call to ${name}`))
}

export function fakeApi(overrides: ApiOverrides): Api {
  return {
    beer: {
      create: unexpected('beer.create'),
      update: unexpected('beer.update'),
      find: unexpected('beer.find'),
      list: unexpected('beer.list'),
      search: unexpected('beer.search'),
      ...overrides.beer,
    },
    brewery: {
      create: unexpected('brewery.create'),
      update: unexpected('brewery.update'),
      find: unexpected('brewery.find'),
      list: unexpected('brewery.list'),
      search: unexpected('brewery.search'),
      ...overrides.brewery,
    },
    container: {
      create: unexpected('container.create'),
      update: unexpected('container.update'),
      find: unexpected('container.find'),
      list: unexpected('container.list'),
      ...overrides.container,
    },
    location: {
      create: unexpected('location.create'),
      update: unexpected('location.update'),
      find: unexpected('location.find'),
      list: unexpected('location.list'),
      search: unexpected('location.search'),
      ...overrides.location,
    },
    review: {
      create: unexpected('review.create'),
      update: unexpected('review.update'),
      find: unexpected('review.find'),
      listByBeer: unexpected('review.listByBeer'),
      listByBrewery: unexpected('review.listByBrewery'),
      listByLocation: unexpected('review.listByLocation'),
      listByStyle: unexpected('review.listByStyle'),
      list: unexpected('review.list'),
      ...overrides.review,
    },
    signInMethod: {
      signIn: unexpected('signInMethod.signIn'),
      refresh: unexpected('signInMethod.refresh'),
      signOut: unexpected('signInMethod.signOut'),
      changePassword: unexpected('signInMethod.changePassword'),
      ...overrides.signInMethod,
    },
    stats: {
      getOverall: unexpected('stats.getOverall'),
      getAnnual: unexpected('stats.getAnnual'),
      getAnnualContainer: unexpected('stats.getAnnualContainer'),
      getBrewery: unexpected('stats.getBrewery'),
      getBreweryCountry: unexpected('stats.getBreweryCountry'),
      getContainer: unexpected('stats.getContainer'),
      getLocation: unexpected('stats.getLocation'),
      getRating: unexpected('stats.getRating'),
      getStyle: unexpected('stats.getStyle'),
      ...overrides.stats,
    },
    storage: {
      getAnnualStats: unexpected('storage.getAnnualStats'),
      getMonthlyStats: unexpected('storage.getMonthlyStats'),
      create: unexpected('storage.create'),
      update: unexpected('storage.update'),
      delete: unexpected('storage.delete'),
      find: unexpected('storage.find'),
      listByBeer: unexpected('storage.listByBeer'),
      listByBrewery: unexpected('storage.listByBrewery'),
      listByStyle: unexpected('storage.listByStyle'),
      list: unexpected('storage.list'),
      ...overrides.storage,
    },
    style: {
      create: unexpected('style.create'),
      update: unexpected('style.update'),
      find: unexpected('style.find'),
      list: unexpected('style.list'),
      ...overrides.style,
    },
    user: {
      create: unexpected('user.create'),
      find: unexpected('user.find'),
      list: unexpected('user.list'),
      delete: unexpected('user.delete'),
      ...overrides.user,
    },
  }
}

import type {
  BeerList,
  ListBeersHookIf,
  UseListBeers,
  ValidateBeerList,
  ValidateBeerListOrUndefined,
} from './types'
import type { Pagination } from '../types'

const listBeers: (
  useListBeers: UseListBeers,
  validateBeerList: ValidateBeerList,
  validateBeerListOrUndefined: ValidateBeerListOrUndefined,
) => ListBeersHookIf = (
  useListBeers,
  validateBeerList,
  validateBeerListOrUndefined,
) => {
  const listBeersIf: ListBeersHookIf = {
    useList: () => {
      const { list, data, isFetching, isUninitialized } = useListBeers()
      return {
        beerList: validateBeerListOrUndefined(data),
        list: async (pagination: Pagination): Promise<BeerList> =>
          validateBeerList(await list(pagination)),
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listBeersIf
}

export default listBeers

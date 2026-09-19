import type {
  BreweryList,
  ListBreweriesHookIf,
  UseListBreweries,
  ValidateBreweryList,
  ValidateBreweryListOrUndefined,
} from './types'
import type { Pagination } from '../types'

const listBreweries: (
  useListBreweries: UseListBreweries,
  validateBreweryList: ValidateBreweryList,
  validateBreweryListOrUndefined: ValidateBreweryListOrUndefined,
) => ListBreweriesHookIf = (
  useListBreweries,
  validateBreweryList,
  validateBreweryListOrUndefined,
) => {
  const listBreweriesIf: ListBreweriesHookIf = {
    useList: () => {
      const { list, data, isFetching, isUninitialized } = useListBreweries()
      return {
        breweryList: validateBreweryListOrUndefined(data),
        list: async (pagination: Pagination): Promise<BreweryList> =>
          validateBreweryList(await list(pagination)),
        isLoading: isFetching,
        isUninitialized,
      }
    },
  }
  return listBreweriesIf
}

export default listBreweries

import type {
  GetBreweryHookIf,
  UseGetBrewery,
  ValidateBreweryOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const getBrewery: (
  useGetBrewery: UseGetBrewery,
  validateBreweryOrUndefined: ValidateBreweryOrUndefined,
) => GetBreweryHookIf = (useGetBrewery, validateBreweryOrUndefined) => {
  const getBreweryIf: GetBreweryHookIf = {
    useGet: (breweryId: string) => {
      const { data, isLoading } = useGetBrewery(breweryId)
      return {
        brewery: validateBreweryOrUndefined(
          unwrapMemberOrUndefined(data, 'brewery'),
        ),
        isLoading,
      }
    },
  }
  return getBreweryIf
}

export default getBrewery

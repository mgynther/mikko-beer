import type {
  GetBeerHookIf,
  UseGetBeer,
  ValidateBeerOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const getBeer: (
  useGetBeer: UseGetBeer,
  validateBeerOrUndefined: ValidateBeerOrUndefined,
) => GetBeerHookIf = (useGetBeer, validateBeerOrUndefined) => {
  const getBeerIf: GetBeerHookIf = {
    useGetBeer: (beerId: string) => {
      const { data, isLoading } = useGetBeer(beerId)
      return {
        beer: validateBeerOrUndefined(unwrapMemberOrUndefined(data, 'beer')),
        isLoading,
      }
    },
  }
  return getBeerIf
}

export default getBeer

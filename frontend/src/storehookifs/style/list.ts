import type { ListStylesHookIf } from '../../core/style/types'
import { useListStylesQuery } from '../../store/style/api'
import { validateStyleListOrUndefined } from '../../validation/style'

const listStyles: () => ListStylesHookIf = () => {
  const listStylesIf: ListStylesHookIf = {
    useList: () => {
      const { data, isLoading } = useListStylesQuery()
      return {
        styles: validateStyleListOrUndefined(data)?.styles,
        isLoading,
      }
    },
  }
  return listStylesIf
}

export default listStyles

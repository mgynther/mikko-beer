import type { ListStylesIf } from "../../core/style/types"
import { useListStylesQuery } from "../../store/style/api"
import { validateStyleListOrUndefined } from "../../validation/style"

const listStyles: () => ListStylesIf = () => {
  const listStylesIf: ListStylesIf = {
    useList: () => {
      const { data, isLoading } = useListStylesQuery()
      return {
        styles: validateStyleListOrUndefined(data)?.styles,
        isLoading
      }
    }
  }
  return listStylesIf
}

export default listStyles

import type { ListStylesIf } from "../../core/style/types"
import { useListStylesQuery } from "../../store/style/api"

const listStyles: () => ListStylesIf = () => {
  const listStylesIf: ListStylesIf = {
    useList: () => {
      const { data, isLoading } = useListStylesQuery()
      return {
        styles: data?.styles,
        isLoading
      }
    }
  }
  return listStylesIf
}

export default listStyles

import type { GetStyleIf } from "../../core/style/types"
import { useGetStyleQuery } from "../../store/style/api"

const getStyle: () => GetStyleIf = () => {
  const getStyleIf: GetStyleIf = {
    useGet: (styleId: string) => {
      const { data, isLoading } = useGetStyleQuery(styleId)
      return {
        style: data?.style,
        isLoading
      }
    }
  }
  return getStyleIf
}

export default getStyle

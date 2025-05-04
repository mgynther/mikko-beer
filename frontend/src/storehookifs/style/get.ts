import type { GetStyleIf } from "../../core/style/types"
import { useGetStyleQuery } from "../../store/style/api"
import {
  validateStyleWithParentsAndChildrenOrUndefined
} from "../../validation/style"

const getStyle: () => GetStyleIf = () => {
  const getStyleIf: GetStyleIf = {
    useGet: (styleId: string) => {
      const { data, isLoading } = useGetStyleQuery(styleId)
      return {
        style: validateStyleWithParentsAndChildrenOrUndefined(data?.style),
        isLoading
      }
    }
  }
  return getStyleIf
}

export default getStyle

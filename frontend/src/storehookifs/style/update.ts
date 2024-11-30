import type { StyleWithParentIds, UpdateStyleIf } from "../../core/style/types"
import { useUpdateStyleMutation } from "../../store/style/api"

const updateStyle: () => UpdateStyleIf = () => {
  const updateStyleIf: UpdateStyleIf = {
    useUpdate: () => {
      const [
        updateStyle,
        { isError, isLoading, isSuccess }
      ] = useUpdateStyleMutation()
      return {
        update: async (style: StyleWithParentIds) => {
          await updateStyle(style)
        },
        hasError: isError,
        isLoading,
        isSuccess
      }
    }
  }
  return updateStyleIf
}

export default updateStyle

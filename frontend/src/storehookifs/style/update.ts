import type { StyleWithParentIds, UpdateStyleIf } from '../../core/style/types'
import { useUpdateStyleMutation } from '../../store/style/api'
import { validateStyle } from '../../validation/style'

const updateStyle: () => UpdateStyleIf = () => {
  const updateStyleIf: UpdateStyleIf = {
    useUpdate: () => {
      const [updateStyle, { isError, isLoading, isSuccess }] =
        useUpdateStyleMutation()
      return {
        update: async (style: StyleWithParentIds): Promise<void> => {
          const result = await updateStyle(style).unwrap()
          validateStyle(result.style)
        },
        hasError: isError,
        isLoading,
        isSuccess,
      }
    },
  }
  return updateStyleIf
}

export default updateStyle

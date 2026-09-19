import type {
  StyleWithParentIds,
  UpdateStyleHookIf,
  UseUpdateStyle,
  ValidateStyle,
} from './types'
import { unwrapMember } from '../envelope'

const updateStyle: (
  useUpdateStyle: UseUpdateStyle,
  validateStyle: ValidateStyle,
) => UpdateStyleHookIf = (useUpdateStyle, validateStyle) => {
  const updateStyleIf: UpdateStyleHookIf = {
    useUpdate: () => {
      const { update, hasError, isLoading, isSuccess } = useUpdateStyle()
      return {
        update: async (style: StyleWithParentIds): Promise<void> => {
          const result = await update(style)
          validateStyle(unwrapMember(result, 'style'))
        },
        hasError,
        isLoading,
        isSuccess,
      }
    },
  }
  return updateStyleIf
}

export default updateStyle

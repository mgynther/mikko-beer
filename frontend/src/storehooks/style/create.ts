import type {
  CreateStyleHookIf,
  CreateStyleRequest,
  UseCreateStyle,
  ValidateStyleOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const createStyle: (
  useCreateStyle: UseCreateStyle,
  validateStyleOrUndefined: ValidateStyleOrUndefined,
) => CreateStyleHookIf = (useCreateStyle, validateStyleOrUndefined) => {
  const createStyleIf: CreateStyleHookIf = {
    useCreate: () => {
      const { create, data, hasError, isLoading, isSuccess } = useCreateStyle()
      return {
        create: async (style: CreateStyleRequest): Promise<void> => {
          await create(style)
        },
        createdStyle: validateStyleOrUndefined(
          unwrapMemberOrUndefined(data, 'style'),
        ),
        hasError,
        isLoading,
        isSuccess,
      }
    },
  }
  return createStyleIf
}

export default createStyle

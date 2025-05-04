import type { CreateStyleIf, CreateStyleRequest } from "../../core/style/types"
import { useCreateStyleMutation } from "../../store/style/api"
import { validateStyleOrUndefined } from "../../validation/style"

const createStyle: () => CreateStyleIf = () => {
  const createStyleIf: CreateStyleIf = {
    useCreate: () => {
      const [
        createStyle,
        { data, isError, isLoading, isSuccess }
      ] = useCreateStyleMutation()
      return {
        create: async (style: CreateStyleRequest) => {
          await createStyle(style)
        },
        createdStyle: validateStyleOrUndefined(data?.style),
        hasError: isError,
        isLoading,
        isSuccess
      }
    }
  }
  return createStyleIf
}

export default createStyle

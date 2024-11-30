import type { CreateStyleIf, CreateStyleRequest } from "../../core/style/types"
import { useCreateStyleMutation } from "../../store/style/api"

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
        createdStyle: data?.style,
        hasError: isError,
        isLoading,
        isSuccess
      }
    }
  }
  return createStyleIf
}

export default createStyle

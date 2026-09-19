import type {
  GetStyleHookIf,
  UseGetStyle,
  ValidateStyleWithParentsAndChildrenOrUndefined,
} from './types'
import { unwrapMemberOrUndefined } from '../envelope'

const getStyle: (
  useGetStyle: UseGetStyle,
  validateStyle: ValidateStyleWithParentsAndChildrenOrUndefined,
) => GetStyleHookIf = (useGetStyle, validateStyle) => {
  const getStyleIf: GetStyleHookIf = {
    useGet: (styleId: string) => {
      const { data, isLoading } = useGetStyle(styleId)
      return {
        style: validateStyle(unwrapMemberOrUndefined(data, 'style')),
        isLoading,
      }
    },
  }
  return getStyleIf
}

export default getStyle

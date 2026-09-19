import type {
  ListStylesHookIf,
  UseListStyles,
  ValidateStyleListOrUndefined,
} from './types'

const listStyles: (
  useListStyles: UseListStyles,
  validateStyleListOrUndefined: ValidateStyleListOrUndefined,
) => ListStylesHookIf = (useListStyles, validateStyleListOrUndefined) => {
  const listStylesIf: ListStylesHookIf = {
    useList: () => {
      const { data, isLoading } = useListStyles()
      return {
        styles: validateStyleListOrUndefined(data)?.styles,
        isLoading,
      }
    },
  }
  return listStylesIf
}

export default listStyles

import { selectTheme, setTheme } from './internal/theme/reducer'
import type { Theme } from './internal/theme/reducer'
import { useDispatch, useSelector } from './internal/hooks'

// The theme is state and nothing else: there is no response to validate and
// no reason for a storehook to stand between the store and the component
// that offers the choice.
export interface ThemeSelection {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export function useTheme(): ThemeSelection {
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch()
  return {
    theme,
    setTheme: (selected: Theme): void => {
      dispatch(setTheme(selected))
    },
  }
}

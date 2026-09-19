import { selectState, setState } from './internal/nav-menu/reducer'
import type { NavMenuExpandedState } from './internal/nav-menu/reducer'
import { useDispatch, useSelector } from './internal/hooks'

// Whether the nav menu is open is state and nothing else. See store/theme.ts.
export interface NavMenu {
  navMenuState: NavMenuExpandedState
  setNavMenuState: (navMenuState: NavMenuExpandedState) => void
}

export function useNavMenu(): NavMenu {
  const navMenuState = useSelector(selectState)
  const dispatch = useDispatch()
  return {
    navMenuState,
    setNavMenuState: (selected: NavMenuExpandedState): void => {
      dispatch(setState(selected))
    },
  }
}

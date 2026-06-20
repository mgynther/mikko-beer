import type { UseDebounce } from '../types'

type UseSearchField = () => {
  activate: () => void
  isActive: boolean
}

export interface SearchFieldHookIf {
  useSearchField: UseSearchField
}

export interface SearchFieldIf {
  useSearchField: UseSearchField
  useDebounce: UseDebounce<string>
}

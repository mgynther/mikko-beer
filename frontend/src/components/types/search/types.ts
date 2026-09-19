import type { UseDebounce } from '../types'

type UseSearchField = () => {
  activate: () => void
  isActive: boolean
}

export interface SearchFieldIf {
  useSearchField: UseSearchField
  useDebounce: UseDebounce<string>
}

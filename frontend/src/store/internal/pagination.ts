// The paging parameters the list endpoints put in their query string. Declared
// here instead of imported from types/ so that the store owns every shape it
// sends: the caller's Pagination satisfies this structurally, and the fit is
// checked where the two meet, in the storehook.
export interface Pagination {
  size: number
  skip: number
}

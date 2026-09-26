// The infinitely scrolling lists add a page to their items with an update
// function rather than with a value, so that a page whose list has moved on
// while the page was on its way can be dropped. What a test wants of such a
// call is what the update makes of the items the component was given, which
// is what this answers, one entry per call.
export function updatedItems<T>(
  calls: Array<Array<(current: T[] | undefined) => T[] | undefined>>,
  current: T[] | undefined,
): Array<T[] | undefined> {
  return calls.map((call) => call[0](current))
}

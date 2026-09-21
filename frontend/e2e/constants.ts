export const localUrl = 'http://localhost:5173'

// Every value the tests look for in the database lives here, one constant
// per item of the e2e data set. The data is loaded from the backend with
// `npm run e2e:data` there; the names below are the contract between the two
// sides and have to agree with backend/e2e-data/e2e-data.sql. See
// plan-e2e-test-data.md.
//
// Where a test matches an option of a search box, the option is a pattern
// anchored to the whole label, so that a search finding more than the e2e
// item is a failure rather than a different item being clicked.
//
// The search strings stay ahead of what the suite itself creates:
// add-review.spec.ts and add-storage.spec.ts add beers named
// `e2e test beer <uuid>`, which none of the searches below match.

export const testUsername = 'e2eadmin'
export const testPassword = 'e2eadmin'

export const beerName = 'Aaa E2E Remarkable IPA'
export const beerSearch = 'aaa e2e rema'
// A beer option is `beer (brewery)`.
export const beerOption =
  /^aaa e2e remarkable ipa \(aaa e2e remarkable ales co\)$/i

export const breweryName = 'Aaa E2E Remarkable Ales Co'
export const brewerySearch = 'aaa e2e rem'
export const breweryOption = /^aaa e2e remarkable ales co$/i
export const breweryCountry = 'FI 🇫🇮'

export const styleName = 'Aaa E2E American IPA'
export const styleSearch = 'aaa e2e ameri'
export const styleOption = /^aaa e2e american ipa$/i

export const locationName = 'Aaa E2E Beergarden, Tampere'

// A container is shown as type + ' ' + size.
export const reviewContainer = 'e2e can 0.25'

// The year of the second e2e review, which is dated 2100 so that the annual
// statistics have a year that sorts first whatever else the database holds.
// The year the tests look for is therefore a constant rather than something
// to move up every couple of years. The other review is in 2021, inside the
// time filter's range, and is what the filtered statistics see.
export const reviewYear = '2100'

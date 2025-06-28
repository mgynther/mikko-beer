import { expect, test } from "vitest"
import { formatQuery } from "./search-query"

interface TestCase {
  query: string
  expectedOutput: string
}

const testCases: TestCase[] = [
  {
    query: 'easy query',
    expectedOutput: 'easy query'
  },
  {
    query: ' ',
    expectedOutput: ''
  },
  {
    query: 'trailing space ',
    expectedOutput: 'trailing space'
  },
  {
    query: ' leading space',
    expectedOutput: 'leading space'
  },
  {
    query: ' leading trailing space ',
    expectedOutput: 'leading trailing space'
  },
  {
    query: 'double  space',
    expectedOutput: 'double space'
  },
  {
    query: 'triple   space',
    expectedOutput: 'triple space'
  },
  {
    query: ' a  lot    of   spaces   in    places',
    expectedOutput: 'a lot of spaces in places'
  },
  {
    query: ' tab\treplacement',
    expectedOutput: 'tab replacement'
  },
  {
    query: ' new line\nreplacement',
    expectedOutput: 'new line replacement'
  },
  {
    query: 'all \n\t \r\nsorts',
    expectedOutput: 'all sorts'
  }
]

testCases.forEach(testCase => {
  test(`formats "${testCase.query}" to "${testCase.expectedOutput}"`, () => {
    expect(formatQuery(testCase.query)).toEqual(testCase.expectedOutput)
  })
})

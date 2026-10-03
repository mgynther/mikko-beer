import { test } from '../../test.js'
import { assertEqual, assertThrowsWithMessage } from '../../assert.js'
import { requestUrl } from './request-url.js'

test('give the url of a request that has one', () => {
  assertEqual(requestUrl('/api/v1/beer?page=1'), '/api/v1/beer?page=1')
})

test('throw for a request without a url', () => {
  assertThrowsWithMessage(() => requestUrl(undefined), 'request has no url')
})

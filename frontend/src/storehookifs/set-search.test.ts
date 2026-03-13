import { expect, test, vitest } from 'vitest'

import { createSetSearch } from './set-search'

test('set search', async () => {
  const navigate = vitest.fn()
  const setSearch = createSetSearch({
    useNavigate: () => navigate
  })
  await setSearch('annual', {
    property: 'value',
    'another-property': 'another-value'
  })
  expect(navigate).toHaveBeenCalledWith(
    '?stats=annual&property=value&another-property=another-value',
    { replace: true }
  )
})

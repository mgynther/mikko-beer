import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { useUrlPathParams, useUrlSearchParams } from './url-params'

function Helper(): React.JSX.Element {
  const pathParams = useUrlPathParams()
  const searchParams = useUrlSearchParams()
  return (
    <div>
      <div>{`id: ${pathParams.id ?? 'none'}`}</div>
      <div>{`search: ${searchParams.get('search') ?? 'none'}`}</div>
      <div>{`missing: ${searchParams.get('missing') ?? 'none'}`}</div>
    </div>
  )
}

function renderAt(url: string): { getByText: (text: string) => HTMLElement } {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path='/beer/:id' element={<Helper />} />
        <Route path='/beer' element={<Helper />} />
      </Routes>
    </MemoryRouter>,
  )
}

test('url path and search parameters', () => {
  const { getByText } = renderAt(
    '/beer/b9e0e7a3-1f4a-4b1e-8b1a-2e5c7e7b9d51?search=ipa',
  )
  expect(getByText('id: b9e0e7a3-1f4a-4b1e-8b1a-2e5c7e7b9d51')).toBeDefined()
  expect(getByText('search: ipa')).toBeDefined()
  expect(getByText('missing: none')).toBeDefined()
})

test('url without path or search parameters', () => {
  const { getByText } = renderAt('/beer')
  expect(getByText('id: none')).toBeDefined()
  expect(getByText('search: none')).toBeDefined()
})

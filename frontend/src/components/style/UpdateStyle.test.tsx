import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vitest } from 'vitest'
import UpdateStyle from './UpdateStyle'
import type {
  GetStyleIf,
  ListStylesIf,
  StyleWithParentIds
} from '../../core/style/types'
import type { UseDebounce } from '../../core/types'
import type { SearchIf } from '../../core/search/types'

const dontCall = (): any => {
  throw new Error('must not be called')
}

const useDebounce: UseDebounce<string> = str => [str, false]

const id = '5a416374-4940-44a3-aa85-016b052e4310'
const name = 'Pale Ale'

const parent = {
  id: '9e059dff-4069-4187-9427-8c4134be2a2a',
  name: 'Ale',
  parents: []
}

const otherParent = {
  id: '7d0e6fb2-67df-47a5-92fe-bc814bf7c78c',
  name: 'Lager',
  parents: []
}

const style: StyleWithParentIds = {
  id,
  name,
  parents: [parent.id]
}

const getStyle: GetStyleIf = {
  useGet: () => ({
    style: {
      id,
      name,
      parents: [parent],
      children: []
    },
    isLoading: false
  })
}

const listStyles: ListStylesIf = {
  useList: () => ({
    styles: [parent, otherParent],
    isLoading: false
  })
}

const searchIf: SearchIf = {
  useSearch: () => ({
    activate: () => undefined,
    isActive: true
  }),
  useDebounce
}

test('updates style', async () => {
  const user = userEvent.setup()
  const onSaved = vitest.fn()
  const update = vitest.fn()
  const newName = 'Cream Ale'
  const { getByPlaceholderText, getByRole } = render(
    <UpdateStyle
      getStyleIf={getStyle}
      listStylesIf={listStyles}
      updateStyleIf={{
        useUpdate: () => ({
          update,
          hasError: false,
          isLoading: false,
          isSuccess: true
        })
      }}
      onCancel={dontCall}
      onSaved={onSaved}
      searchIf={searchIf}
      initialStyle={style}
    />
  )
  const nameInput = getByPlaceholderText('Name')
  await user.clear(nameInput)
  await user.type(nameInput, newName)

  const searchInput = getByPlaceholderText('Search style')
  await user.type(searchInput, 'a')
  const otherParentButton = getByRole('button', { name: otherParent.name })
  await user.click(otherParentButton)

  const saveButton = getByRole('button', { name: 'Save' })
  await user.click(saveButton)
  expect(update.mock.calls).toEqual([[{
    id,
    name: newName,
    parents: [parent, otherParent].map(p => p.id)
  }]])
  expect(onSaved.mock.calls).toEqual([[]])
})

test('cancels updating style', async () => {
  const cancel = vitest.fn()
  const { getByRole } = render(
    <UpdateStyle
      getStyleIf={getStyle}
      listStylesIf={listStyles}
      updateStyleIf={{
        useUpdate: () => ({
          update: dontCall,
          hasError: false,
          isLoading: false,
          isSuccess: false
        })
      }}
      onCancel={cancel}
      onSaved={dontCall}
      searchIf={searchIf}
      initialStyle={style}
    />
  )
  const cancelButton = getByRole('button', { name: 'Cancel' })
  cancelButton.click()
  expect(cancel.mock.calls).toEqual([[]])
})

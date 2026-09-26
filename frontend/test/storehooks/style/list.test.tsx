import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import listStyles from '../../../src/storehooks/style/list'
import type {
  StyleList,
  UseListStyles,
  ValidateStyleListOrUndefined,
} from '../../../src/storehooks/style/types'
import { buildStyleWithParentIds } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyleList: StyleList = {
  styles: [buildStyleWithParentIds({ name: 'Validated style' })],
}

const listed = { styles: [{ id: 'listed', name: 'Listed style', parents: [] }] }

interface HelperProps {
  data: unknown
  isLoading: boolean
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreList: UseListStyles = () => ({
    data: props.data,
    isLoading: props.isLoading,
  })
  const validate: ValidateStyleListOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedStyleList
  }
  const { styles, isLoading } = listStyles(useStoreList, validate).useList()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      {styles === undefined && <div>No styles</div>}
      {styles?.map((style) => (
        <div key={style.id}>{style.name}</div>
      ))}
    </div>
  )
}

test('list styles', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper data={listed} isLoading={false} onValidate={onValidate} />,
  )

  // The interface gives out the styles, not the list that carries them.
  expect(getByText(validatedStyleList.styles[0].name)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(listed)
})

test('list styles that have not arrived', () => {
  const { getByText } = render(
    <Helper data={undefined} isLoading={true} onValidate={() => undefined} />,
  )

  expect(getByText('No styles')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
})

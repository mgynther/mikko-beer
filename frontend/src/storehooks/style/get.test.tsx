import { expect, test, vitest } from 'vitest'
import { render } from '@testing-library/react'

import getStyle from './get'
import type {
  StyleWithParentsAndChildren,
  UseGetStyle,
  ValidateStyleWithParentsAndChildrenOrUndefined,
} from './types'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyle: StyleWithParentsAndChildren = {
  id: '8e2fc6bc-3d5f-4a8e-98ef-4a9ec0f7dc6a',
  name: 'Validated style',
  parents: [],
  children: [],
}

const styleId = 'bb6a57f4-f26e-4512-9235-4991ebc00ba9'

interface HelperProps {
  data: unknown
  isLoading: boolean
  onGet: (styleId: string) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreGet: UseGetStyle = (id: string) => {
    props.onGet(id)
    return { data: props.data, isLoading: props.isLoading }
  }
  const validate: ValidateStyleWithParentsAndChildrenOrUndefined = (
    result: unknown,
  ) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedStyle
  }
  const { style, isLoading } = getStyle(useStoreGet, validate).useGet(styleId)
  return (
    <div>
      <div>{style === undefined ? 'No style' : style.name}</div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

test('get style', () => {
  const onGet = vitest.fn()
  const onValidate = vitest.fn()
  const data = { style: { id: styleId, name: 'Test style' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  expect(getByText(validatedStyle.name)).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onGet).toHaveBeenCalledWith(styleId)
  // The envelope is unwrapped before the validator sees the style.
  expect(onValidate).toHaveBeenCalledWith(data.style)
})

test('get style that has not arrived', () => {
  const onValidate = vitest.fn()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  expect(getByText('No style')).toBeDefined()
  expect(getByText('Loading')).toBeDefined()
  expect(onValidate).toHaveBeenCalledWith(undefined)
})

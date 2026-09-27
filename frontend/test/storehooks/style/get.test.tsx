import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getStyle from '../../../src/storehooks/style/get'
import type {
  UseGetStyle,
  ValidateStyleWithParentsAndChildrenOrUndefined,
} from '../../../src/storehooks/style/types'
import { buildStyleWithParentsAndChildren } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyle = buildStyleWithParentsAndChildren({
  name: 'Validated style',
})

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
  const onGet = mockFunction()
  const onValidate = mockFunction()
  const data = { style: { id: styleId, name: 'Test style' } }

  const { getByText } = render(
    <Helper
      data={data}
      isLoading={false}
      onGet={onGet}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText(validatedStyle.name))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onGet, [styleId])
  // The envelope is unwrapped before the validator sees the style.
  assertCalledWith(onValidate, [data.style])
})

test('get style that has not arrived', () => {
  const onValidate = mockFunction()

  const { getByText } = render(
    <Helper
      data={undefined}
      isLoading={true}
      onGet={() => undefined}
      onValidate={onValidate}
    />,
  )

  assertDefined(getByText('No style'))
  assertDefined(getByText('Loading'))
  assertCalledWith(onValidate, [undefined])
})

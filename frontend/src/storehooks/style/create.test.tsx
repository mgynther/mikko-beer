import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import createStyle from './create'
import type {
  CreateStyleRequest,
  Style,
  UseCreateStyle,
  ValidateStyleOrUndefined,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyle: Style = {
  id: 'dc4ee8ed-f0f8-4f0b-a9ba-46b1f3e8c1dd',
  name: 'Validated style',
}

const created = { style: { id: 'created', name: 'Created style' } }

const request: CreateStyleRequest = { name: 'Test style', parents: [] }

interface HelperProps {
  data: unknown
  hasError: boolean
  isSuccess: boolean
  onCreate: (style: CreateStyleRequest) => void
  onValidate: (result: unknown) => void
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreCreate: UseCreateStyle = () => ({
    create: async (style: CreateStyleRequest): Promise<void> => {
      props.onCreate(style)
    },
    data: props.data,
    hasError: props.hasError,
    isLoading: false,
    isSuccess: props.isSuccess,
  })
  const validate: ValidateStyleOrUndefined = (result: unknown) => {
    props.onValidate(result)
    return result === undefined ? undefined : validatedStyle
  }
  const { create, createdStyle, hasError, isLoading, isSuccess } = createStyle(
    useStoreCreate,
    validate,
  ).useCreate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <div>{createdStyle === undefined ? 'No style' : createdStyle.name}</div>
      <button
        type='button'
        onClick={() => {
          create(request).catch(
            createErrorLogger('create failed', console.error),
          )
        }}
      >
        Create
      </button>
    </div>
  )
}

test('create style', async () => {
  const user = setupUser()
  const onCreate = vitest.fn()
  const onValidate = vitest.fn()

  const { getByRole, getByText } = render(
    <Helper
      data={created}
      hasError={false}
      isSuccess={true}
      onCreate={onCreate}
      onValidate={onValidate}
    />,
  )
  expect(getByText(validatedStyle.name)).toBeDefined()
  expect(getByText('Succeeded')).toBeDefined()
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()

  await user.click(getByRole('button', { name: 'Create' }))
  await waitFor(() => {
    expect(onCreate).toHaveBeenCalledWith(request)
  })
  // The envelope is unwrapped before the validator sees the style.
  expect(onValidate).toHaveBeenCalledWith(created.style)
})

test('failed style creation has no created style', () => {
  const { getByText } = render(
    <Helper
      data={undefined}
      hasError={true}
      isSuccess={false}
      onCreate={() => undefined}
      onValidate={() => undefined}
    />,
  )

  expect(getByText('No style')).toBeDefined()
  expect(getByText('Failed')).toBeDefined()
  expect(getByText('Not succeeded')).toBeDefined()
})

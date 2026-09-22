import { expect, test, vitest } from 'vitest'
import { render, waitFor } from '@testing-library/react'

import updateStyle from './update'
import type {
  Style,
  StyleWithParentIds,
  UseUpdateStyle,
  ValidateStyle,
} from './types'
import { setupUser } from '../../../test-util/user-event'
import { createErrorLogger } from '../../../test-util/error-logger'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyle: Style = {
  id: '1a5c2c8b-6f7e-4f03-93b2-0b9e1b7a5f20',
  name: 'Validated style',
}

const updated = { style: { id: 'updated', name: 'Updated style' } }

const style: StyleWithParentIds = {
  id: '8cc5fe99-8f76-4a53-933f-86494dc77e1e',
  name: 'Test style',
  parents: [],
}

interface HelperProps {
  onUpdate: (style: StyleWithParentIds) => void
  onUpdated: () => void
  onError: () => void
  validate: ValidateStyle
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoreUpdate: UseUpdateStyle = () => ({
    update: async (updatedStyle: StyleWithParentIds): Promise<unknown> => {
      props.onUpdate(updatedStyle)
      return updated
    },
    hasError: false,
    isLoading: false,
    isSuccess: true,
  })
  const { update, hasError, isLoading, isSuccess } = updateStyle(
    useStoreUpdate,
    props.validate,
  ).useUpdate()
  return (
    <div>
      <div>{isLoading ? 'Loading' : 'Not loading'}</div>
      <div>{hasError ? 'Failed' : 'Not failed'}</div>
      <div>{isSuccess ? 'Succeeded' : 'Not succeeded'}</div>
      <button
        type='button'
        onClick={() => {
          ;(async (): Promise<void> => {
            try {
              await update(style)
              props.onUpdated()
            } catch {
              props.onError()
            }
          })().catch(createErrorLogger('update failed', console.error))
        }}
      >
        Update
      </button>
    </div>
  )
}

test('update style', async () => {
  const user = setupUser()
  const onUpdate = vitest.fn()
  const onUpdated = vitest.fn()
  const onValidate = vitest.fn()
  const validate: ValidateStyle = (result: unknown) => {
    onValidate(result)
    return validatedStyle
  }

  const { getByRole, getByText } = render(
    <Helper
      onUpdate={onUpdate}
      onUpdated={onUpdated}
      onError={() => undefined}
      validate={validate}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  await waitFor(() => {
    expect(onUpdated).toHaveBeenCalled()
  })
  expect(getByText('Succeeded')).toBeDefined()
  expect(getByText('Not failed')).toBeDefined()
  expect(getByText('Not loading')).toBeDefined()
  expect(onUpdate).toHaveBeenCalledWith(style)
  expect(onValidate).toHaveBeenCalledWith(updated.style)
})

test('fail to update style that does not validate', async () => {
  const user = setupUser()
  const onUpdated = vitest.fn()
  const onError = vitest.fn()

  const { getByRole } = render(
    <Helper
      onUpdate={() => undefined}
      onUpdated={onUpdated}
      onError={onError}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  await user.click(getByRole('button', { name: 'Update' }))
  // A response that does not validate must not be reported as a successful
  // update: the throw propagates out of update and what follows it is never
  // reached.
  await waitFor(() => {
    expect(onError).toHaveBeenCalled()
  })
  expect(onUpdated).not.toHaveBeenCalled()
})

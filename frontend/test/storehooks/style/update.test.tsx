import { test } from '../../test'
import {
  assertCallCount,
  assertCalled,
  assertCalledWith,
  assertDefined,
} from '../../assert'
import { mockFunction } from '../../mock'
import { render, waitFor } from '../../render'

import updateStyle from '../../../src/storehooks/style/update'
import type {
  StyleWithParentIds,
  UseUpdateStyle,
  ValidateStyle,
} from '../../../src/storehooks/style/types'
import { setupUser } from '../../user-event'
import { createErrorLogger } from '../../error-logger'
import { buildStyle, buildStyleWithParentIds } from './builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx.
const validatedStyle = buildStyle()

const updated = { style: { id: 'updated', name: 'Updated style' } }

const style = buildStyleWithParentIds()

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
  const onUpdate = mockFunction<[style: StyleWithParentIds]>()
  const onUpdated = mockFunction<[]>()
  const onValidate = mockFunction<[result: unknown]>()
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
    assertCalled(onUpdated)
  })
  assertDefined(getByText('Succeeded'))
  assertDefined(getByText('Not failed'))
  assertDefined(getByText('Not loading'))
  assertCalledWith(onUpdate, [style])
  assertCalledWith(onValidate, [updated.style])
})

test('fail to update style that does not validate', async () => {
  const user = setupUser()
  const onUpdated = mockFunction<[]>()
  const onError = mockFunction<[]>()

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
    assertCalled(onError)
  })
  assertCallCount(onUpdated, 0)
})

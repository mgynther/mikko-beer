import { test } from '../../test'
import { assertCalledWith, assertDefined } from '../../assert'
import { mockFunction } from '../../mock'
import { render } from '../../render'

import getLogin from '../../../src/storehooks/login/getLogin'
import type {
  StoredLogin,
  UseStoredLogin,
  ValidateStoredLogin,
} from '../../../src/storehooks/login/types'
import { buildUser } from '../user/builders'

// Stubs for the store function and the validator, for the reason given in
// storehooks/brewery/get.test.tsx. The session is read back out of the store
// here, so what this proves is that the stored value goes through the
// validator and that a value the validator rejects is reported as logged out.
const validatedLogin: StoredLogin = {
  user: buildUser({ username: 'validated' }),
}

interface HelperProps {
  stored: unknown
  onValidate: (result: unknown) => void
  validate: ValidateStoredLogin
}

function Helper(props: HelperProps): React.JSX.Element {
  const useStoredLogin: UseStoredLogin = () => props.stored
  const login = getLogin(useStoredLogin, (result: unknown) => {
    props.onValidate(result)
    return props.validate(result)
  })()
  return (
    <div>
      <div>{login.user === undefined ? 'No user' : login.user.username}</div>
    </div>
  )
}

test('get login', () => {
  const onValidate = mockFunction<[result: unknown]>()
  const stored = { user: { username: 'stored' } }

  const { getByText } = render(
    <Helper
      stored={stored}
      onValidate={onValidate}
      validate={() => validatedLogin}
    />,
  )

  assertDefined(getByText('validated'))
  assertCalledWith(onValidate, [stored])
})

test('get logged out when the stored session does not validate', () => {
  // What localStorage held at startup is whatever was in localStorage.
  const { getByText } = render(
    <Helper
      stored={{ user: 1 }}
      onValidate={() => undefined}
      validate={() => {
        throw Error('Could not validate data')
      }}
    />,
  )

  assertDefined(getByText('No user'))
})

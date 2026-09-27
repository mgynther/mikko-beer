import { test } from '../../test'
import { assertDeepEqual } from '../../assert'
import { render } from '../../render'
import Containers from '../../../src/components/container/Containers'
import { Role } from '../../../src/components/types/user/types'
import type { GetLogin } from '../../../src/components/types/login/types'
import type { UpdateContainerIf } from '../../../src/components/types/container/types'
import { loadingIndicatorText } from '../../../src/components/internal/common/LoadingIndicator'
import { buildLogin } from '../types/login/builders'
import { buildUser } from '../types/user/builders'

function getLogin(): GetLogin {
  return () => buildLogin({ user: buildUser({ role: Role.viewer }) })
}

const updateContainerIf: UpdateContainerIf = {
  useUpdate: () => ({
    update: async () => undefined,
    isLoading: false,
  }),
  getLogin: getLogin(),
}

test('renders containers', async () => {
  const { getAllByText, getByText } = render(
    <Containers
      listContainersIf={{
        useList: () => ({
          data: {
            containers: [
              {
                id: 'e3fad94c-2408-4f8f-8e3f-2b2c30ae6bfb',
                type: 'bottle',
                size: '0.33',
              },
              {
                id: 'b56107e2-9e92-4cbd-a0f1-bae25e44caa2',
                type: 'can',
                size: '0.50',
              },
              {
                id: '8537da96-eb9d-4d9c-a348-fdc5ef72a05b',
                type: 'can',
                size: '0.33',
              },
            ],
          },
          isLoading: false,
        }),
      }}
      updateContainerIf={updateContainerIf}
    />,
  )
  getByText('bottle 0.33')
  getByText('can 0.33')
  getByText('can 0.50')
  const listItems = getAllByText(/bottle|can/)
  assertDeepEqual(
    listItems.map((item) => item.innerHTML),
    ['bottle 0.33', 'can 0.33', 'can 0.50'],
  )
})

test('renders loading', async () => {
  const { getByText } = render(
    <Containers
      listContainersIf={{
        useList: () => ({
          data: undefined,
          isLoading: true,
        }),
      }}
      updateContainerIf={updateContainerIf}
    />,
  )
  getByText(loadingIndicatorText)
})

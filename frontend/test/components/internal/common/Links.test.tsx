import { test } from '../../../test'
import { assertDeepEqual } from '../../../assert'
import { mockFunction } from '../../../mock'
import { render } from '../../../render'

import Links from '../../../../src/components/internal/common/Links'
import { testLink } from '../../link'

test('renders links', () => {
  const linkFormattingRequests = mockFunction()
  const id1 = '95b4f459-ea6c-49f3-829a-f5ed6688def6'
  const id2 = '1138ddd1-bb90-4fa9-984b-40266c33a626'
  const { getByRole } = render(
    <Links
      linkComponent={testLink}
      items={[
        {
          id: id1,
          name: '1',
        },
        {
          id: id2,
          name: '2',
        },
      ]}
      linkFormatter={(id: string) => {
        linkFormattingRequests(id)
        return `/testing/${id}`
      }}
    />,
  )
  assertDeepEqual(linkFormattingRequests.mock.calls, [[id1], [id2]])
  getByRole('link', { name: '1' })
  getByRole('link', { name: '2' })
})

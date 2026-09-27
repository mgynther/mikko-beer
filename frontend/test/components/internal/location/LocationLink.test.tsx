import { test } from '../../../test'
import { render } from '../../../render'

import LocationLink from '../../../../src/components/internal/location/LocationLink'
import { testLink } from '../../link'

test('renders brewery links', () => {
  const { getByRole } = render(
    <LocationLink
      linkComponent={testLink}
      location={{
        id: '353cd4be-b9c9-49e4-8de0-d1f1c9b38c7f',
        name: '1',
      }}
    />,
  )
  getByRole('link', { name: '1' })
})

import { test } from '../../../test'
import { assertDeepEqual, assertDefined } from '../../../assert'
import { render } from '../../../render'
import LoadingIndicator, {
  loadingIndicatorText,
} from '../../../../src/components/internal/common/LoadingIndicator'

test('renders loading text', () => {
  const { getByText } = render(<LoadingIndicator isLoading={true} />)
  const text = getByText(loadingIndicatorText)
  assertDefined(text)
})

test('does not render text when not loading', () => {
  const { queryByText } = render(<LoadingIndicator isLoading={false} />)
  const result = queryByText(loadingIndicatorText)
  assertDeepEqual(result, null)
})

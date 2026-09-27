import type { RenderResult } from '../render'
import type { UserEvent } from '../user-event'

export async function openFilters(
  getByRole: RenderResult['getByRole'],
  user: UserEvent,
): Promise<void> {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  await user.click(toggleButton)
}

import type { UserEvent } from '@testing-library/user-event'

export async function openFilters(
  getByRole: (type: string, props: Record<string, string>) => HTMLElement,
  user: UserEvent,
): Promise<void> {
  const toggleButton = getByRole('button', { name: 'Filters ▼' })
  await user.click(toggleButton)
}

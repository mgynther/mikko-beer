import { flagEmoji } from './flag-emoji'

// Name followed by the country flag emoji, for contexts that cannot render a
// component, such as link text. Plain name when the country is unknown.
export function nameWithFlag(
  name: string,
  country: string | undefined,
): string {
  const flag = flagEmoji(country)
  if (flag === undefined) {
    return name
  }
  return `${name} ${flag}`
}

export default nameWithFlag
